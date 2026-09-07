/**
 * Which content blocks a customer can edit, and what each one is for.
 *
 * A registry rather than a page per block. The story editor was written for
 * `stories` alone, and the budget would have been a second copy of the same
 * page with a different schema imported at the top — two places to fix the
 * concurrency handling, two places to get the field walk right, and a third
 * when the next block arrives.
 *
 * Adding a block here makes it editable. That is the whole extension point.
 */

import type { ZodType } from 'zod';
import { storiesBlockSchema } from './stories-source';
import { budgetBlockSchema } from '@/lib/schemas/budget';
import { STARTER_STORIES } from './starter-content';
import { STARTER_BUDGET } from './starter-budget';
import type { ContentKey } from './org-content';

export interface EditableBlock {
  key: ContentKey;
  label: string;
  /** What this block decides, in the customer's terms rather than the schema's. */
  hint: string;
  schema: ZodType<unknown>;
  /** What a customer starts from when they have nothing. */
  starter: unknown;
}

export const EDITABLE_BLOCKS: readonly EditableBlock[] = [
  {
    key: 'stories',
    label: 'Geschichte',
    hint: 'Warum Ihre Arbeit nötig ist, was Sie können und was Sie erreicht haben. Jedes Gesuch wird daraus zusammengestellt.',
    schema: storiesBlockSchema,
    starter: STARTER_STORIES,
  },
  {
    key: 'budget',
    label: 'Budget',
    hint: 'Was das Vorhaben kostet und wie viel Sie über drei Jahre selbst tragen. Ohne diese Angaben erscheint im Gesuch kein Budgetteil.',
    schema: budgetBlockSchema,
    starter: STARTER_BUDGET,
  },
] as const;

export function editableBlock(key: string): EditableBlock | undefined {
  return EDITABLE_BLOCKS.find((b) => b.key === key);
}
