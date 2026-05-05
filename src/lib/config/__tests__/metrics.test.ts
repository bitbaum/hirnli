import { describe, it, expect } from 'vitest';
import {
  NumberSources,
  SOURCE_TYPE_MAP,
  metricToInspectorData,
} from '../metrics';

// ---------------------------------------------------------------------------
// NumberSources shape
// ---------------------------------------------------------------------------

describe('NumberSources', () => {
  it('has entries', () => {
    expect(Object.keys(NumberSources).length).toBeGreaterThan(0);
  });

  it('every entry has required fields', () => {
    for (const [key, metric] of Object.entries(NumberSources)) {
      expect(metric.id, `${key} missing id`).toBeTruthy();
      expect(metric.name, `${key} missing name`).toBeTruthy();
      expect(metric.category, `${key} missing category`).toBeTruthy();
      expect(metric.source.type, `${key} missing source.type`).toBeTruthy();
      expect(metric.source.confidence, `${key} missing source.confidence`).toBeTruthy();
    }
  });

  it('every entry id matches its registry key', () => {
    for (const [key, metric] of Object.entries(NumberSources)) {
      expect(metric.id).toBe(key);
    }
  });
});

// ---------------------------------------------------------------------------
// SOURCE_TYPE_MAP
// ---------------------------------------------------------------------------

describe('SOURCE_TYPE_MAP', () => {
  it('maps source → live', () => {
    expect(SOURCE_TYPE_MAP.source).toBe('live');
  });

  it('maps derived → derived', () => {
    expect(SOURCE_TYPE_MAP.derived).toBe('derived');
  });

  it('maps estimated → estimated', () => {
    expect(SOURCE_TYPE_MAP.estimated).toBe('estimated');
  });

  it('maps calculated → derived', () => {
    expect(SOURCE_TYPE_MAP.calculated).toBe('derived');
  });

  it('maps target → derived', () => {
    expect(SOURCE_TYPE_MAP.target).toBe('derived');
  });

  it('maps capacity → derived', () => {
    expect(SOURCE_TYPE_MAP.capacity).toBe('derived');
  });
});

// ---------------------------------------------------------------------------
// metricToInspectorData
// ---------------------------------------------------------------------------

const sampleMetric = NumberSources['financial_total_2025'];

describe('metricToInspectorData', () => {
  it('maps label from metric.name', () => {
    const d = metricToInspectorData(sampleMetric, 'CHF 60402');
    expect(d.label).toBe(sampleMetric.name);
  });

  it('passes value through', () => {
    const d = metricToInspectorData(sampleMetric, 'CHF 42');
    expect(d.value).toBe('CHF 42');
  });

  it('maps sourceType via SOURCE_TYPE_MAP', () => {
    const d = metricToInspectorData(sampleMetric, '0');
    expect(d.sourceType).toBe(SOURCE_TYPE_MAP[sampleMetric.source.type]);
  });

  it('maps source from metric.source.path', () => {
    const d = metricToInspectorData(sampleMetric, '0');
    expect(d.source).toBe(sampleMetric.source.path);
  });

  it('falls back to "Berechnet" when source.path is undefined', () => {
    const metricWithoutPath = {
      ...sampleMetric,
      source: { ...sampleMetric.source, path: undefined },
    };
    const d = metricToInspectorData(metricWithoutPath, '0');
    expect(d.source).toBe('Berechnet');
  });

  it('maps confidence from metric.source.confidence', () => {
    const d = metricToInspectorData(sampleMetric, '0');
    expect(d.confidence).toBe(sampleMetric.source.confidence);
  });

  it('maps description from metric.documentation.description', () => {
    const d = metricToInspectorData(sampleMetric, '0');
    expect(d.description).toBe(sampleMetric.documentation.description);
  });

  it('uses metric formula expression when no override provided', () => {
    const d = metricToInspectorData(sampleMetric, '0');
    expect(d.formula).toBe(sampleMetric.formula?.expression);
  });

  it('overrides formula when options.formula is provided', () => {
    const d = metricToInspectorData(sampleMetric, '0', { formula: 'custom calc' });
    expect(d.formula).toBe('custom calc');
  });

  it('replaces 2025 in label when year option is provided', () => {
    const d = metricToInspectorData(sampleMetric, '0', { year: 2024 });
    expect(d.label).toContain('2024');
    expect(d.label).not.toContain('2025');
  });

  it('replaces 2025 in source when year option is provided', () => {
    const metricWith2025Path = {
      ...sampleMetric,
      source: { ...sampleMetric.source, path: 'some/path/2025/data.xlsx' },
    } as typeof sampleMetric;
    const d = metricToInspectorData(metricWith2025Path, '0', { year: 2023 });
    expect(d.source).toContain('2023');
    expect(d.source).not.toContain('2025');
  });

  it('does not modify label when no year option', () => {
    const d = metricToInspectorData(sampleMetric, '0');
    expect(d.label).toBe(sampleMetric.name);
  });

  it('replaces 2025 in description when year option is provided', () => {
    const metricWith2025Desc = {
      ...sampleMetric,
      documentation: { ...sampleMetric.documentation, description: 'Daten für 2025' },
    } as typeof sampleMetric;
    const d = metricToInspectorData(metricWith2025Desc, '0', { year: 2022 });
    expect(d.description).toContain('2022');
    expect(d.description).not.toContain('2025');
  });

  it('maps account from metric.source.account', () => {
    const d = metricToInspectorData(sampleMetric, '0');
    expect(d.account).toBe(sampleMetric.source.account);
  });
});
