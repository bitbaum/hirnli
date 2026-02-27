/**
 * Budget PDF Section
 *
 * Mirrors components/gesuch/BudgetSection.tsx for @react-pdf/renderer.
 * 3-year financing model, year 1 detail, financing plan.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import type { BudgetLineItem } from '@/lib/schemas/budget';
import type { ThemeKey } from '@/lib/config/stories';
import { getThemedLabel } from '@/lib/domain/budget-calculations';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { styles, COLORS, pdfFormatCHF } from './styles';

interface BudgetPDFProps {
  dok: ComposedGesuchDokument;
}

function LineItemRows({ items, total, themeKey }: { items: BudgetLineItem[]; total: number; themeKey?: ThemeKey }) {
  return (
    <>
      {items.map((item) => {
        const themed = getThemedLabel(item, themeKey);
        return (
          <View key={item.id} style={styles.tableRow}>
            <View style={{ flex: 3 }}>
              <Text style={[styles.small, { fontWeight: 'bold' }]}>
                {item.icon} {themed.label}
              </Text>
              <Text style={[styles.muted]}>{themed.description}</Text>
              {item.subItems && item.subItems.length > 0 && (
                <View style={{ marginTop: 2, marginLeft: 8 }}>
                  {item.subItems.map((sub, idx) => (
                    <Text key={idx} style={styles.muted}>
                      {sub.label}: {pdfFormatCHF(sub.amount)}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            <Text style={[styles.small, { width: 60, textAlign: 'right' }]}>
              {pdfFormatCHF(item.amount)}
            </Text>
            <Text style={[styles.muted, { width: 30, textAlign: 'right' }]}>
              {Math.round((item.amount / total) * 100)}%
            </Text>
          </View>
        );
      })}
    </>
  );
}

export default function BudgetPDF({ dok }: BudgetPDFProps) {
  const themeKey = dok.budget.primaryThemeKey;
  const einmalig = dok.budget.lineItems.filter((m) => m.type === 'einmalig');
  const jaehrlich = dok.budget.lineItems.filter((m) => m.type === 'jaehrlich');
  const einmaligTotal = einmalig.reduce((sum, m) => sum + m.amount, 0);
  const jaehrlichTotal = jaehrlich.reduce((sum, m) => sum + m.amount, 0);
  const year1Total = einmaligTotal + jaehrlichTotal;
  const eigenleistung = dok.budget.scenario.threeYearModel.year1.eigenleistung;
  const remaining = year1Total - eigenleistung - dok.budget.requestedAmount;

  return (
    <View>
      <Text style={styles.h2}>Budget und Finanzierungsplan</Text>
      <Text style={styles.subtitle}>
        {dok.budget.projectDuration} | Gesamtbedarf 3 Jahre: {pdfFormatCHF(dok.budget.project3yTotal)}
      </Text>

      {/* 3-Year Model */}
      <Text style={[styles.h3, { marginTop: 4 }]}>3-Jahres-Finanzmodell (degressiv)</Text>
      <View>
        {/* Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.small, { flex: 2, fontWeight: 'bold' }]} />
          {dok.budget.threeYearModel.map((y) => (
            <View key={y.year} style={{ width: 65, alignItems: 'flex-end' }}>
              <Text style={[styles.small, { fontWeight: 'bold' }]}>{y.year}</Text>
              <Text style={styles.muted}>{y.label}</Text>
            </View>
          ))}
          <Text style={[styles.small, { width: 65, textAlign: 'right', fontWeight: 'bold' }]}>Total</Text>
        </View>

        {/* Einmalige Investitionen */}
        <View style={styles.tableRow}>
          <Text style={[styles.small, { flex: 2 }]}>Einmalige Investitionen</Text>
          {dok.budget.threeYearModel.map((y) => (
            <Text key={y.year} style={[styles.small, { width: 65, textAlign: 'right' }]}>
              {y.einmalig > 0 ? pdfFormatCHF(y.einmalig) : '\u2014'}
            </Text>
          ))}
          <Text style={[styles.small, { width: 65, textAlign: 'right', fontWeight: 'bold' }]}>
            {pdfFormatCHF(einmaligTotal)}
          </Text>
        </View>

        {/* Stiftungsfinanzierung */}
        <View style={styles.tableRow}>
          <Text style={[styles.small, { flex: 2 }]}>Stiftungsfinanzierung (jährlich)</Text>
          {dok.budget.threeYearModel.map((y) => (
            <Text key={y.year} style={[styles.small, { width: 65, textAlign: 'right' }]}>
              {pdfFormatCHF(y.stiftungen)}
            </Text>
          ))}
          <Text style={[styles.small, { width: 65, textAlign: 'right', fontWeight: 'bold' }]}>
            {pdfFormatCHF(dok.budget.threeYearModel.reduce((s, y) => s + y.stiftungen, 0))}
          </Text>
        </View>

        {/* Eigenleistung */}
        <View style={[styles.tableRow, { backgroundColor: COLORS.bgGreen }]}>
          <Text style={[styles.small, { flex: 2, fontWeight: 'bold', color: COLORS.greenText }]}>
            Eigenleistung {ORG_PROFILE.name}
          </Text>
          {dok.budget.threeYearModel.map((y) => (
            <Text key={y.year} style={[styles.small, { width: 65, textAlign: 'right', color: COLORS.greenText }]}>
              {pdfFormatCHF(y.eigen)}
            </Text>
          ))}
          <Text style={[styles.small, { width: 65, textAlign: 'right', fontWeight: 'bold', color: COLORS.greenText }]}>
            {pdfFormatCHF(dok.budget.eigen3yTotal)}
          </Text>
        </View>

        {/* Total */}
        <View style={styles.tableTotalRow}>
          <Text style={[styles.small, { flex: 2, fontWeight: 'bold' }]}>Total pro Jahr</Text>
          {dok.budget.threeYearModel.map((y) => (
            <Text key={y.year} style={[styles.small, { width: 65, textAlign: 'right', fontWeight: 'bold' }]}>
              {pdfFormatCHF(y.total)}
            </Text>
          ))}
          <Text style={[styles.small, { width: 65, textAlign: 'right', fontWeight: 'bold' }]}>
            {pdfFormatCHF(dok.budget.project3yTotal)}
          </Text>
        </View>
      </View>

      <Text style={[styles.muted, styles.mb12, { marginTop: 4 }]}>
        Stiftungsanteil sinkt von {Math.round((dok.budget.threeYearModel[0].stiftungen + dok.budget.threeYearModel[0].einmalig) / dok.budget.threeYearModel[0].total * 100)}% (Jahr 1) auf {Math.round(dok.budget.threeYearModel[2].stiftungen / dok.budget.threeYearModel[2].total * 100)}% (Jahr 3).
        Eigenleistung = bewertete Freiwilligenarbeit (Stunden x CHF 35/h), kein Cashflow. Wächst durch Community-Aufbau und Hub-Betrieb.
      </Text>

      {/* Year 1 detail */}
      <Text style={styles.h3}>Budgetdetail Jahr 1 ({pdfFormatCHF(year1Total)})</Text>
      <View style={[styles.infoBox, { marginBottom: 8 }]}>
        <Text style={styles.muted}>
          <Text style={{ fontWeight: 'bold' }}>Szenario:</Text> {dok.budget.scenario.label} — {dok.budget.scenario.description}
        </Text>
      </View>

      {/* Line items table */}
      <View>
        {/* Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.small, { flex: 3, fontWeight: 'bold' }]}>Position</Text>
          <Text style={[styles.small, { width: 60, textAlign: 'right', fontWeight: 'bold' }]}>Betrag</Text>
          <Text style={[styles.small, { width: 30, textAlign: 'right', fontWeight: 'bold' }]}>%</Text>
        </View>

        {/* Einmalige */}
        <View style={[styles.tableRow, { backgroundColor: COLORS.bgLight }]}>
          <Text style={[styles.small, { flex: 3, fontWeight: 'bold' }]}>Einmalige Investitionen</Text>
          <Text style={[styles.small, { width: 60 }]} />
          <Text style={[styles.muted, { width: 30, textAlign: 'right' }]}>{pdfFormatCHF(einmaligTotal)}</Text>
        </View>
        <LineItemRows items={einmalig} total={year1Total} themeKey={themeKey} />

        {/* Jährliche */}
        <View style={[styles.tableRow, { backgroundColor: COLORS.bgLight }]}>
          <Text style={[styles.small, { flex: 3, fontWeight: 'bold' }]}>Jährliche Kosten</Text>
          <Text style={[styles.small, { width: 60 }]} />
          <Text style={[styles.muted, { width: 30, textAlign: 'right' }]}>{pdfFormatCHF(jaehrlichTotal)}</Text>
        </View>
        <LineItemRows items={jaehrlich} total={year1Total} themeKey={themeKey} />

        {/* Total */}
        <View style={styles.tableTotalRow}>
          <Text style={[styles.small, { flex: 3, fontWeight: 'bold' }]}>Gesamtbedarf Jahr 1</Text>
          <Text style={[styles.small, { width: 60, textAlign: 'right', fontWeight: 'bold' }]}>
            {pdfFormatCHF(year1Total)}
          </Text>
          <Text style={[styles.small, { width: 30, textAlign: 'right', fontWeight: 'bold' }]}>100%</Text>
        </View>
      </View>

      {/* Financing plan */}
      <Text style={[styles.h3, { marginTop: 12 }]}>Finanzierungsplan</Text>
      <View>
        <View style={styles.tableRow}>
          <View style={{ flex: 3 }}>
            <Text style={styles.small}>Eigenleistung {ORG_PROFILE.name}</Text>
            <Text style={styles.muted}>
              Erlöse Geräteverkauf, IT-Dienstleistungen, Infrastruktur und Freiwilligenarbeit
            </Text>
          </View>
          <Text style={[styles.small, { width: 60, textAlign: 'right' }]}>
            {pdfFormatCHF(eigenleistung)}
          </Text>
          <Text style={[styles.muted, { width: 30, textAlign: 'right' }]}>
            {Math.round((eigenleistung / year1Total) * 100)}%
          </Text>
        </View>

        <View style={[styles.tableRow, { backgroundColor: COLORS.bgBlue }]}>
          <Text style={[styles.small, { flex: 3, fontWeight: 'bold', color: COLORS.primary }]}>
            Beantragt bei {dok.foundation.name}
          </Text>
          <Text style={[styles.small, { width: 60, textAlign: 'right', fontWeight: 'bold', color: COLORS.primary }]}>
            {pdfFormatCHF(dok.budget.requestedAmount)}
          </Text>
          <Text style={[styles.small, { width: 30, textAlign: 'right', color: COLORS.primary }]}>
            {Math.round((dok.budget.requestedAmount / year1Total) * 100)}%
          </Text>
        </View>

        {remaining > 0 && (
          <View style={styles.tableRow}>
            <Text style={[styles.small, { flex: 3, color: COLORS.textMuted }]}>
              Weitere Stiftungen und Partner (beantragt/geplant)
            </Text>
            <Text style={[styles.small, { width: 60, textAlign: 'right', color: COLORS.textMuted }]}>
              {pdfFormatCHF(remaining)}
            </Text>
            <Text style={[styles.muted, { width: 30, textAlign: 'right' }]}>
              {Math.round((remaining / year1Total) * 100)}%
            </Text>
          </View>
        )}

        <View style={styles.tableTotalRow}>
          <Text style={[styles.small, { flex: 3, fontWeight: 'bold' }]}>Total Finanzierung Jahr 1</Text>
          <Text style={[styles.small, { width: 60, textAlign: 'right', fontWeight: 'bold' }]}>
            {pdfFormatCHF(year1Total)}
          </Text>
          <Text style={[styles.small, { width: 30, textAlign: 'right', fontWeight: 'bold' }]}>100%</Text>
        </View>
      </View>
    </View>
  );
}
