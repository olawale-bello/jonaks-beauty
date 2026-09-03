import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { homeIntroBootstrap } from '../lib/home-intro.js';

function visit(pathname, storage = new Map(), reduced = false, blocked = false) {
  const document = { documentElement: { dataset: {} } };
  const window = {
    location: { pathname },
    matchMedia: () => ({ matches: reduced }),
    sessionStorage: {
      getItem(key) { if (blocked) throw new Error('Storage blocked'); return storage.get(key); },
      setItem(key, value) { storage.set(key, value); },
    },
  };
  runInNewContext(homeIntroBootstrap, { window, document });
  return document.documentElement.dataset.homeIntro === 'show';
}

test('plays only on the first homepage visit in a session, including reloads and returning from another page', () => {
  const storage = new Map();
  for (const path of ['/about', '/portfolio', '/booking']) assert.equal(visit(path, storage), false);
  assert.equal(visit('/', storage), true);
  assert.equal(visit('/', storage), false);
  assert.equal(visit('/portfolio', storage), false);
  assert.equal(visit('/', storage), false);
  assert.equal(visit('/', new Map()), true);
});

test('shows content immediately when reduced motion is preferred or session storage is blocked', () => {
  assert.equal(visit('/', new Map(), true), false);
  assert.equal(visit('/', new Map(), false, true), false);
});
