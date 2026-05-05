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
