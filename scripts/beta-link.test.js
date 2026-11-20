const test = require('node:test');
const assert = require('node:assert/strict');

const beta = require('../js/beta-link.js');

const MAIN = 'https://testflight.apple.com/join/MAIN';
const EU = 'https://testflight.apple.com/join/EUEU';

test('countryFromTrace reads the loc line', () => {
  assert.equal(beta.countryFromTrace('fl=1\nh=gitboba.app\nloc=DE\ntls=TLSv1.3\n'), 'DE');
  assert.equal(beta.countryFromTrace('h=gitboba.app\n'), null);
  assert.equal(beta.countryFromTrace(''), null);
  assert.equal(beta.countryFromTrace(undefined), null);
});

test('isEU covers the 27 member states only', () => {
  assert.equal(beta.EU_COUNTRIES.length, 27);
  for (const c of ['DE', 'FR', 'GR', 'IE', 'SE']) assert.ok(beta.isEU(c), c);
  for (const c of ['GB', 'CH', 'NO', 'US', null]) assert.ok(!beta.isEU(c), String(c));
});

test('with no EU link, everyone gets the main link and no switch', () => {
  assert.deepEqual(beta.pickLinks('DE', { main: MAIN, eu: '' }), {
    join: { url: MAIN, region: 'main' },
    alternate: null,
  });
});

test('with no links at all, nothing is chosen', () => {
  assert.deepEqual(beta.pickLinks('US', { main: '', eu: '' }), { join: null, alternate: null });
});

test('EU visitors get the EU link and are offered the main one', () => {
  assert.deepEqual(beta.pickLinks('FR', { main: MAIN, eu: EU }), {
    join: { url: EU, region: 'eu' },
    alternate: { url: MAIN, region: 'main' },
  });
});

test('other or unknown visitors get the main link and are offered the EU one', () => {
  for (const country of ['US', 'GB', null]) {
    assert.deepEqual(beta.pickLinks(country, { main: MAIN, eu: EU }), {
      join: { url: MAIN, region: 'main' },
      alternate: { url: EU, region: 'eu' },
    });
  }
});

test('fetchCountry returns the country, or null on any failure', async () => {
  const ok = async () => ({ ok: true, text: async () => 'loc=IT\n' });
  const bad = async () => ({ ok: false, text: async () => 'loc=IT\n' });
  const throws = async () => { throw new Error('offline'); };
  const throwsSync = () => { throw new Error('blocked'); };
  assert.equal(await beta.fetchCountry(ok), 'IT');
  assert.equal(await beta.fetchCountry(bad), null);
  assert.equal(await beta.fetchCountry(throws), null);
  assert.equal(await beta.fetchCountry(throwsSync), null);
  assert.equal(await beta.fetchCountry(undefined), null);
});

function fakeDocument() {
  const el = (props) => ({ hidden: false, href: '', textContent: '', ...props });
  const nodes = {
    'beta-join': el({ href: 'https://apps.apple.com/app/testflight/id899247664' }),
    'beta-join-note': el(),
    'beta-join-alt': el({ hidden: true }),
    'beta-join-alt-label': el(),
    'beta-join-alt-link': el(),
  };
  return { nodes, getElementById: (id) => nodes[id] };
}

test('init switches an EU visitor to the EU link', async () => {
  const doc = fakeDocument();
  await beta.init(doc, async () => ({ ok: true, text: async () => 'loc=ES\n' }), { main: MAIN, eu: EU });
  assert.equal(doc.nodes['beta-join'].href, EU);
  assert.equal(doc.nodes['beta-join-note'].hidden, true);
  assert.equal(doc.nodes['beta-join-alt'].hidden, false);
  assert.equal(doc.nodes['beta-join-alt-label'].textContent, 'Outside the EU?');
  assert.equal(doc.nodes['beta-join-alt-link'].href, MAIN);
});

test('init keeps the main link when the lookup fails', async () => {
  const doc = fakeDocument();
  await beta.init(doc, async () => { throw new Error('offline'); }, { main: MAIN, eu: EU });
  assert.equal(doc.nodes['beta-join'].href, MAIN);
  assert.equal(doc.nodes['beta-join-alt-label'].textContent, 'In the EU?');
  assert.equal(doc.nodes['beta-join-alt-link'].href, EU);
});

test('init skips the lookup when there is no EU link', async () => {
  const doc = fakeDocument();
  let called = false;
  await beta.init(doc, async () => { called = true; }, { main: MAIN, eu: '' });
  assert.equal(called, false);
  assert.equal(doc.nodes['beta-join'].href, MAIN);
  assert.equal(doc.nodes['beta-join-alt'].hidden, true);
});
