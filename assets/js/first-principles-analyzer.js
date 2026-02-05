/**
 * First Principles Number Analyzer
 * 
 * Breaks down every number to its fundamental components:
 * - What is it? (Definition)
 * - Where does it come from? (Source)
 * - How is it calculated? (Formula)
 * - What assumptions are made? (Assumptions)
 * - What are the constraints? (Limitations)
 * - Why does it matter? (Context)
 * - How reliable is it? (Confidence)
 */

const FirstPrinciplesAnalyzer = {
  /**
   * Analyzes a number using first principles thinking
   * Returns complete breakdown of what the number really means
   */
  analyze(numberKey, value, context = {}) {
    const source = NumberSources[numberKey];
    if (!source) {
      return {
        error: 'Number source not found',
        numberKey,
        value
      };
    }

    // Build complete first principles breakdown
    const analysis = {
      // Identity
      id: source.id,
      name: source.name,
      value: value,
      formattedValue: this.formatValue(value, source.format),
      
      // Fundamental Truth: What is this number?
      definition: {
        what: source.documentation?.description || 'No description available',
        category: source.category,
        dimension: source.dimension,
        whyItMatters: this.getWhyItMatters(source),
        unit: source.format
      },
      
      // Source of Truth: Where does it come from?
      source: {
        type: source.source.type, // source | derived | estimated | target
        confidence: source.source.confidence || 'unknown',
        path: source.source.path || null,
        account: source.source.account || null,
        dataSource: source.source.dataSource || null,
        lastUpdated: source.source.lastUpdated || null,
        updatedBy: source.source.updatedBy || null,
        traceability: this.getTraceability(source)
      },
      
      // Calculation: How is it computed?
      calculation: {
        type: source.formula?.type || 'unknown',
        expression: source.formula?.expression || null,
        dependencies: source.formula?.dependencies || [],
        formulaExplanation: this.explainFormula(source),
        stepByStep: this.getCalculationSteps(source, value, context)
      },
      
      // Assumptions: What are we assuming?
      assumptions: {
        explicit: source.source.assumption ? [source.source.assumption] : [],
        implicit: this.getImplicitAssumptions(source),
        tested: source.documentation?.testedAssumptions || [],
        untested: source.documentation?.untestedAssumptions || []
      },
      
      // Constraints: What limits this number?
      constraints: {
        limitations: source.documentation?.limitations || [],
        dataGaps: this.getDataGaps(source),
        systemConstraints: this.getSystemConstraints(source),
        legalConstraints: this.getLegalConstraints(source)
      },
      
      // Validation: Is it correct?
      validation: {
        status: this.validateNumber(source, value),
        rules: source.validation?.rules || [],
        crossChecks: this.getCrossChecks(source, value, context),
        warnings: this.getWarnings(source, value),
        errors: this.getErrors(source, value)
      },
      
      // Context: What does this mean?
      context: {
        historical: this.getHistoricalContext(source, value, context),
        comparison: this.getComparisons(source, value, context),
        trends: this.getTrends(source, value, context),
        benchmarks: this.getBenchmarks(source),
        impact: this.getImpact(source, value)
      },
      
      // Reliability: How much can we trust it?
      reliability: {
        confidence: source.source.confidence,
        confidenceExplanation: this.explainConfidence(source),
        uncertainty: this.getUncertainty(source, value),
        dataQuality: this.getDataQuality(source),
        recommendations: this.getRecommendations(source)
      },
      
      // Transparency: Full audit trail
      transparency: {
        canBeVerified: this.canBeVerified(source),
        verificationSteps: this.getVerificationSteps(source),
        auditTrail: source.history || [],
        changeLog: this.getChangeLog(source),
        relatedNumbers: this.getRelatedNumbers(source)
      }
    };

    return analysis;
  },

  /**
   * Explains why this number matters (First Principles: What problem does it solve?)
   */
  getWhyItMatters(source) {
    const whyMap = {
      'financial_total_2025': 'Gesamteinnahmen zeigen ob Organisation finanziell nachhaltig ist. Ohne Einnahmen keine Mission.',
      'financial_self_financing_2025': 'Eigenfinanzierung zeigt Unabhängigkeit von Spenden. >70% = nachhaltig, <40% = gefährlich abhängig.',
      'devices_estimated_2025': 'Geräteanzahl ist Basis für alle Umwelt-KPIs. Ohne exakte Zahlen = alles Schätzung.',
      'co2_total_2025': 'CO₂-Einsparung ist Kernargument für Fördergeber. Muss nachvollziehbar sein.',
      'erfolgsquote_40': 'Erfolgsquote zeigt ob soziale Mission funktioniert. Kern-KPI für Impact-Reporting.'
    };
    
    return whyMap[source.id] || source.documentation?.whyItMatters || 'Impact not documented';
  },

  /**
   * Gets traceability path (can we trace back to original source?)
   */
  getTraceability(source) {
    const trace = [];
    
    if (source.source.path) {
      trace.push({
        step: 'Original Source',
        location: source.source.path,
        type: 'file',
        verifiable: true
      });
    }
    
    if (source.source.account) {
      trace.push({
        step: 'Accounting Entry',
        location: `Kivitendo Konto ${source.source.account}`,
        type: 'system',
        verifiable: true
      });
    }
    
    if (source.formula?.dependencies) {
      source.formula.dependencies.forEach(dep => {
        trace.push({
          step: 'Dependency',
          location: dep,
          type: 'calculated',
          verifiable: NumberSources[dep] ? true : false
        });
      });
    }
    
    return trace;
  },

  /**
   * Explains formula in human-readable terms
   */
  explainFormula(source) {
    if (!source.formula) return 'No formula (direct source data)';
    
    const explanations = {
      'sum': `Summe aller Werte`,
      'average': `Durchschnitt aller Werte`,
      'count': `Anzahl der Einträge`,
      'custom': source.formula.expression || 'Custom calculation'
    };
    
    return explanations[source.formula.type] || source.formula.expression || 'Formula not explained';
  },

  /**
   * Gets step-by-step calculation breakdown
   */
  getCalculationSteps(source, value, context) {
    if (source.source.type === 'source') {
      return [
        { step: 1, description: 'Daten aus Kivitendo exportiert', value: 'Excel-Datei' },
        { step: 2, description: 'In Datenbank importiert', value: 'SQLite/JSON' },
        { step: 3, description: 'Im Dashboard angezeigt', value: value }
      ];
    }
    
    if (source.formula?.type === 'custom' && source.formula.expression) {
      // Parse formula and show steps
      const steps = [];
      const deps = source.formula.dependencies || [];
      
      deps.forEach((dep, i) => {
        const depValue = context[dep] || '?';
        steps.push({
          step: i + 1,
          description: `Wert von ${dep}`,
          value: depValue,
          source: NumberSources[dep]?.name || dep
        });
      });
      
      steps.push({
        step: deps.length + 1,
        description: `Berechnung: ${source.formula.expression}`,
        value: value,
        formula: source.formula.expression
      });
      
      return steps;
    }
    
    return [{ step: 1, description: 'Calculation', value: value }];
  },

  /**
   * Gets implicit assumptions (things we assume but don't state)
   */
  getImplicitAssumptions(source) {
    const assumptions = [];
    
    if (source.source.type === 'estimated') {
      assumptions.push('Geschätzte Werte sind repräsentativ für tatsächliche Werte');
    }
    
    if (source.formula?.dependencies) {
      assumptions.push('Alle Abhängigkeiten sind korrekt und aktuell');
    }
    
    if (source.source.confidence === 'low') {
      assumptions.push('Niedrige Konfidenz bedeutet mögliche Abweichungen');
    }
    
    return assumptions;
  },

  /**
   * Gets data gaps (what data is missing?)
   */
  getDataGaps(source) {
    const gaps = [];
    
    if (source.id === 'devices_estimated_2025') {
      gaps.push({
        gap: 'Exakte Geräte-Stückzahlen',
        impact: 'Hoch - alle Umwelt-KPIs basieren auf Schätzung',
        solution: 'Device-Tracking in Kivitendo einführen',
        priority: 'Kritisch'
      });
    }
    
    if (source.source.type === 'estimated') {
      gaps.push({
        gap: 'Echte Quelldaten fehlen',
        impact: 'Mittel - Zahl ist unsicher',
        solution: 'Systematische Datenerfassung einführen',
        priority: 'Hoch'
      });
    }
    
    return gaps;
  },

  /**
   * Gets system constraints (what limits this number?)
   */
  getSystemConstraints(source) {
    const constraints = [];
    
    if (source.source.path?.includes('Kivitendo')) {
      constraints.push({
        constraint: 'Kivitendo ist Legacy-System (Perl, veraltet)',
        impact: 'Keine API, nur CSV-Export möglich',
        workaround: 'Manueller Export 2x täglich'
      });
    }
    
    if (source.source.type === 'derived' && source.formula?.dependencies) {
      constraints.push({
        constraint: 'Abhängig von anderen Zahlen',
        impact: 'Fehler kaskadieren',
        workaround: 'Cross-Validation implementieren'
      });
    }
    
    return constraints;
  },

  /**
   * Gets legal/regulatory constraints
   */
  getLegalConstraints(source) {
    // For financial numbers, there might be accounting rules
    if (source.category === 'financial') {
      return [
        {
          constraint: 'Schweizer Rechnungslegungsstandards (OR)',
          impact: 'Buchhaltung muss korrekt sein',
          compliance: 'Kivitendo erfüllt OR-Anforderungen'
        }
      ];
    }
    
    return [];
  },

  /**
   * Validates number against rules
   */
  validateNumber(source, value) {
    if (!source.validation?.rules) return 'no_rules';
    
    for (const rule of source.validation.rules) {
      if (rule.type === 'range') {
        if (value < rule.min || value > rule.max) {
          return 'invalid';
        }
      }
    }
    
    return 'valid';
  },

  /**
   * Gets cross-checks with related numbers
   */
  getCrossChecks(source, value, context) {
    const checks = [];
    
    // Example: Total should equal sum of categories
    if (source.id === 'financial_total_2025') {
      const warenverkauf = context['financial_warenverkauf_2025'] || 0;
      const dienstleistungen = context['financial_dienstleistungen_2025'] || 0;
      const spenden = context['financial_spenden_2025'] || 0;
      const sum = warenverkauf + dienstleistungen + spenden;
      const diff = Math.abs(value - sum);
      
      checks.push({
        check: 'Total = Summe aller Kategorien',
        expected: sum,
        actual: value,
        difference: diff,
        status: diff < 100 ? 'pass' : 'fail', // CHF 100 tolerance
        explanation: diff < 100 ? 'Konsistent' : 'Abweichung - möglicher Fehler'
      });
    }
    
    return checks;
  },

  /**
   * Gets warnings for this number
   */
  getWarnings(source, value) {
    const warnings = [];
    
    if (source.source.confidence === 'low') {
      warnings.push({
        level: 'medium',
        message: 'Niedrige Konfidenz - Zahl ist unsicher',
        recommendation: 'Datenqualität verbessern'
      });
    }
    
    if (source.source.type === 'estimated') {
      warnings.push({
        level: 'high',
        message: 'Geschätzte Zahl - nicht exakt',
        recommendation: 'Echte Daten erfassen'
      });
    }
    
    if (source.validation?.rules) {
      source.validation.rules.forEach(rule => {
        if (rule.type === 'warning') {
          warnings.push({
            level: 'medium',
            message: rule.message,
            recommendation: rule.recommendation || 'Prüfen'
          });
        }
      });
    }
    
    return warnings;
  },

  /**
   * Gets errors for this number
   */
  getErrors(source, value) {
    const errors = [];
    
    if (!source.source.path && source.source.type === 'source') {
      errors.push({
        level: 'critical',
        message: 'Quelle nicht dokumentiert',
        fix: 'Source path hinzufügen'
      });
    }
    
    const validation = this.validateNumber(source, value);
    if (validation === 'invalid') {
      errors.push({
        level: 'high',
        message: 'Wert außerhalb erwartetem Bereich',
        fix: 'Daten prüfen'
      });
    }
    
    return errors;
  },

  /**
   * Gets historical context (how has this changed over time?)
   */
  getHistoricalContext(source, value, context) {
    // This would compare with previous years/periods
    return {
      previousPeriod: context.previousValue || null,
      change: context.previousValue ? value - context.previousValue : null,
      changePercent: context.previousValue ? ((value - context.previousValue) / context.previousValue * 100) : null,
      trend: context.trend || 'unknown'
    };
  },

  /**
   * Gets comparisons (how does this compare to targets/benchmarks?)
   */
  getComparisons(source, value, context) {
    const comparisons = [];
    
    // Compare to targets if available
    if (source.documentation?.target) {
      comparisons.push({
        type: 'target',
        target: source.documentation.target,
        actual: value,
        gap: value - source.documentation.target,
        status: value >= source.documentation.target ? 'meets' : 'below'
      });
    }
    
    // Compare to previous year
    if (context.previousYear) {
      comparisons.push({
        type: 'year_over_year',
        previous: context.previousYear,
        current: value,
        change: value - context.previousYear,
        changePercent: ((value - context.previousYear) / context.previousYear * 100)
      });
    }
    
    return comparisons;
  },

  /**
   * Gets trends (what direction is this moving?)
   */
  getTrends(source, value, context) {
    if (!context.historical || context.historical.length < 2) {
      return { trend: 'insufficient_data', message: 'Nicht genug historische Daten' };
    }
    
    const recent = context.historical.slice(-3);
    const earlier = context.historical.slice(0, 3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    if (recentAvg > earlierAvg * 1.1) {
      return { trend: 'increasing', message: 'Stark steigend', confidence: 'high' };
    } else if (recentAvg < earlierAvg * 0.9) {
      return { trend: 'decreasing', message: 'Rückläufig', confidence: 'high' };
    } else {
      return { trend: 'stable', message: 'Stabil', confidence: 'medium' };
    }
  },

  /**
   * Gets industry benchmarks
   */
  getBenchmarks(source) {
    const benchmarks = {
      'financial_self_financing_2025': {
        benchmark: 70,
        source: 'Zielwert Revamp-IT',
        comparison: 'Ziel: >70% für Nachhaltigkeit'
      },
      'financial_monthly_avg_2025': {
        benchmark: 10000,
        source: 'Zielwert Revamp-IT',
        comparison: 'Ziel: CHF 8-12k/Monat'
      }
    };
    
    return benchmarks[source.id] || null;
  },

  /**
   * Gets impact (what does this number affect?)
   */
  getImpact(source, value) {
    const impacts = {
      'financial_total_2025': {
        affects: ['Liquidität', 'Möglichkeit zu investieren', 'Unabhängigkeit'],
        critical: true,
        message: 'Ohne Einnahmen keine Mission möglich'
      },
      'financial_self_financing_2025': {
        affects: ['Nachhaltigkeit', 'Fundraising-Bedarf', 'Unabhängigkeit'],
        critical: true,
        message: 'Niedrige Eigenfinanzierung = hohe Spendenabhängigkeit'
      },
      'devices_estimated_2025': {
        affects: ['Alle Umwelt-KPIs', 'Impact-Reporting', 'Fundraising'],
        critical: true,
        message: 'Basis für CO₂, E-Waste, alle ökologischen Metriken'
      }
    };
    
    return impacts[source.id] || {
      affects: ['Unknown'],
      critical: false,
      message: 'Impact not documented'
    };
  },

  /**
   * Explains confidence level
   */
  explainConfidence(source) {
    const explanations = {
      'high': 'Direkt aus Quelldaten, verifizierbar in Original-Datei',
      'medium': 'Berechnet aus Quelldaten mit dokumentierter Formel',
      'low': 'Geschätzt basierend auf Annahmen, unsicher',
      'target': 'Zielwert, nicht aktueller Wert'
    };
    
    return explanations[source.source.confidence] || 'Confidence not explained';
  },

  /**
   * Gets uncertainty range
   */
  getUncertainty(source, value) {
    if (source.source.confidence === 'high') {
      return { min: value * 0.99, max: value * 1.01, explanation: '±1% (Rundungsfehler)' };
    } else if (source.source.confidence === 'medium') {
      return { min: value * 0.95, max: value * 1.05, explanation: '±5% (Berechnungsunsicherheit)' };
    } else if (source.source.confidence === 'low') {
      return { min: value * 0.8, max: value * 1.2, explanation: '±20% (Schätzungsunsicherheit)' };
    }
    
    return { min: value, max: value, explanation: 'Unknown' };
  },

  /**
   * Gets data quality assessment
   */
  getDataQuality(source) {
    let score = 100;
    const issues = [];
    
    if (source.source.type === 'estimated') score -= 30;
    if (source.source.confidence === 'low') score -= 20;
    if (!source.source.path) score -= 15;
    if (source.documentation?.limitations?.length > 0) score -= 10;
    
    if (score < 50) issues.push('Datenqualität kritisch');
    if (score < 70) issues.push('Datenqualität verbesserungsfähig');
    
    return {
      score: Math.max(0, score),
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      issues: issues
    };
  },

  /**
   * Gets recommendations for improvement
   */
  getRecommendations(source) {
    const recommendations = [];
    
    if (source.source.type === 'estimated') {
      recommendations.push({
        priority: 'high',
        action: 'Echte Daten erfassen statt zu schätzen',
        impact: 'Erhöht Konfidenz von "low" auf "high"'
      });
    }
    
    if (source.documentation?.improvements) {
      source.documentation.improvements.forEach(improvement => {
        recommendations.push({
          priority: 'medium',
          action: improvement,
          impact: 'Verbessert Datenqualität oder Genauigkeit'
        });
      });
    }
    
    return recommendations;
  },

  /**
   * Checks if number can be verified
   */
  canBeVerified(source) {
    if (source.source.path) return true;
    if (source.source.account) return true;
    if (source.formula?.dependencies?.every(dep => NumberSources[dep])) return true;
    return false;
  },

  /**
   * Gets step-by-step verification instructions
   */
  getVerificationSteps(source) {
    const steps = [];
    
    if (source.source.path) {
      steps.push({
        step: 1,
        action: 'Öffne Quelldatei',
        location: source.source.path,
        expected: 'Excel/CSV-Datei mit Original-Daten'
      });
    }
    
    if (source.source.account) {
      steps.push({
        step: steps.length + 1,
        action: 'Prüfe Kivitendo Konto',
        location: `Konto ${source.source.account}`,
        expected: 'Buchhaltungseinträge'
      });
    }
    
    if (source.formula) {
      steps.push({
        step: steps.length + 1,
        action: 'Berechne nach Formel',
        formula: source.formula.expression,
        expected: 'Resultat sollte mit angezeigtem Wert übereinstimmen'
      });
    }
    
    return steps;
  },

  /**
   * Gets change log
   */
  getChangeLog(source) {
    return source.history || [
      {
        date: source.source.lastUpdated || 'Unknown',
        value: 'Current',
        changedBy: source.source.updatedBy || 'System',
        reason: 'Initial value'
      }
    ];
  },

  /**
   * Gets related numbers (what other numbers depend on this or affect this?)
   */
  getRelatedNumbers(source) {
    const related = [];
    
    // Find numbers that depend on this one
    Object.values(NumberSources).forEach(other => {
      if (other.formula?.dependencies?.includes(source.id)) {
        related.push({
          relationship: 'depends_on_this',
          number: other.id,
          name: other.name
        });
      }
    });
    
    // Find numbers this depends on
    if (source.formula?.dependencies) {
      source.formula.dependencies.forEach(dep => {
        const depSource = NumberSources[dep];
        if (depSource) {
          related.push({
            relationship: 'depends_on',
            number: dep,
            name: depSource.name
          });
        }
      });
    }
    
    return related;
  },

  /**
   * Formats value according to type
   */
  formatValue(value, format) {
    if (format === 'CHF') return Utils.formatCHF(value);
    if (format === 'percent') return Utils.formatPercent(value);
    if (format === 'integer') return Math.round(value).toLocaleString('de-CH');
    if (format === 'tonnes') return `${(value / 1000).toFixed(1)} t`;
    if (format === 'kg') return `${Math.round(value)} kg`;
    return value.toLocaleString('de-CH');
  }
};
