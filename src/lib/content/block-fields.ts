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
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Every string in the block, in document order. */
export function collectFields(block: unknown, prefix = '', out: BlockField[] = []): BlockField[] {
  if (typeof block === 'string') {
    out.push({ path: prefix, value: block });
  } else if (Array.isArray(block)) {
    block.forEach((v, i) => collectFields(v, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (isPlainObject(block)) {
    for (const [k, v] of Object.entries(block)) {
      collectFields(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

/** The string currently at `path`, or undefined if the path is not a string. */
export function readField(block: unknown, path: string): string | undefined {
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
  return typeof node === 'string' ? node : undefined;
}

export type ApplyResult = { ok: true; block: unknown } | { ok: false; unknownPaths: string[] };

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

  // structuredClone rather than a hand-rolled deep copy: the block is plain
  // JSON by construction (it came out of a jsonb column), and a shallow copy
  // would mutate the caller's object.
  const next = structuredClone(block) as unknown;

  for (const [path, value] of updates) {
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
