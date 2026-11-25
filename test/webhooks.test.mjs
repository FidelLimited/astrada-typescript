// Checks verifyWebhook (src/webhooks.ts) against two known deliveries:
// - SVIX: the test vector published with the Svix and Standard Webhooks libraries;
// - ASTRADA: a delivery signed by the svix library 1.36.0 (the version service-webhooks-platform
//   uses) with a secret made the way Astrada makes them, base64 of a UUID with no whsec_ prefix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { verifyWebhook, WebhookVerificationError } = require('../dist/index.js');

const SVIX = {
  secret: 'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw', // gitleaks:allow (published Svix test vector / made-up test secret)
  id: 'msg_p5jXN8AQM9LWM0D4loKWxJek',
  timestamp: 1614265330,
  body: '{"test": 2432232314}',
  signature: 'v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=',
};

const ASTRADA = {
  secret: 'OGYxNGU0NWYtY2VlYS00NjdhLTlkMmItMWEyYjNjNGQ1ZTZm', // gitleaks:allow (published Svix test vector / made-up test secret)
  id: 'msg_2Qh7Yx0Example',
  timestamp: 1764000000,
  body: '{"type":"transaction.created","data":{"id":"txn-1"}}',
  signature: 'v1,ugIbG2sIrsoxOkgpZ737QRM1NgtSDpGCDnpIVrDPAtE=',
};

const headersOf = (v, prefix = 'webhook') => ({
  [`${prefix}-id`]: v.id,
  [`${prefix}-timestamp`]: String(v.timestamp),
  [`${prefix}-signature`]: v.signature,
});
const at = (v, offsetSeconds = 0) => ({ now: new Date((v.timestamp + offsetSeconds) * 1000) });
const rejects = (fn) => assert.throws(fn, (err) => err instanceof WebhookVerificationError);

test('accepts the published Svix vector', () => {
  assert.deepEqual(verifyWebhook(SVIX.body, headersOf(SVIX), SVIX.secret, at(SVIX)), { test: 2432232314 });
});

test('accepts an Astrada-format secret, with webhook-* or svix-* headers', () => {
  const expected = { type: 'transaction.created', data: { id: 'txn-1' } };
  assert.deepEqual(verifyWebhook(ASTRADA.body, headersOf(ASTRADA), ASTRADA.secret, at(ASTRADA)), expected);
  assert.deepEqual(verifyWebhook(Buffer.from(ASTRADA.body), headersOf(ASTRADA, 'svix'), ASTRADA.secret, at(ASTRADA)), expected);
  assert.deepEqual(verifyWebhook(ASTRADA.body, new Headers(headersOf(ASTRADA)), ASTRADA.secret, at(ASTRADA)), expected);
});

test('accepts any matching entry in a multi-signature header', () => {
  const headers = { ...headersOf(ASTRADA), 'webhook-signature': `v1,bm90IHRoZSBzaWduYXR1cmU= ${ASTRADA.signature}` };
  assert.ok(verifyWebhook(ASTRADA.body, headers, ASTRADA.secret, at(ASTRADA)));
});

test('rejects a changed body, a wrong secret and a missing header', () => {
  rejects(() => verifyWebhook(ASTRADA.body.replace('txn-1', 'txn-2'), headersOf(ASTRADA), ASTRADA.secret, at(ASTRADA)));
  rejects(() => verifyWebhook(ASTRADA.body, headersOf(ASTRADA), SVIX.secret, at(ASTRADA)));
  const { 'webhook-signature': _, ...missing } = headersOf(ASTRADA);
  rejects(() => verifyWebhook(ASTRADA.body, missing, ASTRADA.secret, at(ASTRADA)));
});

test('rejects a delivery older or newer than five minutes', () => {
  assert.ok(verifyWebhook(ASTRADA.body, headersOf(ASTRADA), ASTRADA.secret, at(ASTRADA, 300)));
  rejects(() => verifyWebhook(ASTRADA.body, headersOf(ASTRADA), ASTRADA.secret, at(ASTRADA, 301)));
  rejects(() => verifyWebhook(ASTRADA.body, headersOf(ASTRADA), ASTRADA.secret, at(ASTRADA, -301)));
});

test('refuses a missing secret as a configuration mistake', () => {
  for (const secret of [undefined, '']) {
    assert.throws(() => verifyWebhook(ASTRADA.body, headersOf(ASTRADA), secret, at(ASTRADA)), RangeError);
  }
});

test('refuses a tolerance that would turn off the timestamp check', () => {
  for (const toleranceSeconds of [Number.NaN, Number.POSITIVE_INFINITY, -1, Number('unset')]) {
    assert.throws(() => verifyWebhook(ASTRADA.body, headersOf(ASTRADA), ASTRADA.secret,
      { ...at(ASTRADA, 3600), toleranceSeconds }), RangeError);
  }
  assert.ok(verifyWebhook(ASTRADA.body, headersOf(ASTRADA), ASTRADA.secret, { ...at(ASTRADA, 10), toleranceSeconds: 10 }));
});

test('accepts the body as a Uint8Array', () => {
  const bytes = new TextEncoder().encode(ASTRADA.body);
  assert.ok(verifyWebhook(bytes, headersOf(ASTRADA), ASTRADA.secret, at(ASTRADA)));
});

test('rejects a secret that is not base64 before checking the signature', () => {
  for (const secret of ['whsec_', `${ASTRADA.secret}!`, 'whsec_MfKQ9r8GKYqr-TwjUPD8']) {
    assert.throws(
      () => verifyWebhook(ASTRADA.body, headersOf(ASTRADA), secret, at(ASTRADA)),
      (err) => err instanceof RangeError && /not base64/.test(err.message),
    );
  }
});
