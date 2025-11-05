#!/usr/bin/env node
/**
 * generate-pfe-manifest.js
 * Scans public/PFE for .pdf files and writes public/PFE/files.json
 * Usage: node scripts/generate-pfe-manifest.js
 */
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const pfeDir = path.join(publicDir, 'PFE');
const outFile = path.join(pfeDir, 'files.json');

if (!fs.existsSync(pfeDir)) {
  console.error('Directory not found:', pfeDir);
  process.exit(1);
}

const files = fs.readdirSync(pfeDir)
  .filter((f) => f.toLowerCase().endsWith('.pdf'))
  .map((f) => ({ name: f, url: `/PFE/${encodeURI(f)}` }));

fs.writeFileSync(outFile, JSON.stringify(files, null, 2), 'utf8');
console.log(`Wrote ${files.length} file(s) to ${outFile}`);
