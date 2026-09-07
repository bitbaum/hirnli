/**
 * Editing a stored content block as a list of fields.
 *
 * A tenant's story is a nested JSON document with a schema, and the obvious
 * editor for it is a form. The question is where the form's field list comes
 * from. A hand-written list would be readable and would go stale the first time
 * the block grows a section — and a field nobody can reach is a field only a
 * developer can fill, which is the whole failure this migration exists to end.
 *
 * So the field list is derived from the block. Every string in the document is
 * editable, in document order, and a section added tomorrow is editable the day
 * it appears without anyone remembering to extend a list.
 *
 * The safety property matters more than the convenience. Paths arrive from a
 * browser, so `applyFields` accepts a path if and ONLY if `collectFields`
 * reports it — which is exactly the set the form rendered. Everything else
 * follows from that one rule rather than needing its own: an invented key, a
 * non-string leaf, an out-of-range index, a walk through `__proto__`. The
 * schema is checked on top, but a schema alone would not stop a well-typed
 * value being written somewhere it does not belong.
 *
 * The `Object.hasOwn` check in `readField` is belt-and-braces rather than the
 * load-bearing guard: with a block that is plain JSON, an inherited property is
 * never a string and the string requirement already rejects it. It stays
 * because that reasoning depends on the block's contents, and the rule should
 * not.
 */

/** One editable leaf: where it lives, and what it currently says. */
export interface BlockField {
  /** Dotted path with numeric segments for arrays, e.g. `WHY.klima.problem`. */
  path: string;
  value: string;
  /**
   * What the stored value is, so the form can offer the right input and the
   * write can put back the same type.
   *
   * A budget is mostly numbers, and editing them as text would store `"41000"`
   * where the schema wants `41000` — valid-looking JSON that fails validation
   * at the boundary and, without that boundary, would reach a funder as a
   * string that renders fine and sorts wrong.
   */
  kind: 'string' | 'number';
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Every editable leaf in the block — strings and numbers — in document order. */
export function collectFields(block: unknown, prefix = '', out: BlockField[] = []): BlockField[] {
  if (typeof block === 'string') {
    out.push({ path: prefix, value: block, kind: 'string' });
  } else if (typeof block === 'number' && Number.isFinite(block)) {
    out.push({ path: prefix, value: String(block), kind: 'number' });
  } else if (Array.isArray(block)) {
    block.forEach((v, i) => collectFields(v, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (isPlainObject(block)) {
    for (const [k, v] of Object.entries(block)) {
      collectFields(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

/** What kind of value sits at `path`, or undefined if nothing editable does. */
export function fieldKindAt(block: unknown, path: string): BlockField['kind'] | undefined {
  const node = nodeAt(block, path);
  if (typeof node === 'string') return 'string';
  if (typeof node === 'number' && Number.isFinite(node)) return 'number';
  return undefined;
}

/** The value currently at `path` as text, or undefined if not editable. */
export function readField(block: unknown, path: string): string | undefined {
  const node = nodeAt(block, path);
  if (typeof node === 'string') return node;
  if (typeof node === 'number' && Number.isFinite(node)) return String(node);
  return undefined;
}

/** Walk to a path, refusing anything that is not an own property. */
function nodeAt(block: unknown, path: string): unknown {
  let node: unknown = block;
  for (const segment of path.split('.')) {
    if (Array.isArray(node)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= node.length) return undefined;
      node = node[index];
    } else if (isPlainObject(node) && Object.hasOwn(node, segment)) {
      node = node[segment];
    } else {
      return undefined;
    }
  }
  return node;
}

export type ApplyResult =
  { ok: true; block: unknown } | { ok: false; unknownPaths: string[]; badNumbers?: string[] };

/**
 * Return a copy of the block with the given paths replaced.
 *
 * Rejects the whole submission if any path does not already hold a string.
 * Rejecting rather than skipping is deliberate: a silently ignored field is a
 * person's writing thrown away with a success message on top.
 */
export function applyFields(block: unknown, updates: Map<string, string>): ApplyResult {
  const unknownPaths = [...updates.keys()].filter((p) => readField(block, p) === undefined);
  if (unknownPaths.length > 0) return { ok: false, unknownPaths };

  // A field that HELD a number must receive one. Storing "41000" where the
  // schema wants 41000 produces JSON that looks right, fails validation at the
  // boundary, and would otherwise reach a funder as a value that renders fine
  // and sorts wrong.
  const badNumbers = [...updates.entries()]
    .filter(([path, raw]) => fieldKindAt(block, path) === 'number' && !isFiniteNumber(raw))
    .map(([path]) => path);
  if (badNumbers.length > 0) return { ok: false, unknownPaths: [], badNumbers };

  // structuredClone rather than a hand-rolled deep copy: the block is plain
  // JSON by construction (it came out of a jsonb column), and a shallow copy
  // would mutate the caller's object.
  const next = structuredClone(block) as unknown;

  for (const [path, raw] of updates) {
    const value = fieldKindAt(block, path) === 'number' ? Number(raw) : raw;
    const segments = path.split('.');
    const last = segments.pop()!;
    let node: unknown = next;
    for (const segment of segments) {
      node = Array.isArray(node)
        ? node[Number(segment)]
        : (node as Record<string, unknown>)[segment];
    }
    if (Array.isArray(node)) {
      node[Number(last)] = value;
    } else {
      (node as Record<string, unknown>)[last] = value;
    }
  }

  return { ok: true, block: next };
}

/** Accepts what a person types for an amount; rejects blanks and text. */
function isFiniteNumber(raw: string): boolean {
  if (raw.trim() === '') return false;
  return Number.isFinite(Number(raw));
}
