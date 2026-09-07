/** Standard user-facing network error messages (Swiss German) */
export const NET_ERR_LOAD = 'Netzwerkfehler beim Laden';
export const NET_ERR_SAVE = 'Netzwerkfehler beim Speichern';
export const NET_ERR_DELETE = 'Netzwerkfehler beim Löschen';
export const NET_ERR_RETRY = 'Netzwerkfehler — bitte erneut versuchen';

/** API response error messages (returned in JSON, may surface to users) */
export const API_ERR_NOT_FOUND = 'Nicht gefunden';
export const API_ERR_VALIDATION = 'Validierungsfehler';
export const API_ERR_LOAD = 'Fehler beim Laden';
export const API_ERR_SAVE = 'Fehler beim Speichern';
export const API_ERR_DELETE = 'Fehler beim Löschen';
export const API_ERR_CONFLICT = 'Eintrag existiert bereits';
export const API_ERR_DB = 'Datenbankfehler';
export const API_ERR_EXPORT = 'Export fehlgeschlagen';
export const API_ERR_BAD_REQUEST = 'Ungültige Anfrage';
export const API_ERR_PROCESS = 'Verarbeitung fehlgeschlagen';
export const API_ERR_PDF = 'PDF-Generierung fehlgeschlagen';
export const API_ERR_FOUNDATION_NOT_FOUND = 'Stiftung nicht gefunden';
export const API_ERR_GESUCH_UNAVAILABLE = 'Gesuch nicht verfügbar für diese Stiftung';
export const API_ERR_GESUCH_NOT_READY = 'Gesuch nicht bereit';
/**
 * The organisation has not written the narrative a Gesuch is composed from.
 *
 * Distinct from NOT_READY, which is about the foundation: that one means "we
 * know too little about this funder to write to them", this one means "we know
 * too little about you". Collapsing them would send an applicant to check the
 * foundation's research status over and over while the missing piece was
 * theirs.
 */
export const API_ERR_STORY_MISSING =
  'Für diese Organisation ist noch keine Geschichte erfasst — ohne sie lässt sich kein Gesuch erzeugen.';
export const API_ERR_UNAUTHORIZED = 'Nicht autorisiert';
export const API_ERR_INTERNAL = 'Interner Fehler';
export const API_ERR_CRON = 'Cron-Job fehlgeschlagen';
export const API_ERR_AI_NOT_CONFIGURED = 'KI-Dienst nicht konfiguriert';
export const API_ERR_AI_UNAVAILABLE = 'KI-Dienst momentan nicht erreichbar';
export const API_ERR_AI_NO_RESPONSE = 'Keine Antwort vom KI-Dienst';
export const API_ERR_AI_TIMEOUT = 'KI-Anfrage hat zu lange gedauert (Timeout)';

/** Import-specific validation errors */
export const API_ERR_IMPORT_NO_FILE = 'Keine Datei angegeben';
export const API_ERR_IMPORT_FILE_TOO_LARGE = 'Datei zu gross (max. 10 MB)';
export const API_ERR_IMPORT_FILE_TYPE = 'Datei muss im JSON-Format sein';
export const API_ERR_IMPORT_JSON_INVALID = 'Ungültiges JSON-Format';
export const API_ERR_IMPORT_EMPTY = 'Datei muss ein Array von Stiftungen enthalten';

/**
 * An export of content this tenant has not authored.
 *
 * Distinct from API_ERR_EXPORT, which means the export ran and broke. Answering
 * a 404 with "Export fehlgeschlagen" sends the reader to look for a fault that
 * is not there; the accurate answer is that these are somebody else's figures.
 */
export const API_ERR_EXPORT_NOT_AUTHORED =
  'Für diese Organisation sind keine solchen Daten hinterlegt.';
