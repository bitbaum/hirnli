import { describe, it, expect } from 'vitest';
import { initFieldsFromApplication, buildPatchPayload } from '../useApplicationForm';
import type { Application } from '@/lib/db/schema';

// ---------------------------------------------------------------------------
// Minimal Application fixture
// ---------------------------------------------------------------------------

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: 'test-id',
    foundationId: 'test-foundation',
    status: 'prospect',
    requestedAmount: null,
    projectFocus: null,
    customizationNotes: null,
    contactDate: null,
    submissionDate: null,
    decisionExpected: null,
    decisionDate: null,
    awardedAmount: null,
    fundingPeriod: null,
    successFactors: null,
    rejectionReason: null,
    gesuchVersion: null,
    documentsSent: null,
    assignedTo: null,
    priorityLevel: null,
    orgId: 'revamp-it',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// initFieldsFromApplication
// ---------------------------------------------------------------------------

describe('initFieldsFromApplication', () => {
  it('maps status directly', () => {
    const f = initFieldsFromApplication(makeApp({ status: 'submitted' }));
    expect(f.status).toBe('submitted');
  });

  it('converts requestedAmount to string', () => {
    const f = initFieldsFromApplication(makeApp({ requestedAmount: 50000 }));
    expect(f.requestedAmount).toBe('50000');
  });

  it('converts null requestedAmount to empty string', () => {
    const f = initFieldsFromApplication(makeApp({ requestedAmount: null }));
    expect(f.requestedAmount).toBe('');
  });

  it('converts awardedAmount to string', () => {
    const f = initFieldsFromApplication(makeApp({ awardedAmount: 25000 }));
    expect(f.awardedAmount).toBe('25000');
  });

  it('converts null awardedAmount to empty string', () => {
    const f = initFieldsFromApplication(makeApp({ awardedAmount: null }));
    expect(f.awardedAmount).toBe('');
  });

  it('converts priorityLevel to string', () => {
    const f = initFieldsFromApplication(makeApp({ priorityLevel: 2 }));
    expect(f.priorityLevel).toBe('2');
  });

  it('converts null priorityLevel to empty string', () => {
    const f = initFieldsFromApplication(makeApp({ priorityLevel: null }));
    expect(f.priorityLevel).toBe('');
  });

  it('passes through assignedTo string', () => {
    const f = initFieldsFromApplication(makeApp({ assignedTo: 'Georg' }));
    expect(f.assignedTo).toBe('Georg');
  });

  it('converts null assignedTo to empty string', () => {
    const f = initFieldsFromApplication(makeApp({ assignedTo: null }));
    expect(f.assignedTo).toBe('');
  });

  it('normalizes ISO datetime contactDate to date-only', () => {
    const f = initFieldsFromApplication(makeApp({ contactDate: '2026-05-04T14:30:00.000Z' }));
    expect(f.contactDate).toBe('2026-05-04');
  });

  it('passes through date-only contactDate unchanged', () => {
    const f = initFieldsFromApplication(makeApp({ contactDate: '2026-05-04' }));
    expect(f.contactDate).toBe('2026-05-04');
  });

  it('converts null contactDate to empty string', () => {
    const f = initFieldsFromApplication(makeApp({ contactDate: null }));
    expect(f.contactDate).toBe('');
  });

  it('normalizes submissionDate, decisionExpected, decisionDate the same way', () => {
    const f = initFieldsFromApplication(makeApp({
      submissionDate: '2026-03-01T00:00:00Z',
      decisionExpected: null,
      decisionDate: '2026-06-15',
    }));
    expect(f.submissionDate).toBe('2026-03-01');
    expect(f.decisionExpected).toBe('');
    expect(f.decisionDate).toBe('2026-06-15');
  });

  it('passes through rejectionReason and successFactors', () => {
    const f = initFieldsFromApplication(makeApp({
      rejectionReason: 'Nicht passend',
      successFactors: 'Guter Fit',
    }));
    expect(f.rejectionReason).toBe('Nicht passend');
    expect(f.successFactors).toBe('Guter Fit');
  });

  it('returns all 13 expected form fields', () => {
    const f = initFieldsFromApplication(makeApp());
    const expected = [
      'status', 'requestedAmount', 'awardedAmount', 'priorityLevel',
      'assignedTo', 'projectFocus', 'customizationNotes',
      'contactDate', 'submissionDate', 'decisionExpected', 'decisionDate',
      'rejectionReason', 'successFactors',
    ];
    for (const key of expected) {
      expect(key in f, `missing field: ${key}`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// buildPatchPayload
// ---------------------------------------------------------------------------

describe('buildPatchPayload', () => {
  const emptyFields = {
    status: 'prospect' as const,
    requestedAmount: '',
    awardedAmount: '',
    priorityLevel: '',
    assignedTo: '',
    projectFocus: '',
    customizationNotes: '',
    contactDate: '',
    submissionDate: '',
    decisionExpected: '',
    decisionDate: '',
    rejectionReason: '',
    successFactors: '',
  };

  it('passes status through', () => {
    const p = buildPatchPayload({ ...emptyFields, status: 'submitted' });
    expect(p.status).toBe('submitted');
  });

  it('converts requestedAmount string to number', () => {
    const p = buildPatchPayload({ ...emptyFields, requestedAmount: '50000' });
    expect(p.requestedAmount).toBe(50000);
  });

  it('converts empty requestedAmount to null', () => {
    const p = buildPatchPayload({ ...emptyFields, requestedAmount: '' });
    expect(p.requestedAmount).toBeNull();
  });

  it('converts awardedAmount string to number', () => {
    const p = buildPatchPayload({ ...emptyFields, awardedAmount: '25000' });
    expect(p.awardedAmount).toBe(25000);
  });

  it('converts empty awardedAmount to null', () => {
    const p = buildPatchPayload(emptyFields);
    expect(p.awardedAmount).toBeNull();
  });

  it('converts priorityLevel string to number', () => {
    const p = buildPatchPayload({ ...emptyFields, priorityLevel: '2' });
    expect(p.priorityLevel).toBe(2);
  });

  it('converts empty priorityLevel to null', () => {
    const p = buildPatchPayload(emptyFields);
    expect(p.priorityLevel).toBeNull();
  });

  it('converts empty assignedTo to null', () => {
    const p = buildPatchPayload(emptyFields);
    expect(p.assignedTo).toBeNull();
  });

  it('passes through non-empty assignedTo', () => {
    const p = buildPatchPayload({ ...emptyFields, assignedTo: 'Georg' });
    expect(p.assignedTo).toBe('Georg');
  });

  it('converts empty contactDate to null', () => {
    const p = buildPatchPayload(emptyFields);
    expect(p.contactDate).toBeNull();
  });

  it('passes through non-empty contactDate', () => {
    const p = buildPatchPayload({ ...emptyFields, contactDate: '2026-05-04' });
    expect(p.contactDate).toBe('2026-05-04');
  });

  it('converts all empty text fields to null', () => {
    const p = buildPatchPayload(emptyFields);
    expect(p.projectFocus).toBeNull();
    expect(p.customizationNotes).toBeNull();
    expect(p.submissionDate).toBeNull();
    expect(p.decisionExpected).toBeNull();
    expect(p.decisionDate).toBeNull();
    expect(p.rejectionReason).toBeNull();
    expect(p.successFactors).toBeNull();
  });

  it('passes through all non-empty text fields', () => {
    const p = buildPatchPayload({
      ...emptyFields,
      projectFocus: 'Hub',
      customizationNotes: 'Notes',
      submissionDate: '2026-04-01',
      rejectionReason: 'Grund',
      successFactors: 'Faktoren',
    });
    expect(p.projectFocus).toBe('Hub');
    expect(p.customizationNotes).toBe('Notes');
    expect(p.submissionDate).toBe('2026-04-01');
    expect(p.rejectionReason).toBe('Grund');
    expect(p.successFactors).toBe('Faktoren');
  });
});
