import { describe, it, expect } from 'vitest';
import {
  APPLICATION_STATUSES,
  STATUS_IDS,
  KANBAN_COLUMNS,
  getStatusConfig,
  isTerminalStatus,
  isActiveApplication,
  getPriorityColor,
  type ApplicationStatusId,
} from '../application-statuses';

// ---------------------------------------------------------------------------
// APPLICATION_STATUSES shape
// ---------------------------------------------------------------------------

describe('APPLICATION_STATUSES', () => {
  it('has at least 10 statuses', () => {
    expect(APPLICATION_STATUSES.length).toBeGreaterThanOrEqual(10);
  });

  it('every status has id, label, description, color, requiredFields', () => {
    for (const s of APPLICATION_STATUSES) {
      expect(s.id, `status ${s.id} missing id`).toBeTruthy();
      expect(s.label, `status ${s.id} missing label`).toBeTruthy();
      expect(s.description, `status ${s.id} missing description`).toBeTruthy();
      expect(s.color, `status ${s.id} missing color`).toBeTruthy();
      expect(Array.isArray(s.requiredFields), `status ${s.id} requiredFields not array`).toBe(true);
    }
  });

  it('all IDs are unique', () => {
    const ids = APPLICATION_STATUSES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes expected lifecycle statuses', () => {
    const ids = APPLICATION_STATUSES.map(s => s.id);
    expect(ids).toContain('prospect');
    expect(ids).toContain('submitted');
    expect(ids).toContain('accepted');
    expect(ids).toContain('rejected');
    expect(ids).toContain('withdrawn');
  });

  it('submitted requires submissionDate', () => {
    const submitted = APPLICATION_STATUSES.find(s => s.id === 'submitted')!;
    const fields = submitted.requiredFields.map(f => f.field);
    expect(fields).toContain('submissionDate');
  });

  it('accepted requires awardedAmount', () => {
    const accepted = APPLICATION_STATUSES.find(s => s.id === 'accepted')!;
    const fields = accepted.requiredFields.map(f => f.field);
    expect(fields).toContain('awardedAmount');
  });

  it('rejected requires rejectionReason', () => {
    const rejected = APPLICATION_STATUSES.find(s => s.id === 'rejected')!;
    const fields = rejected.requiredFields.map(f => f.field);
    expect(fields).toContain('rejectionReason');
  });
});

// ---------------------------------------------------------------------------
// STATUS_IDS
// ---------------------------------------------------------------------------

describe('STATUS_IDS', () => {
  it('contains every id from APPLICATION_STATUSES', () => {
    const configIds = APPLICATION_STATUSES.map(s => s.id);
    for (const id of configIds) {
      expect(STATUS_IDS).toContain(id);
    }
  });

  it('has the same count as APPLICATION_STATUSES', () => {
    expect(STATUS_IDS.length).toBe(APPLICATION_STATUSES.length);
  });
});

// ---------------------------------------------------------------------------
// KANBAN_COLUMNS
// ---------------------------------------------------------------------------

describe('KANBAN_COLUMNS', () => {
  it('does not contain rejected (terminal — not on board)', () => {
    expect(KANBAN_COLUMNS).not.toContain('rejected');
  });

  it('does not contain withdrawn (closed — not on board)', () => {
    expect(KANBAN_COLUMNS).not.toContain('withdrawn');
  });

  it('contains prospect and accepted', () => {
    expect(KANBAN_COLUMNS).toContain('prospect');
    expect(KANBAN_COLUMNS).toContain('accepted');
  });

  it('every column ID is a valid ApplicationStatusId', () => {
    const allIds = STATUS_IDS as readonly string[];
    for (const col of KANBAN_COLUMNS) {
      expect(allIds).toContain(col);
    }
  });
});

// ---------------------------------------------------------------------------
// getStatusConfig
// ---------------------------------------------------------------------------

describe('getStatusConfig', () => {
  it('returns the correct status for prospect', () => {
    const cfg = getStatusConfig('prospect');
    expect(cfg.id).toBe('prospect');
    expect(cfg.label).toBeTruthy();
  });

  it('returns the correct status for accepted', () => {
    const cfg = getStatusConfig('accepted');
    expect(cfg.id).toBe('accepted');
  });

  it('returns the correct status for rejected', () => {
    const cfg = getStatusConfig('rejected');
    expect(cfg.id).toBe('rejected');
  });

  it('every status ID resolves without throwing', () => {
    for (const id of STATUS_IDS) {
      const cfg = getStatusConfig(id);
      expect(cfg.id).toBe(id);
    }
  });
});

// ---------------------------------------------------------------------------
// isTerminalStatus
// ---------------------------------------------------------------------------

describe('isTerminalStatus', () => {
  it('returns true for accepted', () => {
    expect(isTerminalStatus('accepted')).toBe(true);
  });

  it('returns true for rejected', () => {
    expect(isTerminalStatus('rejected')).toBe(true);
  });

  const nonTerminal: ApplicationStatusId[] = [
    'prospect', 'research', 'draft', 'review',
    'submitted', 'pending', 'followup', 'withdrawn', 'onhold',
  ];

  it.each(nonTerminal.map(s => [s]))('returns false for %s', (status) => {
    expect(isTerminalStatus(status as ApplicationStatusId)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isActiveApplication
// ---------------------------------------------------------------------------

describe('isActiveApplication', () => {
  it('returns false for rejected', () => {
    expect(isActiveApplication('rejected')).toBe(false);
  });

  it('returns false for withdrawn', () => {
    expect(isActiveApplication('withdrawn')).toBe(false);
  });

  const active: ApplicationStatusId[] = [
    'prospect', 'research', 'draft', 'review',
    'submitted', 'pending', 'followup', 'accepted', 'onhold',
  ];

  it.each(active.map(s => [s]))('returns true for %s', (status) => {
    expect(isActiveApplication(status as ApplicationStatusId)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getPriorityColor
// ---------------------------------------------------------------------------

describe('getPriorityColor', () => {
  it('returns a non-empty string for null (default fallback)', () => {
    expect(getPriorityColor(null)).toBeTruthy();
  });

  it('returns a non-empty string for priority 1', () => {
    expect(getPriorityColor(1)).toBeTruthy();
  });

  it('returns a non-empty string for priority 2', () => {
    expect(getPriorityColor(2)).toBeTruthy();
  });

  it('returns a non-empty string for priority 3', () => {
    expect(getPriorityColor(3)).toBeTruthy();
  });

  it('returns a non-empty string for priority 4', () => {
    expect(getPriorityColor(4)).toBeTruthy();
  });

  it('returns the same fallback for unknown level as for null', () => {
    expect(getPriorityColor(99)).toBe(getPriorityColor(null));
  });

  it('each priority level returns a distinct color class', () => {
    const colors = [1, 2, 3, 4].map(getPriorityColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(4);
  });
});
