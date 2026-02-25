#!/usr/bin/env tsx
/**
 * Parse ZHAW Fonds & Stiftungen text extract into JSON.
 *
 * Input:  research/zhaw-fonds-stiftungen-raw.txt (from pdftotext -layout)
 * Output: research/zhaw-fonds-stiftungen-2024-25.json
 *
 * Each entry has:
 *   - Name (first line of block)
 *   - Address/contact line(s)
 *   - Purpose description paragraph
 *   - Labeled fields: ZIELGRUPPE, GESUCHSTELLENDE, EINREICHUNGSTERMIN, EMPFANGSSTELLE, BEILAGEN
 *
 * Usage: npx tsx scripts/zhaw-parse.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const INPUT = path.resolve(__dirname, '../research/zhaw-fonds-stiftungen-raw.txt');
const OUTPUT = path.resolve(__dirname, '../research/zhaw-fonds-stiftungen-2024-25.json');

// Known field labels that start a structured field
const FIELD_LABELS = ['ZIELGRUPPE', 'GESUCHSTELLENDE', 'EINREICHUNGSTERMIN', 'EMPFANGSSTELLE', 'BEILAGEN'];

// Page number lines to skip (e.g., "- 31 -")
const PAGE_NUM_RE = /^\s*-\s*\d+\s*-\s*$/;

interface ZhawFoundation {
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  purpose: string;
  zielgruppe: string;
  gesuchstellende: string;
  einreichungstermin: string;
  empfangsstelle: string;
  beilagen: string;
}

function extractContact(addressLine: string) {
  const email = addressLine.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
  const website = addressLine.match(/www\.[\w.-]+\.\w+/)?.[0] || '';
  const phone = addressLine.match(/0\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/)?.[0] || '';

  // Extract ZIP and city: look for 4-digit ZIP followed by city name
  const zipCity = addressLine.match(/(\d{4})\s+([A-ZÄÖÜa-zäöü][a-zäöüéèêàâ]+(?:\s+[a-zäöüéèêàâA-ZÄÖÜ][a-zäöüéèêàâ]*)*)/);
  const zip = zipCity?.[1] || '';
  const city = zipCity?.[2] || '';

  // Address is everything before the ZIP code
  const zipIdx = addressLine.indexOf(zip);
  const address = zipIdx > 0 ? addressLine.substring(0, zipIdx).trim().replace(/,\s*$/, '') : '';

  return { address, city, zip, phone, email, website };
}

function parseEntries(text: string): ZhawFoundation[] {
  const lines = text.split('\n');
  const entries: ZhawFoundation[] = [];

  let i = 0;

  while (i < lines.length) {
    // Skip blank lines and page numbers
    if (!lines[i].trim() || PAGE_NUM_RE.test(lines[i])) {
      i++;
      continue;
    }

    // The first non-blank line of a block is the foundation name
    const nameLine = lines[i].trim();

    // Skip if this looks like a continuation or field label
    if (FIELD_LABELS.some(f => nameLine.startsWith(f))) {
      i++;
      continue;
    }

    // Check if next line looks like an address (contains ZIP or c/o)
    const nextLine = (lines[i + 1] || '').trim();
    const isAddress = /\d{4}\s+[A-ZÄÖÜa-zäöü]/.test(nextLine) || nextLine.startsWith('c/o');

    if (!isAddress) {
      // Not a foundation entry start — skip
      i++;
      continue;
    }

    // Collect address line(s) — may span 2 lines for long addresses
    i++;
    let addressText = lines[i].trim();
    i++;

    // Check if next line is a continuation of address (e.g., wrapped c/o line)
    // Address continuations contain ZIP or email but the previous line had c/o without ZIP
    if (i < lines.length && !/\d{4}/.test(addressText) && /\d{4}/.test(lines[i]?.trim() || '')) {
      addressText += ' ' + lines[i].trim();
      i++;
    }

    const contact = extractContact(addressText);

    // Collect purpose paragraph — everything until we hit a FIELD_LABEL or blank section
    let purpose = '';
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line || PAGE_NUM_RE.test(line)) {
        i++;
        continue;
      }
      if (FIELD_LABELS.some(f => line.startsWith(f))) {
        break;
      }
      // Check if this might be the start of the NEXT entry (name + address pattern)
      const peekNext = (lines[i + 1] || '').trim();
      if (line && !line.startsWith(' ') && (/\d{4}\s+[A-ZÄÖÜa-zäöü]/.test(peekNext) || peekNext.startsWith('c/o'))) {
        // This looks like the next entry's name — don't consume it
        break;
      }
      purpose += (purpose ? ' ' : '') + line;
      i++;
    }

    // Collect structured fields
    const fields: Record<string, string> = {};
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || PAGE_NUM_RE.test(trimmed)) {
        // Blank lines after fields — check if this is end of entry
        // Count consecutive blank lines
        let blanks = 0;
        let j = i;
        while (j < lines.length && (!lines[j].trim() || PAGE_NUM_RE.test(lines[j].trim()))) {
          blanks++;
          j++;
        }
        if (blanks >= 2) {
          // End of entry
          i = j;
          break;
        }
        i++;
        continue;
      }

      // Check if this line starts a field
      const matchedField = FIELD_LABELS.find(f => trimmed.startsWith(f));
      if (matchedField) {
        // Extract value after the label
        const afterLabel = trimmed.substring(matchedField.length).trim();
        let value = afterLabel;

        // Collect continuation lines (indented)
        i++;
        while (i < lines.length) {
          const contLine = lines[i];
          const contTrimmed = contLine.trim();
          if (!contTrimmed || PAGE_NUM_RE.test(contTrimmed)) {
            // Check if next non-empty line is still a continuation
            let j = i;
            while (j < lines.length && (!lines[j].trim() || PAGE_NUM_RE.test(lines[j].trim()))) j++;
            if (j < lines.length && lines[j].startsWith('                                      ')) {
              // Still a continuation after blank
              i = j;
              continue;
            }
            break;
          }
          if (FIELD_LABELS.some(f => contTrimmed.startsWith(f))) {
            break; // Next field
          }
          // Continuation lines are heavily indented (30+ spaces)
          if (contLine.startsWith('                                ')) {
            value += ' ' + contTrimmed;
            i++;
          } else {
            break;
          }
        }

        fields[matchedField.toLowerCase()] = value.replace(/\s+/g, ' ').trim();
      } else {
        // Unknown line in fields section — might be purpose overflow or next entry
        // Check if it looks like a new entry name
        const peekNext = (lines[i + 1] || '').trim();
        if (/\d{4}\s+[A-ZÄÖÜa-zäöü]/.test(peekNext) || peekNext.startsWith('c/o')) {
          break; // Next entry
        }
        i++;
      }
    }

    entries.push({
      name: nameLine,
      address: contact.address,
      city: contact.city,
      zip: contact.zip,
      phone: contact.phone,
      email: contact.email,
      website: contact.website,
      purpose: purpose.replace(/\s+/g, ' ').trim(),
      zielgruppe: fields['zielgruppe'] || '',
      gesuchstellende: fields['gesuchstellende'] || '',
      einreichungstermin: fields['einreichungstermin'] || '',
      empfangsstelle: fields['empfangsstelle'] || '',
      beilagen: fields['beilagen'] || '',
    });
  }

  return entries;
}

function main() {
  console.log('Parsing ZHAW Fonds & Stiftungen...\n');

  const text = fs.readFileSync(INPUT, 'utf-8');
  const entries = parseEntries(text);

  console.log(`  Parsed: ${entries.length} entries`);

  // Show some stats
  const withEmail = entries.filter(e => e.email).length;
  const withWebsite = entries.filter(e => e.website).length;
  const withPurpose = entries.filter(e => e.purpose.length > 20).length;
  const withDeadline = entries.filter(e => e.einreichungstermin).length;

  console.log(`  With email: ${withEmail}`);
  console.log(`  With website: ${withWebsite}`);
  console.log(`  With purpose (>20 chars): ${withPurpose}`);
  console.log(`  With deadline: ${withDeadline}`);

  // Sample first 3
  console.log('\n  Sample entries:');
  for (const e of entries.slice(0, 3)) {
    console.log(`    ${e.name} (${e.city}) — ${e.purpose.substring(0, 60)}...`);
  }

  const output = {
    source: 'ZHAW Soziale Arbeit — Fonds und Stiftungen 2024/2025',
    date: '2025-11-17',
    edition: '29. Auflage',
    scope: 'Kanton Zürich',
    count: entries.length,
    foundations: entries,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n  Written to: ${OUTPUT}`);
}

main();
