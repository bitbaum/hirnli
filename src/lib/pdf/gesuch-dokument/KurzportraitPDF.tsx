/**
 * Kurzportrait (Organization Portrait) PDF Section
 *
 * Mirrors components/gesuch/KurzportraitSection.tsx for @react-pdf/renderer.
 * Facts grid, activities, unique selling points, online transparency.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { GESUCH_TEXT } from '@/lib/config/stories';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { styles, COLORS } from './styles';

interface KurzportraitPDFProps {
  dok: ComposedGesuchDokument;
}

export default function KurzportraitPDF({ dok }: KurzportraitPDFProps) {
  return (
    <View>
      <Text style={styles.h2}>Kurzportrait {ORG_PROFILE.name}</Text>
      <Text style={styles.subtitle}>{GESUCH_TEXT.kurzportrait_subtitle}</Text>

      {/* Facts grid — 2 columns */}
      <View style={[styles.row, { flexWrap: 'wrap', marginBottom: 12 }]}>
        {dok.kurzportrait.facts.map((fact) => (
          <View key={fact.label} style={{
            width: '50%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
            paddingVertical: 3,
            paddingRight: 12,
          }}>
            <Text style={[styles.small, { color: COLORS.textMuted }]}>{fact.label}</Text>
            <Text style={[styles.small, { fontWeight: 'bold' }]}>{fact.value}</Text>
          </View>
        ))}
      </View>

      {/* Activities */}
      <View style={styles.mb8}>
        <Text style={[styles.small, { fontWeight: 'bold', marginBottom: 4 }]}>Tätigkeitsfelder</Text>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          {dok.kurzportrait.activities.map((a) => (
            <Text key={a} style={[styles.small, { width: '50%', color: COLORS.textLight }]}>
              {'\u2022  '}{a}
            </Text>
          ))}
        </View>
      </View>

      {/* Unique selling points */}
      <View style={styles.mb8}>
        <Text style={[styles.small, { fontWeight: 'bold', marginBottom: 4 }]}>Alleinstellungsmerkmale</Text>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          {dok.kurzportrait.unique.map((u) => (
            <Text key={u} style={[styles.small, { width: '50%', color: COLORS.textLight }]}>
              {'\u2022  '}{u}
            </Text>
          ))}
        </View>
      </View>

      {/* Online transparency */}
      <View style={[styles.highlightBox, { marginTop: 4 }]}>
        <Text style={[styles.small, { fontWeight: 'bold', marginBottom: 4 }]}>Online-Transparenz</Text>
        <Text style={[styles.small, { color: COLORS.textLight }]}>
          Alle Kennzahlen, Finanzdaten und Wirkungsindikatoren sind öffentlich einsehbar
          unter {ORG_PROFILE.platform.url.replace('https://', '')}. Jede Zahl ist bis zur Quelle nachvollziehbar.
        </Text>
        <Text style={[styles.small, { color: COLORS.textLight, marginTop: 4 }]}>
          Personalisierte Projektübersicht: {dok.landingPageUrl}
        </Text>
      </View>
    </View>
  );
}
