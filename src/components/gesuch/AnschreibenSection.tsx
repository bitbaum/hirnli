import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { formatCHF } from '@/lib/utils/format';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import Callout from '@/components/ui/Callout';

interface AnschreibenSectionProps {
  dok: ComposedGesuchDokument;
}

export default function AnschreibenSection({ dok }: AnschreibenSectionProps) {
  return (
    <section className="gesuch-section mb-12">
      {/* Sender */}
      <div className="mb-8 text-sm leading-relaxed">
        <p className="font-semibold">{dok.organization.organization.name}</p>
        <p>{dok.organization.organization.address}</p>
        <p>{dok.organization.organization.website}</p>
      </div>

      {/* Recipient */}
      {dok.anschreiben.foundationAddress && dok.anschreiben.foundationAddress.length > 10 ? (
        <div className="mb-6 text-sm leading-relaxed whitespace-pre-line">
          {dok.anschreiben.foundationAddress}
        </div>
      ) : (
        <Callout color="warning" className="mb-6 text-sm">
          ⚠ Adresse der Stiftung fehlt — bitte vor dem Versand in den Stiftungsdaten ergänzen.
        </Callout>
      )}

      {/* Date */}
      <p className="mb-8 text-sm text-text-muted">{dok.anschreiben.date}</p>

      {/* Subject */}
      <h1 className="mb-6 heading-subsection">
        {dok.anschreiben.subject}
      </h1>

      {/* Salutation + Body */}
      <div className="space-y-4 text-sm leading-relaxed text-text">
        <p>Sehr geehrte Damen und Herren</p>
        <p>{dok.anschreiben.opening}</p>
        <p>{dok.anschreiben.themeAlignment}</p>
        <p>
          Im beiliegenden Projektbeschrieb stellen wir Ihnen unser Vorhaben im Detail vor.
          Wir beantragen einen Förderbeitrag von <strong>{formatCHF(dok.budget.requestedAmount)}</strong> für
          eine Projektlaufzeit von {dok.budget.projectDuration}.
        </p>
        <p>
          Für eine interaktive Übersicht unserer Arbeit und der Passung zu Ihrem Stiftungszweck
          besuchen Sie gerne: <a href={dok.landingPageUrl} className="text-primary">{dok.landingPageUrl}</a>
        </p>
        <p>{dok.anschreiben.closing}</p>
        <div className="mt-8">
          <p>Mit freundlichen Grüssen</p>
          <p className="mt-4 font-semibold">{dok.organization.organization.name}</p>
        </div>
      </div>

      {/* Beilagen list */}
      <div className="mt-8 border-t border-border-default pt-4 text-sm text-text-muted">
        <p className="font-semibold">Beilagen:</p>
        <ul className="mt-1 list-inside list-disc">
          <li>Projektbeschrieb (3 Seiten)</li>
          <li>Budget und Finanzierungsplan</li>
          <li>Kurzportrait {ORG_PROFILE.name}</li>
          <li>Statuten (auf Anfrage)</li>
          <li>Jahresrechnung (auf Anfrage)</li>
        </ul>
      </div>
    </section>
  );
}
