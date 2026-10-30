// The Android TWA (package ai.legallyai.app) needs a valid manifest and Digital Asset Links file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const pub = (p) => new URL('../public/' + p, import.meta.url);

test('assetlinks.json delegates handle_all_urls to ai.legallyai.app with SHA-256 fingerprints', () => {
  const links = JSON.parse(fs.readFileSync(pub('.well-known/assetlinks.json'), 'utf8'));
  const t = links.find((l) => l.target?.package_name === 'ai.legallyai.app');
  assert.ok(t, 'package entry present');
  assert.deepEqual(t.relation, ['delegate_permission/common.handle_all_urls']);
  assert.ok(t.target.sha256_cert_fingerprints.length >= 1);
  for (const fp of t.target.sha256_cert_fingerprints) assert.match(fp, /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
});

test('web manifest lists existing 192/512 any + maskable icons', () => {
  const m = JSON.parse(fs.readFileSync(pub('manifest.json'), 'utf8'));
  assert.equal(m.start_url, '/');
  assert.equal(m.display, 'standalone');
  for (const size of ['192x192', '512x512']) for (const purpose of ['any', 'maskable']) {
    const icon = m.icons.find((i) => i.sizes === size && i.purpose === purpose);
    assert.ok(icon, `${size} ${purpose}`);
    assert.ok(fs.existsSync(pub(icon.src.slice(1))), icon.src);
  }
});
