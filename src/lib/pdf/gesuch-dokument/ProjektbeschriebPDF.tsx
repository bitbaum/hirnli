/**
 * Projektbeschrieb (Project Description) PDF Section
 *
 * Mirrors components/gesuch/ProjektbeschriebSection.tsx for @react-pdf/renderer.
 * 5 parts: Zusammenfassung, Ausgangslage, Trägerschaft, Zielsetzung, Wirkungsmessung.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { GESUCH_TEXT, findEvidence } from '@/lib/config/stories';
import { extractPurposeCore } from '@/lib/domain/bridge-composer';
import { styles, COLORS } from './styles';

interface ProjektbeschriebPDFProps {
  dok: ComposedGesuchDokument;
}

export default function ProjektbeschriebPDF({ dok }: ProjektbeschriebPDFProps) {
  return (
    <View>
      {/* Section title */}
      <Text style={styles.h2}>Projektbeschrieb</Text>
      <Text style={styles.subtitle}>
        {dok.organization.organization.name} — Fördergesuch an {dok.foundation.name}
      </Text>

      {/* 1. Zusammenfassung */}
      <View style={styles.mb12}>
        <Text style={styles.h3}>1. Zusammenfassung</Text>
        {dok.foundation.purposeSummary && (
          <Text style={styles.paragraph}>
            Die {dok.foundation.name} fördert{' '}
            {extractPurposeCore(dok.foundation.purposeSummary!).toLowerCase()}. {dok.tenant.name}{' '}
            adressiert dieses Anliegen direkt:
          </Text>
        )}
        <Text style={styles.paragraph}>
          {GESUCH_TEXT.zusammenfassung_intro}
          {dok.story.why ? ` ${dok.story.why.solution}` : ''}
        </Text>
      </View>

      {/* 2. Ausgangslage / Problem */}
      {dok.story.why && (
        <View style={styles.mb12}>
          <Text style={styles.h3}>2. Ausgangslage und Problemstellung</Text>
          <Text style={styles.paragraph}>{dok.story.why.problem}</Text>
          {dok.story.evidence.length > 0 && (
            <Text style={styles.muted}>
              Quellen: {dok.story.evidence.map((e) => `${e.title} (${e.year})`).join('; ')}
            </Text>
          )}
        </View>
      )}

      {/* Anecdotes */}
      {dok.anecdotes.why.length > 0 && (
        <View style={[styles.highlightBox, styles.mb12]}>
          <Text style={[styles.small, { fontWeight: 'bold', marginBottom: 4 }]}>
            Aus der Praxis
          </Text>
          {dok.anecdotes.why.map((a) => (
            <Text key={a.id} style={[styles.paragraph, { fontStyle: 'italic' }]}>
              {a.template}
            </Text>
          ))}
        </View>
      )}

      {/* 3. Trägerschaft und Kompetenzen */}
      <View style={styles.mb12}>
        <Text style={styles.h3}>3. Trägerschaft und Kompetenzen</Text>
        <Text style={styles.paragraph}>{dok.story.how.track_record.text}</Text>

        {/* Proof points as inline grid */}
        {dok.story.how.track_record.proof_points.length > 0 && (
          <View style={[styles.row, { flexWrap: 'wrap', marginBottom: 8 }]}>
            {dok.story.how.track_record.proof_points.map((pp) => (
              <View
                key={pp.label}
                style={{
                  width: '25%',
                  paddingVertical: 4,
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: COLORS.primary,
                    textAlign: 'center',
                  }}
                >
                  {pp.value}
                </Text>
                <Text style={{ fontSize: 7, color: COLORS.textMuted, textAlign: 'center' }}>
                  {pp.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Competencies */}
        {dok.story.how.competencies.length > 0 && (
          <View style={[styles.row, { flexWrap: 'wrap', marginTop: 4 }]}>
            {dok.story.how.competencies.map((comp) => (
              <View key={comp.headline} style={{ width: '50%', paddingRight: 8, marginBottom: 8 }}>
                <Text style={[styles.small, { fontWeight: 'bold', marginBottom: 2 }]}>
                  {comp.headline}
                </Text>
                {comp.capabilities.slice(0, 4).map((c) => (
                  <Text key={c} style={[styles.small, { color: COLORS.textLight }]}>
                    {'\u2022  '}
                    {c}
                  </Text>
                ))}
                {comp.evidence && comp.evidence.length > 0 && (
                  <Text style={[styles.muted, { marginTop: 2 }]}>
                    Quellen:{' '}
                    {comp.evidence
                      .map((key) => findEvidence(key))
                      .filter((e): e is NonNullable<typeof e> => e !== null)
                      .map((e) => `${e.title} (${e.year})`)
                      .join('; ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* HOW anecdote */}
        {dok.anecdotes.how.length > 0 && (
          <View style={styles.highlightBox}>
            {dok.anecdotes.how.map((a) => (
              <Text key={a.id} style={[styles.paragraph, { fontStyle: 'italic' }]}>
                {a.template}
              </Text>
            ))}
          </View>
        )}

        {/* Partner highlights */}
        {dok.partnerHighlights.length > 0 && (
          <View style={[styles.infoBox, { marginTop: 4 }]}>
            <Text style={[styles.small, { fontWeight: 'bold', marginBottom: 4 }]}>
              Referenz-Partnerschaften
            </Text>
            {dok.partnerHighlights.map((p) => (
              <View key={p.name} style={{ marginBottom: 4 }}>
                <Text style={styles.paragraph}>
                  <Text style={{ fontWeight: 'bold' }}>{p.name}:</Text> {p.relationship}
                </Text>
                <Text style={styles.muted}>{p.since}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 4. Zielsetzung und Massnahmen */}
      {dok.story.projects.length > 0 && (
        <View style={styles.mb12}>
          <Text style={styles.h3}>4. Zielsetzung und Massnahmen</Text>
          {dok.story.projects.map((project) => (
            <View key={project.title} style={styles.mb8}>
              <Text style={[styles.paragraph, { fontWeight: 'bold' }]}>{project.title}</Text>
              <Text style={[styles.paragraph, { color: COLORS.textLight }]}>{project.summary}</Text>

              <View style={[styles.row, { marginTop: 4 }]}>
                {/* Ziele */}
                <View style={{ width: '33%', paddingRight: 4 }}>
                  <Text
                    style={[
                      styles.small,
                      { fontWeight: 'bold', color: COLORS.primary, marginBottom: 2 },
                    ]}
                  >
                    Ziele
                  </Text>
                  {project.goals.map((g) => (
                    <Text key={g} style={[styles.small, { color: COLORS.textLight }]}>
                      {'\u2022  '}
                      {g}
                    </Text>
                  ))}
                </View>
                {/* Massnahmen */}
                <View style={{ width: '33%', paddingHorizontal: 4 }}>
                  <Text
                    style={[
                      styles.small,
                      { fontWeight: 'bold', color: COLORS.accent, marginBottom: 2 },
                    ]}
                  >
                    Massnahmen
                  </Text>
                  {project.activities.map((a) => (
                    <Text key={a} style={[styles.small, { color: COLORS.textLight }]}>
                      {'\u2022  '}
                      {a}
                    </Text>
                  ))}
                </View>
                {/* Erwartete Wirkung */}
                <View style={{ width: '33%', paddingLeft: 4 }}>
                  <Text
                    style={[
                      styles.small,
                      { fontWeight: 'bold', color: COLORS.secondary, marginBottom: 2 },
                    ]}
                  >
                    Erwartete Wirkung
                  </Text>
                  {project.outcomes.map((o) => (
                    <Text key={o} style={[styles.small, { color: COLORS.textLight }]}>
                      {'\u2022  '}
                      {o}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 5. Wirkungsmessung */}
      <View style={styles.mb12}>
        <Text style={styles.h3}>5. Wirkungsmessung und Nachhaltigkeit</Text>
        <Text style={styles.paragraph}>{GESUCH_TEXT.wirkungsmessung.indicators}</Text>
        <Text style={styles.paragraph}>{GESUCH_TEXT.wirkungsmessung.sustainability}</Text>
      </View>
    </View>
  );
}
