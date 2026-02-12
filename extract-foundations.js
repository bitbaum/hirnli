/**
 * Extract foundation data with better parsing
 * Properly handles multi-line objects
 */

const fs = require('fs');
const path = require('path');

// Read the foundations file
const foundationsPath = path.join(__dirname, 'src/lib/config/foundations/stiftungen-2026-02.ts');
const content = fs.readFileSync(foundationsPath, 'utf-8');

// Find the export const array
const arrayMatch = content.match(/export const STIFTUNGEN_2026_02: Foundation\[\] = \[([\s\S]*)\];/);
if (!arrayMatch) {
  console.error('Could not find STIFTUNGEN_2026_02 array');
  process.exit(1);
}

const arrayContent = arrayMatch[1];

// Split into individual foundation objects
// This is tricky because objects can be nested
let foundations = [];
let currentObj = '';
let braceCount = 0;
let inObject = false;

for (let i = 0; i < arrayContent.length; i++) {
  const char = arrayContent[i];

  if (char === '{') {
    if (!inObject) {
      inObject = true;
      currentObj = '';
    }
    braceCount++;
    currentObj += char;
  } else if (char === '}') {
    braceCount--;
    currentObj += char;

    if (braceCount === 0 && inObject) {
      // End of foundation object
      foundations.push(currentObj);
      currentObj = '';
      inObject = false;
    }
  } else if (inObject) {
    currentObj += char;
  }
}

console.log(`Found ${foundations.length} foundation objects`);

// Parse each foundation
const results = {
  foundations: [],
  summary: {
    total: 0,
    missingEmail: 0,
    missingPhone: 0,
    missingAddress: 0,
    missingAny: 0,
  }
};

for (const objStr of foundations) {
  // Extract fields using regex
  const slug = objStr.match(/slug:\s*['"]([^'"]+)['"]/)?.[1];
  const name = objStr.match(/name:\s*['"]([^'"]*)['"]/)?.[1];
  const website = objStr.match(/websiteUrl:\s*['"]([^'"]*)['"]/)?.[1];
  const priority = parseInt(objStr.match(/priority:\s*(\d+)/)?.[1] || '4');
  const type = objStr.match(/type:\s*['"]([^'"]+)['"]/)?.[1];

  // Check contact block
  const contactMatch = objStr.match(/contact:\s*\{([^}]*)\}/s);
  const contactBlock = contactMatch ? contactMatch[1] : null;

  const hasEmail = contactBlock && /email:\s*['"][^'"]+['"]/.test(contactBlock);
  const hasPhone = contactBlock && /phone:\s*['"][^'"]+['"]/.test(contactBlock);
  const hasAddress = contactBlock && /address:\s*['"][^'"]+['"]/.test(contactBlock);

  const missing = {
    email: !hasEmail,
    phone: !hasPhone,
    address: !hasAddress,
  };

  const missingAny = !hasEmail || !hasPhone || !hasAddress;

  if (missingAny) {
    results.foundations.push({
      slug,
      name: name || slug,
      type,
      priority,
      website: website || '',
      hasContact: !!contactBlock,
      missing,
      missingFields: Object.keys(missing).filter(k => missing[k]),
    });

    results.summary.missingAny++;
    if (!hasEmail) results.summary.missingEmail++;
    if (!hasPhone) results.summary.missingPhone++;
    if (!hasAddress) results.summary.missingAddress++;
  }

  results.summary.total++;
}

// Sort by priority, then type
results.foundations.sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.type.localeCompare(b.type);
});

// Output
console.log('\n=== Foundation Contact Analysis ===\n');
console.log(`Total foundations: ${results.summary.total}`);
console.log(`Missing any contact info: ${results.summary.missingAny}`);
console.log(`Missing email: ${results.summary.missingEmail}`);
console.log(`Missing phone: ${results.summary.missingPhone}`);
console.log(`Missing address: ${results.summary.missingAddress}`);
console.log('\n=== Foundations Missing Contact Info (by Priority) ===\n');

let currentPriority = -1;
for (const f of results.foundations) {
  if (f.priority !== currentPriority) {
    console.log(`\n--- Priority ${f.priority} (${['A', 'B', 'C', 'D', 'network'].includes(f.type) ? f.type : 'unknown'}) ---`);
    currentPriority = f.priority;
  }
  console.log(`\n${f.slug}`);
  console.log(`  Name: ${f.name}`);
  console.log(`  Type: ${f.type}`);
  console.log(`  Website: ${f.website || 'MISSING'}`);
  console.log(`  Missing: ${f.missingFields.join(', ')}`);
}

// Save to JSON for processing
fs.writeFileSync(
  path.join(__dirname, 'foundations-missing-contacts.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n\n=== Summary ===');
console.log(`Results saved to foundations-missing-contacts.json`);
console.log(`Total to research: ${results.summary.missingAny} foundations`);
