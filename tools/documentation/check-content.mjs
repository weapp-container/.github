#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function codeBlocks(text) {
  return [...text.matchAll(/^\s*(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^\s*\1\s*$/gm)].map(match => ({language: match[2].trim(), code: match[3]}));
}
export function checkContent(root) {
  const catalog = JSON.parse(readFileSync(resolve(root, 'documentation.json'), 'utf8'));
  const findings = [];
  for (const page of catalog.pages) {
    if (![page.zh, page.en].every(path => existsSync(resolve(root, path)))) {findings.push({path: page.en, reason: 'Missing bilingual content'}); continue;}
    const zh = readFileSync(resolve(root, page.zh), 'utf8'), en = readFileSync(resolve(root, page.en), 'utf8');
    if (JSON.stringify(codeBlocks(zh)) !== JSON.stringify(codeBlocks(en))) findings.push({path: page.en, reason: 'Executable examples differ between languages'});
    const prose = en.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, '').replace(/`[^`\n]+`|<[^>]+>/g, '').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/^.*(?:简体中文|中文).*English.*$/gm, '');
    if (/[\u3400-\u9fff]/u.test(prose)) findings.push({path: page.en, reason: 'Untranslated Chinese prose remains outside examples and identifiers'});
  }
  return {pages: catalog.pages.length, findings};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = checkContent(process.cwd());
  console.log(JSON.stringify(report, null, 2));
  if (report.findings.length) process.exitCode = 1;
}
