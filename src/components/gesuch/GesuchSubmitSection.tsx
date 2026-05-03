/**
 * GesuchSubmitSection — Method-specific submission guidance for Step 3
 *
 * Shows different UI depending on how the foundation accepts applications:
 * - email:   Copyable email body + mailto link
 * - online:  Form link + "was du wo einträgst" field mapping
 * - post:    Formatted address + copy button
 * - contact/unknown: Website link + suggested approach
 *
 * Always shows: response time expectation, deadline countdown.
 */

'use client';

import { useState } from 'react';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { APPLICATION_METHOD_LABELS } from '@/lib/config/foundations';
import type { ApplicationMethod } from '@/lib/schemas/foundation';
import { MS_PER_DAY, DEADLINE_UPCOMING_DAYS } from '@/lib/utils/time';

export interface SubmissionInfo {
  foundationName: string;
  email?: string;
  applicationUrl?: string;
  applicationMethod?: ApplicationMethod;
  deadline?: string | null;
  deadlineText?: string;
  websiteUrl?: string;
  responseTime?: string;
  contactAddress?: string;
  emailBody?: string;
}

function daysUntil(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / MS_PER_DAY);
}

function CopyButton({ text, label = 'Kopieren' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-muted hover:border-primary/40 hover:text-primary transition-colors"
    >
      {copied ? '✓ Kopiert' : label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
      {children}
    </p>
  );
}

/** Response time + deadline block — shown for all methods */
function TimingBlock({ info }: { info: SubmissionInfo }) {
  const days = info.deadline ? daysUntil(info.deadline) : null;
  const deadlineUrgent = days !== null && days <= DEADLINE_UPCOMING_DAYS;

  if (!info.responseTime && !info.deadlineText && days === null) return null;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-bg-light p-4">
      {info.responseTime && (
        <div>
          <SectionLabel>Antwortzeit</SectionLabel>
          <p className="text-sm text-text">Antwort erwartet in: <span className="font-medium">{info.responseTime}</span></p>
        </div>
      )}
      {(info.deadlineText || days !== null) && (
        <div>
          <SectionLabel>Eingabeschluss</SectionLabel>
          {info.deadlineText && <p className="text-sm text-text">{info.deadlineText}</p>}
          {days !== null && (
            <p className={`text-sm font-semibold ${deadlineUrgent ? 'text-danger' : 'text-text-muted'}`}>
              {days > 0
                ? `Noch ${days} Tag${days === 1 ? '' : 'e'}`
                : days === 0
                  ? 'Heute'
                  : `Abgelaufen (vor ${Math.abs(days)} Tag${Math.abs(days) === 1 ? '' : 'en'})`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** email method */
function EmailBlock({ info }: { info: SubmissionInfo }) {
  const subject = `Fördergesuch ${ORG_PROFILE.name}`;
  const mailtoHref = info.email
    ? `mailto:${info.email}?subject=${encodeURIComponent(subject)}${info.emailBody ? `&body=${encodeURIComponent(info.emailBody)}` : ''}`
    : undefined;

  return (
    <div className="space-y-4">
      {info.email && (
        <div>
          <SectionLabel>Empfänger</SectionLabel>
          <p className="text-sm text-text font-medium">{info.email}</p>
          {mailtoHref && (
            <a
              href={mailtoHref}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              E-Mail-Programm öffnen →
            </a>
          )}
        </div>
      )}

      {info.emailBody && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <SectionLabel>Begleit-E-Mail</SectionLabel>
            <CopyButton text={info.emailBody} label="Text kopieren" />
          </div>
          <pre className="whitespace-pre-wrap rounded-lg border border-border bg-bg p-4 text-sm leading-relaxed text-text font-sans">
            {info.emailBody}
          </pre>
          <p className="mt-1.5 text-sm text-text-muted">
            Gesuch-PDF aus Schritt 3 beilegen. Betreff: <span className="font-mono">{subject}</span>
          </p>
        </div>
      )}

      <div>
        <SectionLabel>Absender</SectionLabel>
        <p className="text-sm text-text">{ORG_PROFILE.name}</p>
        <a href={`mailto:${ORG_PROFILE.email}`} className="text-sm text-primary hover:underline">
          {ORG_PROFILE.email}
        </a>
      </div>
    </div>
  );
}

/** online form method */
function OnlineBlock({ info }: { info: SubmissionInfo }) {
  const fieldMap = [
    { label: 'Organisation / Antragsteller', value: ORG_PROFILE.name },
    { label: 'Rechtsform', value: ORG_PROFILE.legalForm },
    { label: 'Adresse', value: ORG_PROFILE.address },
    { label: 'E-Mail', value: ORG_PROFILE.email },
    { label: 'Website', value: ORG_PROFILE.website },
    { label: 'Projektname / Titel', value: `${ORG_PROFILE.name} — ${ORG_PROFILE.missionSummary}` },
    { label: 'Beantragte Fördersumme', value: 'Siehe Gesuch-PDF (Budgetseite)' },
    { label: 'Projektbeschrieb', value: 'Aus Gesuch-PDF (Projektbeschrieb)' },
    { label: 'Gemeinnützigkeit', value: `Ja — ${ORG_PROFILE.taxExemption}` },
  ];

  return (
    <div className="space-y-4">
      {info.applicationUrl && (
        <div>
          <SectionLabel>Online-Formular</SectionLabel>
          <a
            href={info.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Formular öffnen ↗
          </a>
        </div>
      )}

      <div>
        <SectionLabel>Was du wo einträgst</SectionLabel>
        <div className="rounded-lg border border-border overflow-hidden">
          {fieldMap.map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 px-3 py-2 even:bg-bg-light border-b border-border last:border-0">
              <span className="text-sm font-medium text-text-muted sm:shrink-0 sm:w-44">{label}</span>
              <span className="text-sm text-text sm:text-right">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-sm text-text-muted">
          Vollständiges Gesuch als PDF-Anhang hochladen wo möglich.
        </p>
      </div>
    </div>
  );
}

/** post method */
function PostBlock({ info }: { info: SubmissionInfo }) {
  const fullAddress = info.contactAddress
    ? `${info.foundationName}\n${info.contactAddress}`
    : info.foundationName;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <SectionLabel>Postadresse</SectionLabel>
          <CopyButton text={fullAddress} label="Adresse kopieren" />
        </div>
        <pre className="whitespace-pre-wrap rounded-lg border border-border bg-bg p-4 text-sm font-sans text-text leading-relaxed">
          {fullAddress}
        </pre>
      </div>
      <p className="text-sm text-text-muted">
        Gesuch als gebundenes Dokument (oder lose Blätter in Mappe) per A-Post senden.
        Einschreiben empfohlen falls Fristnachweis nötig.
      </p>
      <div>
        <SectionLabel>Absender</SectionLabel>
        <p className="text-sm text-text">{ORG_PROFILE.name}</p>
        <p className="text-sm text-text-muted">{ORG_PROFILE.address}</p>
      </div>
    </div>
  );
}

/** contact / unknown method */
function ContactBlock({ info }: { info: SubmissionInfo }) {
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Vorgehen</SectionLabel>
        <p className="text-sm text-text leading-relaxed">
          Diese Stiftung bevorzugt eine direkte Kontaktaufnahme vor dem Einreichen eines Gesuchs.
          Schreib eine kurze E-Mail und frag, ob ein Gesuch willkommen ist.
        </p>
      </div>
      {info.websiteUrl && (
        <div>
          <SectionLabel>Website</SectionLabel>
          <a
            href={info.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {info.foundationName} →
          </a>
        </div>
      )}
      {info.email && (
        <div>
          <SectionLabel>Kontakt</SectionLabel>
          <a
            href={`mailto:${info.email}?subject=Anfrage: Fördergesuch ${ORG_PROFILE.name}`}
            className="text-sm text-primary hover:underline"
          >
            {info.email}
          </a>
        </div>
      )}
    </div>
  );
}

export default function GesuchSubmitSection({ info }: { info: SubmissionInfo }) {
  const method = info.applicationMethod;

  const methodLabel = method ? APPLICATION_METHOD_LABELS[method] : null;

  return (
    <div className="space-y-4 print:hidden">
      {methodLabel && (
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-bg-light px-2.5 py-0.5 text-xs font-medium text-text-muted">
            {methodLabel}
          </span>
        </div>
      )}

      {/* Method-specific block */}
      {(!method || method === 'email' || method === 'direct') && (
        <EmailBlock info={info} />
      )}
      {method === 'online' && <OnlineBlock info={info} />}
      {method === 'post' && <PostBlock info={info} />}
      {(method === 'contact' || method === 'personal' || method === 'unknown') && (
        <ContactBlock info={info} />
      )}
      {(method === 'partnership' || method === 'via_partner' || method === 'membership' || method === 'contract') && (
        <ContactBlock info={info} />
      )}
      {method === 'none' && (
        <p className="text-sm text-text-muted">
          Diese Stiftung nimmt keine direkten Gesuche entgegen.
          Förderung erfolgt nur auf Einladung oder über Partner.
        </p>
      )}

      {/* Timing — always shown if data exists */}
      <TimingBlock info={info} />
    </div>
  );
}
