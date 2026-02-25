import * as fs from 'fs';

interface EsaEntry {
  uid: string;
  name: string;
  purpose: string;
  canton: string;
  city: string;
  status: string;
}

const register = JSON.parse(fs.readFileSync('research/esa-register-2026-02-16.json', 'utf-8'));
const CRYPTO = ["blockchain","crypto","krypto","token","defi","dao","web3","nft","bitcoin","ethereum","protocol","ledger","dezentralisiert","dezentrale softwarearchitektur","smart contract","mining","consensus","proof of","staking","lukso"];

const results = register.foundations.filter((f: EsaEntry) => {
  if (f.status !== 'aktiv') return false;
  const p = f.purpose.toLowerCase();
  const n = f.name.toLowerCase();
  const hasCrypto = CRYPTO.some(kw => p.includes(kw) || n.includes(kw));
  const hasOS = p.includes('open source') || p.includes('open-source') || p.includes('quelloffen') || p.includes('linux');
  return hasCrypto && hasOS;
});

console.log(`Crypto + open source overlap: ${results.length}`);
results.forEach((f: EsaEntry) => {
  const p = f.purpose.toLowerCase();
  const cryptoMatches = CRYPTO.filter(kw => p.includes(kw) || f.name.toLowerCase().includes(kw));
  console.log(`\n  ${f.name} — ${f.city}`);
  console.log(`  Crypto signal: ${cryptoMatches.join(', ')}`);
  console.log(`  Purpose: ${f.purpose.substring(0, 200)}`);
});
