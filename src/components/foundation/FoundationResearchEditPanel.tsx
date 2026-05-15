'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { patchFoundationResearch } from '@/lib/api/foundations';
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from '@/lib/utils/form-classes';

const PURPOSE_MIN = 150;
const NOTES_MIN = 250;

interface Props {
  foundationId: string;
  initialPurposeSummary: string;
  initialResearchNotes: string;
  initialEmail: string;
  initialPhone: string;
  initialAddress: string;
  initialWebsiteUrl: string;
  initialAmountMin: number | null;
  initialAmountMax: number | null;
  initialAmountText: string;
  initialAnnualBudget: string;
  initialGrantExpenditure: string;
  initialPastGrantees: string[];
}

function CharCounter({ value, min, compact }: { value: string; min: number; compact?: boolean }) {
  const len = value.trim().length;
  const ok = len >= min;
  const close = len >= min * 0.7 && !ok;
  return (
    <span className={`text-xs tabular-nums ${ok ? 'text-success-text' : close ? 'text-warning-text' : 'text-text-muted'}`}>
      {ok ? `✓ ${len}` : compact ? `${len}` : `${len} / ${min}`}
    </span>
  );
}

export default function FoundationResearchEditPanel({
  foundationId,
  initialPurposeSummary,
  initialResearchNotes,
  initialEmail,
  initialPhone,
  initialAddress,
  initialWebsiteUrl,
  initialAmountMin,
  initialAmountMax,
  initialAmountText,
  initialAnnualBudget,
  initialGrantExpenditure,
  initialPastGrantees,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [purpose, setPurpose] = useState(initialPurposeSummary);
  const [notes, setNotes] = useState(initialResearchNotes);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl);
  const [amountMin, setAmountMin] = useState<string>(initialAmountMin !== null ? String(initialAmountMin) : '');
  const [amountMax, setAmountMax] = useState<string>(initialAmountMax !== null ? String(initialAmountMax) : '');
  const [amountText, setAmountText] = useState(initialAmountText === 'Unbekannt' ? '' : initialAmountText);
  const [annualBudget, setAnnualBudget] = useState(initialAnnualBudget);
  const [grantExpenditure, setGrantExpenditure] = useState(initialGrantExpenditure);
  const [pastGrantees, setPastGrantees] = useState(initialPastGrantees.join('\n'));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const hasContact = email.trim() || phone.trim();

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const parsedMin = amountMin.trim() !== '' ? Number(amountMin) : null;
    const parsedMax = amountMax.trim() !== '' ? Number(amountMax) : null;
    const granteeList = pastGrantees.split('\n').map(s => s.trim()).filter(Boolean);
    const result = await patchFoundationResearch(foundationId, {
      purposeSummary: purpose,
      researchNotes: notes,
      contact: { email: email.trim(), phone: phone.trim(), address: address.trim() },
      websiteUrl: websiteUrl.trim() || undefined,
      amount: { min: parsedMin, max: parsedMax, text: amountText.trim() },
      annualBudget: annualBudget.trim() || undefined,
      grantExpenditure: grantExpenditure.trim() || undefined,
      pastGrantees: granteeList.length > 0 ? granteeList : undefined,
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setEditing(false);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error ?? 'Fehler beim Speichern');
    }
  }

  function handleCancel() {
    setPurpose(initialPurposeSummary);
    setNotes(initialResearchNotes);
    setEmail(initialEmail);
    setPhone(initialPhone);
    setAddress(initialAddress);
    setWebsiteUrl(initialWebsiteUrl);
    setAmountMin(initialAmountMin !== null ? String(initialAmountMin) : '');
    setAmountMax(initialAmountMax !== null ? String(initialAmountMax) : '');
    setAmountText(initialAmountText === 'Unbekannt' ? '' : initialAmountText);
    setAnnualBudget(initialAnnualBudget);
    setGrantExpenditure(initialGrantExpenditure);
    setPastGrantees(initialPastGrantees.join('\n'));
    setEditing(false);
    setError(null);
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <CharCounter value={purpose} min={PURPOSE_MIN} compact />
          <span>Zweck</span>
          <span>·</span>
          <CharCounter value={notes} min={NOTES_MIN} compact />
          <span>Notizen</span>
          {!hasContact && (
            <>
              <span>·</span>
              <span className="text-warning-text">✗ Kontakt</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-success-text">Gespeichert ✓</span>}
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
          >
            Bearbeiten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={FORM_LABEL_CLASS}>Stiftungszweck</label>
          <CharCounter value={purpose} min={PURPOSE_MIN} />
        </div>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          rows={4}
          placeholder="Was ist der Stiftungszweck? (aus Statuten, Website oder ESA-Register)"
          className={FORM_INPUT_CLASS}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={FORM_LABEL_CLASS}>Recherche-Notizen</label>
          <CharCounter value={notes} min={NOTES_MIN} />
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Warum passt diese Stiftung? Besonderheiten, Förderhistorie, Hinweise zur Bewerbung..."
          className={FORM_INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FORM_LABEL_CLASS}>E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kontakt@stiftung.ch"
            className={FORM_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS}>Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+41 44 123 45 67"
            className={FORM_INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={FORM_LABEL_CLASS}>Adresse</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Musterstrasse 1, 8000 Zürich"
          className={FORM_INPUT_CLASS}
        />
      </div>

      <div>
        <label className={FORM_LABEL_CLASS}>Website</label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://www.stiftung.ch"
          className={FORM_INPUT_CLASS}
        />
      </div>

      <div>
        <label className={FORM_LABEL_CLASS}>Förderbereich (CHF)</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={amountMin}
            onChange={(e) => setAmountMin(e.target.value)}
            placeholder="Min"
            className={FORM_INPUT_CLASS}
          />
          <input
            type="number"
            value={amountMax}
            onChange={(e) => setAmountMax(e.target.value)}
            placeholder="Max"
            className={FORM_INPUT_CLASS}
          />
          <input
            type="text"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            placeholder="z.B. bis CHF 50000"
            className={FORM_INPUT_CLASS}
          />
        </div>
        <p className="mt-1 text-xs text-text-muted">Min · Max · Anzeigetext</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FORM_LABEL_CLASS}>Jahresbudget</label>
          <input
            type="text"
            value={annualBudget}
            onChange={(e) => setAnnualBudget(e.target.value)}
            placeholder="z.B. CHF 5M/Jahr"
            className={FORM_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS}>Förderausgaben</label>
          <input
            type="text"
            value={grantExpenditure}
            onChange={(e) => setGrantExpenditure(e.target.value)}
            placeholder="z.B. CHF 2M/Jahr"
            className={FORM_INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={FORM_LABEL_CLASS}>Frühere Förderprojekte</label>
        <textarea
          value={pastGrantees}
          onChange={(e) => setPastGrantees(e.target.value)}
          rows={2}
          placeholder="Eine Organisation pro Zeile (z.B. ETH Zürich, EPFL)"
          className={FORM_INPUT_CLASS}
        />
      </div>

      {error && (
        <p className="text-sm text-danger-text">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={handleCancel} disabled={saving}>
          Abbrechen
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Speichern…' : 'Speichern'}
        </Button>
      </div>
    </div>
  );
}
