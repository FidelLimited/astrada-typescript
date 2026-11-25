// Checks the client behaviour added to the generated SDK (the runtime template
// and the hand-written src/errors.ts, src/pagination.ts, src/webhook-events.ts, src/sandbox-guard.ts,
// src/sandbox-api.ts, src/testing)
// against a local stand-in server over real HTTP: typed errors, retries, timeouts, the shared token
// request, pagination, tolerant enums and unknown fields, environments and webhook events.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sdk = require('../dist/index.js');

const TOKEN_PATH = '/auth/realms/acct-1/protocol/openid-connect/token';

/**
 * A stand-in for the API. `routes` maps "METHOD /path" to a handler (req, body, count) returning
 * { status, headers, json | text, delayMs } or 'destroy' (drop the connection). The token route
 * answers by default; every request is recorded in `requests`.
 */
async function standIn(t, routes) {
  const requests = [];
  const counts = new Map();
  let tokens = 0;
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    const url = new URL(req.url, 'http://localhost');
    const key = `${req.method} ${url.pathname}`;
    requests.push({ key, url, headers: req.headers, body });
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    let handler = routes[key];
    if (!handler && key === `POST ${TOKEN_PATH}`) {
      handler = () => ({ json: { access_token: `token-${++tokens}`, token_type: 'Bearer', expires_in: 300 } });
    }
    if (!handler) {
      res.writeHead(404, { 'Content-Type': 'application/json' }).end(JSON.stringify({ title: 'Not Found', detail: `no route ${key}` }));
      return;
    }
    const answer = await handler(req, body, count, url);
    if (answer === 'destroy') {
      req.socket.destroy();
      return;
    }
    if (answer.delayMs) await new Promise((r) => setTimeout(r, answer.delayMs));
    if (answer.dropBody) {
      // Headers and the first bytes of the body, then the connection drops.
      res.writeHead(answer.status ?? 200, { 'Content-Type': 'application/json' });
      res.write('{"id":');
      setTimeout(() => req.socket.destroy(), 20);
      return;
    }
    if (answer.stallBody) {
      // Headers and the first bytes of the body, then nothing more until the connection closes.
      res.writeHead(answer.status ?? 200, { 'Content-Type': 'application/json' });
      res.write('{"id":');
      return;
    }
    const headers = { ...(answer.headers ?? {}) };
    let payload = '';
    if (answer.json !== undefined) {
      headers['Content-Type'] ??= 'application/json';
      payload = JSON.stringify(answer.json);
    } else if (answer.text !== undefined) {
      payload = answer.text;
    }
    if (!res.destroyed) res.writeHead(answer.status ?? 200, headers).end(payload);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => {
    server.closeAllConnections?.();
    server.close(resolve);
  }));
  const { port } = server.address();
  return {
    basePath: `http://127.0.0.1:${port}`,
    requests,
    count: (key) => requests.filter((r) => r.key === key).length,
  };
}

function config(basePath, extra = {}) {
  return new sdk.Configuration({
    accountId: 'acct-1',
    clientId: 'client-1',
    clientSecret: 'secret-1',
    basePath,
    retryDelayMs: 5,
    ...extra,
  });
}

const subaccount = (id, extra = {}) => ({
  _links: { self: { href: `/subaccounts/${id}` } },
  accountId: 'acct-1',
  id,
  name: `Subaccount ${id}`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  configurations: {},
  ...extra,
});

// Environments

test('environment picks the API and token host; one of environment or basePath is required', () => {
  const base = { accountId: 'a', clientId: 'c', clientSecret: 's' };
  assert.equal(new sdk.Configuration({ ...base, environment: 'sandbox' }).basePath, 'https://api.sandbox.astrada.co');
  assert.equal(new sdk.Configuration({ ...base, environment: 'production' }).basePath, 'https://api.astrada.co');
  assert.equal(new sdk.Configuration({ ...base, environment: 'sandbox', basePath: 'http://localhost:1/' }).basePath, 'http://localhost:1');
  assert.throws(() => new sdk.Configuration(base), RangeError);
  assert.throws(() => new sdk.Configuration({ ...base, environment: 'staging' }), /Unknown environment/);
});

test('the token request goes to the environment host', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ json: subaccount('s1') }) });
  await new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' });
  assert.deepEqual(api.requests.map((r) => r.key), [`POST ${TOKEN_PATH}`, 'GET /subaccounts/s1']);
  assert.equal(api.requests[1].headers.authorization, 'Bearer token-1');
});

// Typed errors

test('an error answer throws the status subclass with the problem body read', async (t) => {
  const problem = { title: 'Conflict', detail: 'Card enrollment is off for this subaccount.', code: 'CARD_ENROLLMENT_OFF' };
  const api = await standIn(t, { 'POST /enrollment-links': () => ({ status: 409, json: problem }) });
  const links = new sdk.EnrollmentLinksApi(config(api.basePath));
  await assert.rejects(
    links.createEnrollmentLink({ enrollmentLinkCreateParams: { subaccountId: 's1', kind: 'team' } }),
    (err) => {
      assert.ok(err instanceof sdk.ConflictError);
      assert.ok(err instanceof sdk.ResponseError);
      assert.equal(err.status, 409);
      assert.equal(err.title, 'Conflict');
      assert.equal(err.code, 'CARD_ENROLLMENT_OFF');
      assert.equal(err.detail, problem.detail);
      assert.deepEqual(err.errors, []);
      assert.equal(err.message, '409 Conflict (CARD_ENROLLMENT_OFF): Card enrollment is off for this subaccount.');
      return true;
    },
  );
});

test('validation errors carry the errors list, and the response stays readable', async (t) => {
  const problem = {
    title: 'Bad Request',
    detail: 'The request is invalid',
    errors: [{ title: 'Invalid value', detail: 'must be a UUID', instance: '/subaccountId' }],
  };
  const api = await standIn(t, { 'POST /enrollment-links': () => ({ status: 400, json: problem }) });
  const links = new sdk.EnrollmentLinksApi(config(api.basePath));
  const err = await links.createEnrollmentLink({ enrollmentLinkCreateParams: { subaccountId: 'x', kind: 'team' } }).catch((e) => e);
  assert.ok(err instanceof sdk.ValidationError);
  assert.equal(err.errors[0].instance, '/subaccountId');
  assert.deepEqual(await err.response.json(), problem);
});

test('each status has its class', async (t) => {
  const cases = [
    [403, sdk.PermissionDeniedError],
    [404, sdk.NotFoundError],
    [422, sdk.ValidationError],
    [429, sdk.RateLimitError],
    [500, sdk.InternalServerError],
    [418, sdk.ResponseError],
  ];
  for (const [status, Type] of cases) {
    const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ status, json: { title: 'x', detail: 'y' } }) });
    const err = await new sdk.SubaccountsApi(config(api.basePath, { maxRetries: 0 })).getSubaccount({ subaccountId: 's1' }).catch((e) => e);
    assert.ok(err instanceof Type, `${status} gives ${err.name}`);
    assert.equal(err.status, status);
  }
});

test('the Banking API error body is read into the same fields and classes', async (t) => {
  const body = { statusCode: 404, message: 'Subaccount not found for this account', code: 'SUBACCOUNT_NOT_FOUND', error: 'Not Found' };
  const api = await standIn(t, { 'GET /bank-links/bl1': () => ({ status: 404, json: body }) });
  const err = await new sdk.banking.BankLinksApi(config(api.basePath)).getBankLink({ bankLinkId: 'bl1' }).catch((e) => e);
  assert.ok(err instanceof sdk.NotFoundError);
  assert.ok(err instanceof sdk.banking.ResponseError);
  assert.equal(err.code, 'SUBACCOUNT_NOT_FOUND');
  assert.equal(err.title, 'Not Found');
  assert.equal(err.detail, body.message);
});

test('a non-JSON error page gives a typed error with an excerpt, not a SyntaxError', async (t) => {
  const api = await standIn(t, { 'POST /subaccounts': () => ({ status: 502, text: '<html>Bad Gateway</html>' }) });
  const err = await new sdk.SubaccountsApi(config(api.basePath)).createSubaccount({ subaccountCreateParams: { name: 'n' } }).catch((e) => e);
  assert.ok(err instanceof sdk.InternalServerError);
  assert.equal(err.detail, '<html>Bad Gateway</html>');
});

test('a login refused with any 4xx is an AuthenticationError (an unknown realm answers 404)', async (t) => {
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => ({ status: 404, json: { error: 'Realm does not exist' } }),
  });
  const err = await new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' }).catch((e) => e);
  assert.ok(err instanceof sdk.AuthenticationError, err && err.name);
  assert.equal(err.status, 404);
  assert.match(err.message, /^Authentication failed \(check the environment/);
});

// Retries

test('GET is retried on 5xx and succeeds', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts/s1': (req, body, n) => (n < 3 ? { status: 503, json: { title: 'Service Unavailable', detail: 'busy' } } : { json: subaccount('s1') }),
  });
  const result = await new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' });
  assert.equal(result.id, 's1');
  assert.equal(api.count('GET /subaccounts/s1'), 3);
});

test('retries stop after maxRetries and the last error is thrown', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ status: 500, json: { title: 'Internal Server Error', detail: 'boom' } }) });
  const err = await new sdk.SubaccountsApi(config(api.basePath, { maxRetries: 1 })).getSubaccount({ subaccountId: 's1' }).catch((e) => e);
  assert.ok(err instanceof sdk.InternalServerError);
  assert.equal(api.count('GET /subaccounts/s1'), 2);
});

test('POST and PATCH are not retried', async (t) => {
  const api = await standIn(t, {
    'POST /subaccounts': () => ({ status: 503, json: { title: 'Service Unavailable', detail: 'busy' } }),
    'PATCH /subaccounts/s1': () => ({ status: 503, json: { title: 'Service Unavailable', detail: 'busy' } }),
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath));
  await assert.rejects(subaccounts.createSubaccount({ subaccountCreateParams: { name: 'n' } }), sdk.InternalServerError);
  await assert.rejects(subaccounts.updateSubaccount({ subaccountId: 's1', subaccountUpdateParams: { name: 'n' } }), sdk.InternalServerError);
  assert.equal(api.count('POST /subaccounts'), 1);
  assert.equal(api.count('PATCH /subaccounts/s1'), 1);
});

test('429 waits as long as Retry-After asks', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts/s1': (req, body, n) => (n === 1
      ? { status: 429, headers: { 'Retry-After': '1' }, json: { title: 'Too Many Requests', detail: 'slow down' } }
      : { json: subaccount('s1') }),
  });
  const started = Date.now();
  await new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' });
  const waited = Date.now() - started;
  assert.ok(waited >= 950, `waited ${waited} ms`);
  assert.equal(api.count('GET /subaccounts/s1'), 2);
});

test('a Retry-After over a minute is not waited for', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts/s1': () => ({ status: 429, headers: { 'Retry-After': '120' }, json: { title: 'Too Many Requests', detail: 'later' } }),
  });
  const err = await new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' }).catch((e) => e);
  assert.ok(err instanceof sdk.RateLimitError);
  assert.equal(err.retryAfterMs, 120_000);
  assert.equal(api.count('GET /subaccounts/s1'), 1);
});

test('a dropped connection is retried for GET and is a FetchError when retries run out', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts/s1': (req, body, n) => (n === 1 ? 'destroy' : { json: subaccount('s1') }),
    'GET /subaccounts/s2': () => 'destroy',
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath, { maxRetries: 1 }));
  assert.equal((await subaccounts.getSubaccount({ subaccountId: 's1' })).id, 's1');
  await assert.rejects(subaccounts.getSubaccount({ subaccountId: 's2' }), sdk.FetchError);
  assert.equal(api.count('GET /subaccounts/s2'), 2);
});

test('a 401 logs in again once and retries', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts/s1': (req) => (req.headers.authorization === 'Bearer token-1'
      ? { status: 401, json: { title: 'Unauthorized', detail: 'token revoked' } }
      : { json: subaccount('s1') }),
  });
  const result = await new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' });
  assert.equal(result.id, 's1');
  assert.equal(api.count(`POST ${TOKEN_PATH}`), 2);
  assert.equal(api.requests.at(-1).headers.authorization, 'Bearer token-2');
});

test('the token request is retried on 5xx', async (t) => {
  let n = 0;
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => (++n === 1
      ? { status: 503, text: 'unavailable' }
      : { json: { access_token: 'token-ok', token_type: 'Bearer', expires_in: 300 } }),
    'GET /subaccounts/s1': () => ({ json: subaccount('s1') }),
  });
  await new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' });
  assert.equal(api.requests.at(-1).headers.authorization, 'Bearer token-ok');
});

// Timeouts

test('a slow answer throws TimeoutError after timeoutMs', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ delayMs: 400, json: subaccount('s1') }) });
  const started = Date.now();
  const err = await new sdk.SubaccountsApi(config(api.basePath, { timeoutMs: 100, maxRetries: 0 }))
    .getSubaccount({ subaccountId: 's1' }).catch((e) => e);
  assert.ok(err instanceof sdk.TimeoutError, err && err.name);
  assert.ok(err instanceof sdk.FetchError);
  assert.equal(err.timeoutMs, 100);
  assert.ok(Date.now() - started < 380);
});

test('a timed-out GET is retried', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts/s1': (req, body, n) => ({ delayMs: n === 1 ? 400 : 0, json: subaccount('s1') }),
  });
  const result = await new sdk.SubaccountsApi(config(api.basePath, { timeoutMs: 150 })).getSubaccount({ subaccountId: 's1' });
  assert.equal(result.id, 's1');
  assert.equal(api.count('GET /subaccounts/s1'), 2);
});

test('the default timeout is 30 seconds and the caller signal still aborts', async (t) => {
  assert.equal(config('http://x').timeoutMs, 30_000);
  assert.equal(config('http://x').maxRetries, 2);
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ delayMs: 400, json: subaccount('s1') }) });
  const err = await new sdk.SubaccountsApi(config(api.basePath))
    .getSubaccount({ subaccountId: 's1' }, { signal: AbortSignal.timeout(100) }).catch((e) => e);
  assert.ok(!(err instanceof sdk.TimeoutError));
  assert.equal(err.name, 'TimeoutError'); // the DOMException from AbortSignal.timeout, passed through
  assert.equal(api.count('GET /subaccounts/s1'), 1); // a caller abort is not retried
});

// Token sharing

test('concurrent first calls share one token request', async (t) => {
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => ({ delayMs: 50, json: { access_token: 'shared', token_type: 'Bearer', expires_in: 300 } }),
    'GET /subaccounts/s1': () => ({ json: subaccount('s1') }),
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath));
  const banks = new sdk.banking.BankLinksApi(subaccounts['configuration']);
  await Promise.all([
    ...Array.from({ length: 5 }, () => subaccounts.getSubaccount({ subaccountId: 's1' })),
    banks.getBankLinkRaw({ bankLinkId: 'none' }).catch(() => undefined),
  ]);
  assert.equal(api.count(`POST ${TOKEN_PATH}`), 1);
  for (const r of api.requests.filter((x) => x.key === 'GET /subaccounts/s1')) {
    assert.equal(r.headers.authorization, 'Bearer shared');
  }
});

test('a failed shared token request fails every waiting call, and the next call tries again', async (t) => {
  let n = 0;
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => (++n === 1
      ? { delayMs: 30, status: 401, json: { error: 'invalid_client', error_description: 'Invalid client credentials' } }
      : { json: { access_token: 'second', token_type: 'Bearer', expires_in: 300 } }),
    'GET /subaccounts/s1': () => ({ json: subaccount('s1') }),
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath));
  const results = await Promise.allSettled([1, 2, 3].map(() => subaccounts.getSubaccount({ subaccountId: 's1' })));
  assert.deepEqual(results.map((r) => r.status), ['rejected', 'rejected', 'rejected']);
  assert.ok(results[0].reason instanceof sdk.AuthenticationError);
  assert.equal(results[0].reason.code, 'invalid_client');
  assert.equal(api.count(`POST ${TOKEN_PATH}`), 1);
  await subaccounts.getSubaccount({ subaccountId: 's1' });
  assert.equal(api.count(`POST ${TOKEN_PATH}`), 2);
});

// Pagination

test('paginate follows the cursor in _links.next and keeps the other parameters', async (t) => {
  const pages = {
    '': { items: ['a', 'b'], next: '/subaccounts?cursor=c2&limit=2' },
    c2: { items: ['c', 'd'], next: '/subaccounts?cursor=c3&limit=2' },
    c3: { items: ['e'] },
  };
  const api = await standIn(t, {
    'GET /subaccounts': (req, body, n, url) => {
      const page = pages[url.searchParams.get('cursor') ?? ''];
      return {
        json: {
          _links: { self: { href: url.pathname }, ...(page.next ? { next: { href: page.next } } : {}) },
          _embedded: { subaccounts: page.items.map((id) => subaccount(id)) },
        },
      };
    },
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath));
  const ids = [];
  for await (const s of sdk.paginate((p) => subaccounts.listSubaccounts(p), { limit: 2 })) ids.push(s.id);
  assert.deepEqual(ids, ['a', 'b', 'c', 'd', 'e']);
  const queries = api.requests.filter((r) => r.key === 'GET /subaccounts').map((r) => r.url.search);
  assert.deepEqual(queries, ['?limit=2', '?cursor=c2&limit=2', '?cursor=c3&limit=2']);
  assert.ok(sdk.paginate.length >= 1);

  const firstThree = await sdk.listAll((p) => subaccounts.listSubaccounts(p), { limit: 2 }, { maxItems: 3 });
  assert.deepEqual(firstThree.map((s) => s.id), ['a', 'b', 'c']);
});

test('paginate follows offset links', async (t) => {
  const api = await standIn(t, {
    'GET /cards': (req, body, n, url) => {
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const card = (id) => ({
        _links: { self: { href: `/cards/${id}` } }, id, subaccountId: 's1', expiryMonth: 1, expiryYear: 2030,
        country: 'USA', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
      });
      return {
        json: {
          _links: { self: { href: '/cards' }, ...(offset < 2 ? { next: { href: `/cards?limit=1&offset=${offset + 1}` } } : {}) },
          _embedded: { cards: [card(`card-${offset}`)] },
        },
      };
    },
  });
  const cards = new sdk.CardApi(config(api.basePath));
  const all = await sdk.listAll((p) => cards.listCards(p), { limit: 1 });
  assert.deepEqual(all.map((c) => c.id), ['card-0', 'card-1', 'card-2']);
});

test('paginate reads the Banking API cursor shape', async (t) => {
  const link = (id) => ({ _links: { self: { href: `/bank-links/${id}` } }, id, accountId: 'a', subaccountId: 's', state: 'pending', hostedLink: null, linkExpiresAt: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' });
  const api = await standIn(t, {
    'GET /bank-links': (req, body, n, url) => (url.searchParams.get('cursor') === 'next'
      ? { json: { items: [link('b')], pagination: { hasMore: false } } }
      : { json: { items: [link('a')], pagination: { hasMore: true, cursor: 'next' } } }),
  });
  const bankLinks = new sdk.banking.BankLinksApi(config(api.basePath));
  const all = await sdk.listAll((p) => bankLinks.listBankLinks(p));
  assert.deepEqual(all.map((l) => l.id), ['a', 'b']);
});

// Tolerant responses

test('an unknown enum value is kept as a string and unknown fields are ignored', async (t) => {
  const api = await standIn(t, {
    'GET /card-verifications/3ds/v1': () => ({
      json: {
        _links: { self: { href: '/card-verifications/3ds/v1' } },
        id: 'v1', subaccountId: 's1', cardId: 'c1',
        type: '3DS',
        state: 'needs-review', // not in the spec's enum
        failureReason: { category: 'brand_new_category', description: 'New', retryable: false, futureField: 1 },
        createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
        addedLater: { nested: true },
      },
    }),
  });
  const v = await new sdk.CardVerificationApi(config(api.basePath)).getCardVerification({ verificationId: 'v1' });
  assert.equal(v.state, 'needs-review');
  assert.equal(v.failureReason.category, 'brand_new_category');
  assert.ok(v.createdAt instanceof Date);
  assert.equal('addedLater' in v, false);
  assert.equal('futureField' in v.failureReason, false);
});

test('a oneOf response of an unknown shape is kept as received, not emptied', async (t) => {
  const unknownShape = { id: 'e1', somethingNew: true };
  const api = await standIn(t, { 'POST /network-bulk-enrollments': () => ({ status: 201, json: unknownShape }) });
  const result = await new sdk.NetworkBulkEnrollmentsApi(config(api.basePath))
    .createNetworkBulkEnrollmentRaw({ networkBulkEnrollmentCreateParams: {} })
    .then((r) => r.value());
  assert.deepEqual(result, unknownShape);
});

// Bodies that stall after the headers

test('a body that stalls after the headers is bounded by timeoutMs', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ stallBody: true }) });
  const started = Date.now();
  const err = await new sdk.SubaccountsApi(config(api.basePath, { timeoutMs: 150, maxRetries: 0 }))
    .getSubaccount({ subaccountId: 's1' }).catch((e) => e);
  assert.ok(err instanceof sdk.TimeoutError, err && `${err.name}: ${err.message}`);
  assert.ok(Date.now() - started < 1500, `took ${Date.now() - started} ms`);
});

test("the caller's signal still cancels a body read after the headers", async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ stallBody: true }) });
  const started = Date.now();
  const err = await new sdk.SubaccountsApi(config(api.basePath))
    .getSubaccount({ subaccountId: 's1' }, { signal: AbortSignal.timeout(150) }).catch((e) => e);
  assert.ok(!(err instanceof sdk.TimeoutError), err && err.name);
  assert.equal(err.name, 'TimeoutError'); // the caller's own DOMException, passed through
  assert.ok(Date.now() - started < 1500, `took ${Date.now() - started} ms`);
});

test('a stalled token body is retried like a failed token request', async (t) => {
  let n = 0;
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => (++n === 1 ? { stallBody: true } : { json: { access_token: 'fresh', token_type: 'Bearer', expires_in: 300 } }),
    'GET /subaccounts/s1': () => ({ json: subaccount('s1') }),
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath, { timeoutMs: 150 }));
  const both = await Promise.all([1, 2].map(() => subaccounts.getSubaccount({ subaccountId: 's1' })));
  assert.deepEqual(both.map((s) => s.id), ['s1', 's1']);
  assert.equal(api.count(`POST ${TOKEN_PATH}`), 2);
});

test('a stalled token body times out and does not leave later calls waiting on it', async (t) => {
  let n = 0;
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => (++n === 1 ? { stallBody: true } : { json: { access_token: 'fresh', token_type: 'Bearer', expires_in: 300 } }),
    'GET /subaccounts/s1': () => ({ json: subaccount('s1') }),
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath, { timeoutMs: 150, maxRetries: 0 }));
  const first = await Promise.allSettled([1, 2].map(() => subaccounts.getSubaccount({ subaccountId: 's1' })));
  assert.deepEqual(first.map((r) => r.status), ['rejected', 'rejected']);
  assert.ok(first[0].reason instanceof sdk.TimeoutError, first[0].reason && first[0].reason.name);
  assert.equal((await subaccounts.getSubaccount({ subaccountId: 's1' })).id, 's1');
  assert.equal(api.count(`POST ${TOKEN_PATH}`), 2);
});

test('a slow but complete body inside the deadline is read whole', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ delayMs: 50, json: subaccount('s1') }) });
  const result = await new sdk.SubaccountsApi(config(api.basePath, { timeoutMs: 1000 })).getSubaccount({ subaccountId: 's1' });
  assert.equal(result.id, 's1');
});

// Concurrent 401s and the login's settings

test('concurrent 401s on one stale token cause one new login', async (t) => {
  let n = 0;
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => ({ delayMs: 30, json: { access_token: `token-${++n}`, token_type: 'Bearer', expires_in: 300 } }),
    'GET /subaccounts/s1': (req) => (req.headers.authorization === 'Bearer token-1'
      ? { delayMs: 20, status: 401, json: { title: 'Unauthorized', detail: 'revoked' } }
      : { json: subaccount('s1') }),
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath));
  await subaccounts.getSubaccount({ subaccountId: 'warm' }).catch(() => undefined); // caches token-1
  const results = await Promise.all([1, 2, 3, 4].map(() => subaccounts.getSubaccount({ subaccountId: 's1' })));
  assert.deepEqual(results.map((r) => r.id), ['s1', 's1', 's1', 's1']);
  assert.equal(api.count(`POST ${TOKEN_PATH}`), 2);
});

test('a refused login is never retried, whatever maxRetries is', async (t) => {
  for (const status of [400, 401, 403]) {
    const api = await standIn(t, {
      [`POST ${TOKEN_PATH}`]: () => ({ status, json: { error: 'invalid_client', error_description: 'no' } }),
    });
    const err = await new sdk.SubaccountsApi(config(api.basePath, { maxRetries: 3 })).getSubaccount({ subaccountId: 's1' }).catch((e) => e);
    assert.ok(err instanceof sdk.AuthenticationError, `${status}: ${err && err.name}`);
    assert.equal(api.count(`POST ${TOKEN_PATH}`), 1, `${status} sent once`);
  }
});

test("the login uses the client's fetch, timeout and retry settings", async (t) => {
  const seen = [];
  const fetchApi = (url, init) => {
    seen.push(String(url));
    return fetch(url, init);
  };
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => ({ status: 503, text: 'busy' }),
  });
  const noRetries = await new sdk.SubaccountsApi(config(api.basePath, { maxRetries: 0, fetchApi })).getSubaccount({ subaccountId: 's1' }).catch((e) => e);
  assert.ok(noRetries instanceof sdk.InternalServerError);
  assert.equal(api.count(`POST ${TOKEN_PATH}`), 1);
  assert.deepEqual(seen, [`${api.basePath}${TOKEN_PATH}`]);

  const slow = await standIn(t, { [`POST ${TOKEN_PATH}`]: () => ({ delayMs: 400, json: { access_token: 'late', token_type: 'Bearer', expires_in: 300 } }) });
  const timedOut = await new sdk.SubaccountsApi(config(slow.basePath, { timeoutMs: 100, maxRetries: 0 })).getSubaccount({ subaccountId: 's1' }).catch((e) => e);
  assert.ok(timedOut instanceof sdk.TimeoutError, timedOut && timedOut.name);
});

// oneOf round trip

test('a oneOf value of an unknown shape is sent back as it is, not as {}', () => {
  const unknownShape = { id: 'e1', somethingNew: true };
  assert.deepEqual(sdk.NetworkBulkEnrollmentCreateResultToJSON(sdk.NetworkBulkEnrollmentCreateResultFromJSON(unknownShape)), unknownShape);
});

// Sandbox guard

function spyFetch() {
  const calls = [];
  const fetchApi = async (url, init = {}) => {
    calls.push(String(url));
    const body = String(url).includes('/openid-connect/token')
      ? { access_token: 't', token_type: 'Bearer', expires_in: 300 }
      : { messageId: 'm1' };
    return new Response(JSON.stringify(body), { status: String(url).includes('/token') ? 200 : 202, headers: { 'Content-Type': 'application/json' } });
  };
  return { calls, fetchApi };
}

const simulate = (cfg) => new sdk.sandbox.SandboxSimulationApi(cfg).simulateTransaction({
  simulateTransactionRequest: { cardId: 'c1', type: 'authorization', amount: 4500 },
});
const creds = { accountId: 'acct-1', clientId: 'c', clientSecret: 's' };

test('sandbox calls run with environment sandbox on the sandbox host', async () => {
  const { calls, fetchApi } = spyFetch();
  const result = await simulate(new sdk.Configuration({ ...creds, environment: 'sandbox', fetchApi }));
  assert.equal(result.messageId, 'm1');
  assert.deepEqual(calls, [
    'https://api.sandbox.astrada.co/auth/realms/acct-1/protocol/openid-connect/token',
    'https://api.sandbox.astrada.co/simulate/transactions',
  ]);
});

test('sandbox calls throw SandboxOnlyError before any request outside the sandbox', async () => {
  const refused = [
    { environment: 'production' },
    { environment: 'sandbox', basePath: 'http://127.0.0.1:9' }, // custom host, not marked
    { environment: 'sandbox', basePath: 'https://api.astrada.co', basePathIsSandbox: true }, // production host, marked
    { basePath: 'http://127.0.0.1:9', basePathIsSandbox: true }, // marked, but no environment
    { environment: 'production', basePath: 'https://api.sandbox.astrada.co' }, // sandbox host, production environment
    // Marking is only for hosts outside Astrada: no other Astrada host passes.
    { environment: 'sandbox', basePath: 'https://api.astrada.co/', basePathIsSandbox: true },
    { environment: 'sandbox', basePath: 'https://API.Astrada.co', basePathIsSandbox: true },
    { environment: 'sandbox', basePath: 'https://api.staging.astrada.co', basePathIsSandbox: true },
    { environment: 'sandbox', basePath: 'https://astrada.co', basePathIsSandbox: true },
    { environment: 'sandbox', basePath: 'https://api.astrada.co.', basePathIsSandbox: true },
  ];
  for (const options of refused) {
    const { calls, fetchApi } = spyFetch();
    const cfg = new sdk.Configuration({ ...creds, ...options, fetchApi });
    await assert.rejects(simulate(cfg), (err) => {
      assert.ok(err instanceof sdk.SandboxOnlyError, `${JSON.stringify(options)} gave ${err && err.name}`);
      assert.equal(err.name, 'SandboxOnlyError');
      return true;
    });
    assert.deepEqual(calls, [], `no request for ${JSON.stringify(options)}`);
  }
});

test('the guard also holds with a static token and on middleware copies', async () => {
  const { calls, fetchApi } = spyFetch();
  const cfg = new sdk.Configuration({ accessToken: 'given', environment: 'production', fetchApi });
  const api = new sdk.sandbox.SandboxSimulationApi(cfg).withPreMiddleware(async (ctx) => ctx);
  await assert.rejects(api.simulateTransaction({ simulateTransactionRequest: { cardId: 'c1', type: 'settlement' } }), sdk.SandboxOnlyError);
  assert.deepEqual(calls, []);
});

test('a custom base URL marked as sandbox passes the guard', async (t) => {
  const api = await standIn(t, { 'POST /simulate/transactions': () => ({ status: 202, json: { messageId: 'm2' } }) });
  const cfg = config(api.basePath, { environment: 'sandbox', basePathIsSandbox: true });
  const result = await new sdk.sandbox.SandboxSimulationApi(cfg).simulateTransaction({
    simulateTransactionRequest: { cardId: 'c1', type: 'authorization', dateTime: new Date('2026-10-14T09:30:00Z') },
  });
  assert.equal(result.messageId, 'm2');
  const sent = api.requests.find((r) => r.key === 'POST /simulate/transactions');
  assert.deepEqual(JSON.parse(sent.body), { cardId: 'c1', type: 'authorization', dateTime: '2026-10-14T09:30:00.000Z' });
  assert.equal(sdk.sandbox.Configuration, sdk.Configuration);
  assert.equal(sdk.sandbox.ResponseError, sdk.ResponseError);
});

test('a static accessToken is sent without logging in', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ json: subaccount('s1') }) });
  const cfg = new sdk.Configuration({ basePath: api.basePath, accessToken: async () => 'from-elsewhere' });
  await new sdk.SubaccountsApi(cfg).getSubaccount({ subaccountId: 's1' });
  assert.deepEqual(api.requests.map((r) => r.key), ['GET /subaccounts/s1']);
  assert.equal(api.requests[0].headers.authorization, 'Bearer from-elsewhere');
  assert.throws(() => new sdk.Configuration({ environment: 'sandbox' }), /accountId, clientId and clientSecret/);
});

// Testing entry point

test('createMockFetch answers every operation from the spec examples', async () => {
  const testing = require('@astrada.co/ts-astrada-sdk/testing');
  const fetchApi = testing.createMockFetch();
  const cfg = new sdk.Configuration({ ...creds, environment: 'sandbox', fetchApi });

  const page = await new sdk.SubaccountsApi(cfg).listSubaccounts();
  assert.ok(page._embedded.subaccounts.length > 0);
  assert.ok(page._embedded.subaccounts[0].createdAt instanceof Date);
  const open = await new sdk.NetworkBulkEnrollmentsApi(cfg).getOpenNetworkBulkEnrollmentRaw({ subaccountId: 's1', network: 'VISA', bin: '411111' });
  assert.equal(open.raw.status, 200);
  await new sdk.banking.BankLinksApi(cfg).listBankLinks({});
  await new sdk.sandbox.SandboxSimulationApi(cfg).simulateTransaction({ simulateTransactionRequest: { cardId: 'c1', type: 'authorization' } });
  assert.deepEqual(fetchApi.calls.map((c) => c.operationId),
    ['login', 'listSubaccounts', 'getOpenNetworkBulkEnrollment', 'listBankLinks', 'simulateTransaction']);

  const names = testing.mockOperations().map((o) => o.operationId);
  for (const name of ['listSubaccounts', 'createEnrollmentLink', 'listBankLinks', 'simulateTransaction', 'lookupBin']) {
    assert.ok(names.includes(name), name);
  }
});

test('createMockFetch overrides answer by method name and see the request', async () => {
  const { createMockFetch } = await import('@astrada.co/ts-astrada-sdk/testing');
  const fetchApi = createMockFetch({
    overrides: {
      getSubaccount: ({ params }) => ({ status: 404, body: { title: 'Not Found', detail: `No subaccount ${params.subaccountId}` } }),
      createEnrollmentLink: ({ body }) => ({ status: 409, body: { title: 'Conflict', detail: 'off', code: 'CARD_ENROLLMENT_OFF', echo: body.kind } }),
    },
  });
  const cfg = new sdk.Configuration({ ...creds, environment: 'sandbox', fetchApi });
  const err = await new sdk.SubaccountsApi(cfg).getSubaccount({ subaccountId: 'abc' }).catch((e) => e);
  assert.ok(err instanceof sdk.NotFoundError);
  assert.equal(err.detail, 'No subaccount abc');
  const conflict = await new sdk.EnrollmentLinksApi(cfg)
    .createEnrollmentLink({ enrollmentLinkCreateParams: { subaccountId: 's1', kind: 'team' } }).catch((e) => e);
  assert.equal(conflict.code, 'CARD_ENROLLMENT_OFF');
  assert.equal(conflict.body.echo, 'team');
  assert.throws(() => createMockFetch({ overrides: { noSuchOperation: {} } }), RangeError);
  const created = await new sdk.EnrollmentLinksApi(new sdk.Configuration({ ...creds, environment: 'sandbox',
    fetchApi: createMockFetch({ overrides: { createEnrollmentLink: { body: { id: 'l1' } } } }) }))
    .createEnrollmentLinkRaw({ enrollmentLinkCreateParams: { subaccountId: 's1', kind: 'team' } });
  assert.equal(created.raw.status, 201); // the operation's own status when the override gives none
  const prefixed = createMockFetch({ basePath: 'http://127.0.0.1:4010/astrada' });
  const page = await new sdk.SubaccountsApi(new sdk.Configuration({ ...creds, basePath: 'http://127.0.0.1:4010/astrada', fetchApi: prefixed }))
    .listSubaccounts();
  assert.ok(page._embedded.subaccounts.length > 0);
  const unknown = await fetchApi('https://api.sandbox.astrada.co/nowhere');
  assert.equal(unknown.status, 404);
});

// Bulk-feed file simulations

test('simulateBulkFeedFile dispatches by feed type and sends the rest as the body', async (t) => {
  const accepted = () => ({ status: 202 });
  const api = await standIn(t, {
    'POST /simulate/ingestion/amex-gl': accepted,
    'POST /simulate/ingestion/smartdata': accepted,
    'POST /simulate/ingestion/vbds': accepted,
    'POST /simulate/ingestion/vcf': accepted,
  });
  const simulations = new sdk.sandbox.SandboxApi(config(api.basePath, { environment: 'sandbox', basePathIsSandbox: true }));
  const cases = [
    ['GL', 'R123456', '/simulate/ingestion/amex-gl'],
    ['SMARTDATA', 'G1234567', '/simulate/ingestion/smartdata'],
    ['VBDS', '1_12345_67890_54321', '/simulate/ingestion/vbds'],
    ['VCF', '1_123_45_6789', '/simulate/ingestion/vcf'],
  ];
  for (const [type, networkReference, path] of cases) {
    await simulations.simulateBulkFeedFile({ type, networkReference, cardCount: 1, newCardCount: 2, transactionsPerCard: 0 });
    const sent = api.requests.filter((r) => r.key === `POST ${path}`);
    assert.equal(sent.length, 1, type);
    assert.deepEqual(JSON.parse(sent[0].body), { networkReference, cardCount: 1, newCardCount: 2, transactionsPerCard: 0 });
  }
  await assert.rejects(simulations.simulateBulkFeedFile({ type: 'TNS', networkReference: 'x' }), RangeError);
  assert.equal(typeof simulations.simulateTransaction, 'function');
});

test('simulateBulkFeedFile keeps the sandbox-only guard', async () => {
  const { calls, fetchApi } = spyFetch();
  const prod = new sdk.sandbox.SandboxApi(new sdk.Configuration({ ...creds, environment: 'production', fetchApi }));
  await assert.rejects(prod.simulateBulkFeedFile({ type: 'VCF', networkReference: '1_123_45_6789' }), sdk.SandboxOnlyError);
  const generated = new sdk.sandbox.SandboxSimulationApi(new sdk.Configuration({ ...creds, environment: 'sandbox', basePath: 'http://127.0.0.1:9', fetchApi }));
  await assert.rejects(generated.simulateBulkFeedFileGl({ simulateBulkFeedFileGlRequest: { networkReference: 'R1' } }), sdk.SandboxOnlyError);
  // The sandbox-only deletes in the sandbox module are refused the same way.
  const prodConfig = new sdk.Configuration({ ...creds, environment: 'production', fetchApi });
  await assert.rejects(new sdk.sandbox.SubaccountsApi(prodConfig).deleteSubaccount({ subaccountId: 's1' }), sdk.SandboxOnlyError);
  await assert.rejects(new sdk.sandbox.CardSubscriptionApi(prodConfig).deleteCardSubscription({ subscriptionId: 'cs1' }), sdk.SandboxOnlyError);
  await assert.rejects(new sdk.sandbox.NetworkBulkFeedsApi(prodConfig).deleteNetworkBulkFeed({ networkBulkFeedId: 'nbf1' }), sdk.SandboxOnlyError);
  assert.deepEqual(calls, []);
});

// Operations that need banking:admin

test('an operation that needs banking:admin refused with 403 throws ScopeRequiredError naming the scope', async (t) => {
  const forbidden = () => ({ status: 403, json: { title: 'Forbidden', detail: 'Insufficient scope' } });
  const api = await standIn(t, {
    'POST /bank-links/bl1/sync': forbidden,
    'GET /bank-links/bl1': forbidden,
    'GET /bank-subscriptions': () => ({ status: 404, json: { statusCode: 404, message: 'none' } }),
  });
  const cfg = config(api.basePath);
  const err = await new sdk.banking.BankLinksApi(cfg).syncBankLink({ bankLinkId: 'bl1' }).catch((e) => e);
  assert.ok(err instanceof sdk.ScopeRequiredError, err && err.name);
  assert.ok(err instanceof sdk.PermissionDeniedError);
  assert.ok(err instanceof sdk.ResponseError);
  assert.equal(err.status, 403);
  assert.equal(err.requiredScope, 'banking:admin');
  // The likely cause, not a certainty: a 403 can also mean the resource is not this account's.
  assert.match(err.message, /\(403\) This operation needs the `banking:admin` scope\. The likely cause is that your API client does not have it; if so, ask Astrada to enable it\. A 403 can also mean the resource is not this account's\. \(Insufficient scope\)/);

  // No banking:admin needed: an ordinary PermissionDeniedError. Needs it but not a 403: the usual class.
  const plain = await new sdk.banking.BankLinksApi(cfg).getBankLink({ bankLinkId: 'bl1' }).catch((e) => e);
  assert.ok(plain instanceof sdk.PermissionDeniedError && !(plain instanceof sdk.ScopeRequiredError));
  const missing = await new sdk.banking.BankSubscriptionsApi(cfg).listBankSubscriptions({}).catch((e) => e);
  assert.ok(missing instanceof sdk.NotFoundError);
});

test('banking:admin marking follows the definition: every banking:admin operation, and only those', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const dir = new URL('../src/banking/apis/', import.meta.url);
  const marked = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('Api.ts'))) {
    const text = readFileSync(new URL(file, dir), 'utf8');
    for (const m of text.matchAll(/async (\w+)Raw\([\s\S]*?const response = await this\.request\(\{([\s\S]*?)\}, initOverrides\)/g)) {
      const scopes = /accessToken\("main-auth", \[([^\]]*)\]\)/.exec(m[0])?.[1] ?? '';
      const staff = /staffOnlyScope: 'banking:admin'/.test(m[2]);
      assert.equal(staff, scopes.includes('banking:admin'), m[1]);
      if (staff) marked.push(m[1]);
    }
  }
  assert.equal(marked.length, 10);
  const page = readFileSync(new URL('../docs/banking/BankLinksApi.md', import.meta.url), 'utf8');
  assert.match(page, /## syncBankLink \(needs banking:admin\)\n\n> \*\*Needs banking:admin\.\*\* If your API client does not have the `banking:admin` scope/);
  // The summary does not repeat the template's "Needs banking:admin." prefix.
  assert.match(page, /\| Needs banking:admin\. Sync bank link \|/);
  assert.doesNotMatch(page, /Needs banking:admin\. Needs banking:admin/);
});

// Webhook events

test('constructWebhookEvent verifies and types the event', () => {
  const key = Buffer.from('test-secret-key-0123456789abcdef');
  const secret = `whsec_${key.toString('base64')}`;
  const body = JSON.stringify({
    _links: { self: { href: '/transactions/t1' }, subaccount: { href: '/subaccounts/s1' }, card: { href: '/cards/c1' }, messages: [] },
    acceptor: { city: 'AUSTIN', country: 'USA', mcc: '5814' },
    cardId: 'c1', cardholderBillingCurrency: 'USD', cardholderBillingHoldAmount: 45, cardholderBillingSettledAmount: 0,
    descriptor: 'Corner Coffee', id: 't1', network: 'VISA', subaccountId: 's1', status: 'PENDING',
    transactionCurrency: 'USD', transactionHoldAmount: 45, transactionOccurrenceDate: null, transactionSettledAmount: 0,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  });
  const id = 'msg_1';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
  const headers = { 'webhook-id': id, 'webhook-timestamp': timestamp, 'webhook-signature': `v1,${signature}` };

  const event = sdk.constructWebhookEvent(body, { ...headers, 'webhook-event-type': 'transaction.created' }, secret);
  assert.equal(event.type, 'transaction.created');
  assert.equal(event.id, 'msg_1');
  assert.equal(event.data.status, 'PENDING');
  assert.ok(event.data.createdAt instanceof Date);

  const other = sdk.constructWebhookEvent(body, { ...headers, 'webhook-event-type': 'something.new' }, secret);
  assert.equal(other.type, 'something.new');
  assert.equal(other.data.createdAt, '2026-01-01T00:00:00Z');

  assert.throws(() => sdk.constructWebhookEvent(body, headers, secret), sdk.WebhookVerificationError);
  assert.equal(sdk.WebhookEventType.TransactionCreated, 'transaction.created');
});


// Review Bot follow-ups on #161

const sandboxConfig = (basePath, extra = {}) => config(basePath, { environment: 'sandbox', basePathIsSandbox: true, ...extra });

test('the sandbox deletes are never retried and wait longer than timeoutMs', async (t) => {
  const api = await standIn(t, {
    'DELETE /subaccounts/slow': () => ({ status: 204, delayMs: 300 }),
    'DELETE /subaccounts/failed': () => ({ status: 502, json: { title: 'Bad Gateway', detail: 'a step failed' } }),
  });
  const cfg = sandboxConfig(api.basePath, { timeoutMs: 100, maxRetries: 2 });
  // Slower than timeoutMs, inside SANDBOX_DELETE_TIMEOUT_MS: done, once.
  await new sdk.sandbox.SandboxApi(cfg).deleteSubaccount({ subaccountId: 'slow' });
  assert.equal(api.count('DELETE /subaccounts/slow'), 1);
  // A 502 is thrown, not re-sent.
  const err = await new sdk.sandbox.SubaccountsApi(cfg).deleteSubaccount({ subaccountId: 'failed' }).catch((e) => e);
  assert.ok(err instanceof sdk.InternalServerError, err && err.name);
  assert.equal(api.count('DELETE /subaccounts/failed'), 1);
  assert.equal(sdk.sandbox.SANDBOX_DELETE_TIMEOUT_MS, 300_000);
});

test('SandboxApi has the three deletes, guarded like the simulations', async () => {
  const { calls, fetchApi } = spyFetch();
  const prod = new sdk.sandbox.SandboxApi(new sdk.Configuration({ ...creds, environment: 'production', fetchApi }));
  await assert.rejects(prod.deleteSubaccount({ subaccountId: 's1' }), sdk.SandboxOnlyError);
  await assert.rejects(prod.deleteCardSubscription({ subscriptionId: 'cs1' }), sdk.SandboxOnlyError);
  await assert.rejects(prod.deleteNetworkBulkFeed({ networkBulkFeedId: 'nbf1' }), sdk.SandboxOnlyError);
  assert.deepEqual(calls, []);
});

test('sandbox calls to the sandbox host need https', async () => {
  const { calls, fetchApi } = spyFetch();
  const plain = new sdk.Configuration({ ...creds, environment: 'sandbox', basePath: 'http://api.sandbox.astrada.co', fetchApi });
  await assert.rejects(simulate(plain), /need https/);
  assert.deepEqual(calls, []);
});

test('a response dropped for a retry or a new login is cancelled', async () => {
  const cancelled = [];
  let n = 0;
  const body = (label, text) => new ReadableStream({
    start(c) { c.enqueue(new TextEncoder().encode(text)); },
    cancel() { cancelled.push(label); },
  });
  const fetchApi = async (url) => {
    if (String(url).includes('/token')) {
      return new Response(JSON.stringify({ access_token: `t${++n}`, token_type: 'Bearer', expires_in: 300 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const call = ++n;
    if (call === 2) return new Response(body('401', '{"title":"Unauthorized"}'), { status: 401 });
    if (call === 4) return new Response(body('503', '{"title":"Unavailable"}'), { status: 503 });
    return new Response(JSON.stringify(subaccount('s1')), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const cfg = new sdk.Configuration({ ...creds, basePath: 'http://127.0.0.1:9', fetchApi, retryDelayMs: 1 });
  const got = await new sdk.SubaccountsApi(cfg).getSubaccount({ subaccountId: 's1' });
  assert.equal(got.id, 's1');
  assert.deepEqual(cancelled, ['401', '503']);
});

test('a custom fetchApi answering with no body or a body that is not a web stream works', async () => {
  const json = JSON.stringify(subaccount('s1'));
  const fetchApi = async (url) => {
    if (String(url).endsWith('/webhooks/w1')) {
      // Like a minimal fetch polyfill: a 204 with body undefined.
      return { status: 204, statusText: 'No Content', ok: true, headers: new Headers(), body: undefined, url: String(url), redirected: false };
    }
    // Like node-fetch: the body is a Node stream, read through arrayBuffer().
    const { Readable } = await import('node:stream');
    return {
      status: 200, statusText: 'OK', ok: true, url: String(url), redirected: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: Readable.from([Buffer.from(json)]),
      arrayBuffer: async () => new TextEncoder().encode(json).buffer,
    };
  };
  const cfg = new sdk.Configuration({ basePath: 'https://stand-in.invalid', accessToken: 't', fetchApi });
  await new sdk.WebhooksApi(cfg).deleteWebhook({ webhookId: 'w1' });
  const raw = await new sdk.SubaccountsApi(cfg).getSubaccountRaw({ subaccountId: 's1' });
  assert.equal((await raw.value()).id, 's1');
  assert.equal(raw.raw.url, 'https://stand-in.invalid/subaccounts/s1');
  assert.equal(raw.raw.redirected, true);
});

test('a GET whose body times out or drops while being read is retried', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts/s1': (_req, _body, count) => (count === 1 ? { stallBody: true } : { json: subaccount('s1') }),
    'GET /subaccounts/s2': (_req, _body, count) => (count === 1 ? { dropBody: true } : { json: subaccount('s2') }),
  });
  const api2 = new sdk.SubaccountsApi(config(api.basePath, { timeoutMs: 150, maxRetries: 1 }));
  assert.equal((await api2.getSubaccount({ subaccountId: 's1' })).id, 's1');
  assert.equal(api.count('GET /subaccounts/s1'), 2);
  assert.equal((await api2.getSubaccount({ subaccountId: 's2' })).id, 's2');
  assert.equal(api.count('GET /subaccounts/s2'), 2);
});

test('readErrorBody passes a timeout or the caller abort through, and treats other read failures as no body', async () => {
  const failing = (error) => new Response(new ReadableStream({ pull(c) { c.error(error); } }), { status: 500 });
  await assert.rejects(sdk.readErrorBody(failing(new sdk.TimeoutError(5))), sdk.TimeoutError);
  const controller = new AbortController();
  controller.abort(new Error('caller gave up'));
  await assert.rejects(sdk.readErrorBody(failing(new Error('caller gave up')), controller.signal), /caller gave up/);
  assert.equal(await sdk.readErrorBody(failing(new Error('socket hang up'))), undefined);
});

test('paginate goes on past an empty page that has a next cursor', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts': (_req, _body, _count, url) => {
      const cursor = url.searchParams.get('cursor');
      if (!cursor) return { json: { _embedded: { subaccounts: [] }, _links: { next: { href: '/subaccounts?cursor=c2' } } } };
      return { json: { _embedded: { subaccounts: [subaccount('s2')] }, _links: {} } };
    },
  });
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath));
  const all = await sdk.listAll((p) => subaccounts.listSubaccounts(p), {});
  assert.deepEqual(all.map((s) => s.id), ['s2']);
});




// Review Bot follow-ups on #161, second round

// Fails the test instead of hanging the run when a call never settles.
const within = (promise, ms = 3000) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`no answer within ${ms} ms (hang)`)), ms)),
]);

test('a retry and a new login work with a post middleware that never reads its clone', async (t) => {
  let tokens = 0;
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => ({ json: { access_token: `token-${++tokens}`, token_type: 'Bearer', expires_in: 300 } }),
    'GET /subaccounts/s1': (_req, _body, count) => (count === 1
      ? { status: 503, json: { title: 'Service Unavailable', detail: 'try again '.repeat(4000) } }
      : { json: subaccount('s1') }),
    'GET /subaccounts/s2': (req) => (req.headers.authorization === 'Bearer token-1'
      ? { status: 401, json: { title: 'Unauthorized', detail: 'revoked '.repeat(4000) } }
      : { json: subaccount('s2') }),
  });
  const statuses = [];
  // The README's logging middleware: it looks at the status and never reads the body.
  const logged = new sdk.SubaccountsApi(config(api.basePath)).withPostMiddleware(async ({ response }) => {
    statuses.push(response.status);
  });
  assert.equal((await within(logged.getSubaccount({ subaccountId: 's1' }))).id, 's1');
  assert.equal((await within(logged.getSubaccount({ subaccountId: 's2' }))).id, 's2');
  assert.deepEqual(statuses, [503, 200, 401, 200]);
});

test('a post middleware that returns its own clone does not hold a retry', async (t) => {
  const api = await standIn(t, {
    'GET /subaccounts/s1': (_req, _body, count) => (count === 1
      ? { status: 503, json: { title: 'Service Unavailable', detail: 'x'.repeat(100_000) } }
      : { json: subaccount('s1') }),
  });
  const passthrough = new sdk.SubaccountsApi(config(api.basePath)).withPostMiddleware(async ({ response }) => response);
  assert.equal((await within(passthrough.getSubaccount({ subaccountId: 's1' }))).id, 's1');
});

test('an error answer whose body cannot be read keeps its status', async (t) => {
  const api = await standIn(t, { 'POST /webhooks': () => ({ status: 409, stallBody: true }) });
  const err = await within(new sdk.WebhooksApi(config(api.basePath, { timeoutMs: 150 }))
    .createWebhook({ webhookCreateParams: { url: 'https://example.com/hook', events: ['transaction.created'] } })
    .catch((e) => e));
  assert.ok(err instanceof sdk.ConflictError, err && `${err.name}: ${err.message}`);
  assert.equal(err.status, 409);
  assert.equal(err.body, undefined);
});

test('a body that drops while being read reaches the onError middleware', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ dropBody: true }) });
  const seen = [];
  const watched = new sdk.SubaccountsApi(config(api.basePath, { maxRetries: 0 })).withMiddleware({
    onError: async ({ error }) => { seen.push(error); },
  });
  const err = await within(watched.getSubaccount({ subaccountId: 's1' }).catch((e) => e));
  assert.ok(err instanceof sdk.FetchError, err && err.name);
  assert.equal(seen.length, 1);
});

test('the SandboxApi deletes run its middleware and succeed', async (t) => {
  const api = await standIn(t, {
    'DELETE /card-subscriptions/cs1': () => ({ status: 204 }),
    'DELETE /network-bulk-feeds/nbf1': () => ({ status: 204 }),
    'DELETE /subaccounts/s1': () => ({ status: 204 }),
  });
  const seen = [];
  const sandboxApi = new sdk.sandbox.SandboxApi(sandboxConfig(api.basePath))
    .withPreMiddleware(async ({ url }) => { seen.push(new URL(url).pathname); });
  await within(sandboxApi.deleteCardSubscription({ subscriptionId: 'cs1' }));
  await within(sandboxApi.deleteNetworkBulkFeed({ networkBulkFeedId: 'nbf1' }));
  await within(sandboxApi.deleteSubaccount({ subaccountId: 's1' }));
  assert.deepEqual(seen, ['/card-subscriptions/cs1', '/network-bulk-feeds/nbf1', '/subaccounts/s1']);
});


// Review Bot follow-ups on #161, third round

test('a post middleware clone keeps url, and a returned clone keeps it on the result', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ json: subaccount('s1') }) });
  const urls = [];
  const subaccounts = new sdk.SubaccountsApi(config(api.basePath)).withPostMiddleware(async ({ response }) => {
    urls.push(response.url);
    return response;
  });
  const raw = await within(subaccounts.getSubaccountRaw({ subaccountId: 's1' }));
  assert.equal((await raw.value()).id, 's1');
  assert.deepEqual(urls, [`${api.basePath}/subaccounts/s1`]);
  assert.equal(raw.raw.url, `${api.basePath}/subaccounts/s1`);
});

test('a post middleware that reads the body and returns it fails once, without retries', async (t) => {
  const api = await standIn(t, { 'GET /subaccounts/s1': () => ({ json: subaccount('s1') }) });
  const careless = new sdk.SubaccountsApi(config(api.basePath)).withPostMiddleware(async ({ response }) => {
    await response.text();
    return response;
  });
  const err = await within(careless.getSubaccount({ subaccountId: 's1' }).catch((e) => e));
  assert.ok(!(err instanceof sdk.FetchError), err && err.name);
  assert.match(err.message, /return response\.clone\(\) instead/);
  assert.equal(api.count('GET /subaccounts/s1'), 1);
});

test('the SandboxApi deletes run configuration middleware once and instance middleware once', async (t) => {
  const api = await standIn(t, { 'DELETE /subaccounts/s1': () => ({ status: 204 }) });
  const calls = [];
  const cfg = sandboxConfig(api.basePath, { middleware: [{ pre: async () => { calls.push('configuration'); } }] });
  const sandboxApi = new sdk.sandbox.SandboxApi(cfg).withPreMiddleware(async () => { calls.push('instance'); });
  await within(sandboxApi.deleteSubaccount({ subaccountId: 's1' }));
  assert.deepEqual(calls, ['configuration', 'instance']);
});

test('a login redirect is not followed, so the client secret goes nowhere else', async (t) => {
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => ({ status: 307, headers: { Location: '/elsewhere?code=secret-code' } }),
    'POST /elsewhere': () => ({ json: { access_token: 'stolen', token_type: 'Bearer', expires_in: 300 } }),
  });
  const err = await within(new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' }).catch((e) => e));
  assert.ok(err instanceof sdk.AuthenticationError, err && err.name);
  assert.match(err.message, new RegExp(`redirect to ${api.basePath.replace(/[.]/g, '\\.')}\\.`));
  assert.doesNotMatch(err.message, /secret-code|elsewhere/);
  assert.equal(api.count('POST /elsewhere'), 0);
});

test('a sandbox delete refused with 401 is sent once more with a new token, and a 503 is not', async (t) => {
  let tokens = 0;
  const api = await standIn(t, {
    [`POST ${TOKEN_PATH}`]: () => ({ json: { access_token: `token-${++tokens}`, token_type: 'Bearer', expires_in: 300 } }),
    'DELETE /subaccounts/s1': (req) => (req.headers.authorization === 'Bearer token-1' ? { status: 401, json: { title: 'Unauthorized' } } : { status: 204 }),
    'DELETE /subaccounts/s2': (req) => (req.headers.authorization === 'Bearer token-2' ? { status: 401, json: { title: 'Unauthorized' } } : { status: 503, json: { title: 'Unavailable' } }),
  });
  const sandboxApi = new sdk.sandbox.SandboxApi(sandboxConfig(api.basePath));
  await within(sandboxApi.deleteSubaccount({ subaccountId: 's1' }));
  assert.equal(api.count('DELETE /subaccounts/s1'), 2);
  const err = await within(sandboxApi.deleteSubaccount({ subaccountId: 's2' }).catch((e) => e));
  assert.ok(err instanceof sdk.InternalServerError, err && err.name);
  assert.equal(api.count('DELETE /subaccounts/s2'), 2); // the 401, then the 503 once
});

test('constructWebhookEvent raises the typed webhook error for a body that lacks a mapped field', () => {
  const key = Buffer.from('test-secret-key-0123456789abcdef');
  const secret = `whsec_${key.toString('base64')}`;
  // _links without its messages list: the generated model maps that list and threw a TypeError.
  const body = JSON.stringify({ id: 't1', status: 'PENDING', _links: { self: { href: '/transactions/t1' } } });
  const id = 'msg_2';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
  const headers = { 'webhook-id': id, 'webhook-timestamp': timestamp, 'webhook-signature': `v1,${signature}`, 'webhook-event-type': 'transaction.created' };
  const err = (() => { try { sdk.constructWebhookEvent(body, headers, secret); } catch (e) { return e; } })();
  assert.ok(!(err instanceof TypeError), err && `${err.name}: ${err.message}`);
  assert.ok(err instanceof sdk.WebhookVerificationError, err && err.name);
  assert.ok(err instanceof sdk.WebhookPayloadError, err && err.name);
  assert.match(err.message, /transaction\.created/);
});

test('timeoutMs, maxRetries and retryDelayMs must be numbers of 0 or more', () => {
  const base = { accountId: 'a', clientId: 'c', clientSecret: 's', environment: 'sandbox' };
  for (const bad of [{ maxRetries: NaN }, { maxRetries: -1 }, { maxRetries: 1.5 }, { timeoutMs: Infinity }, { timeoutMs: '100' }, { retryDelayMs: -5 }]) {
    assert.throws(() => new sdk.Configuration({ ...base, ...bad }), RangeError, JSON.stringify(bad));
  }
  assert.equal(new sdk.Configuration({ ...base, maxRetries: 0, timeoutMs: 0, retryDelayMs: 0 }).maxRetries, 0);
});

const signed = (body, type) => {
  const key = Buffer.from('test-secret-key-0123456789abcdef');
  const id = 'msg_3';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
  const headers = { 'webhook-id': id, 'webhook-timestamp': timestamp, 'webhook-signature': `v1,${signature}`, 'webhook-event-type': type };
  return () => sdk.constructWebhookEvent(body, headers, `whsec_${key.toString('base64')}`);
};

test('constructWebhookEvent: an empty, null, non-JSON or mismatched signed body is a WebhookPayloadError', () => {
  const transaction = JSON.stringify({
    _links: { self: { href: '/transactions/t1' }, subaccount: { href: '/subaccounts/s1' }, card: { href: '/cards/c1' }, messages: [] },
    acceptor: { city: 'AUSTIN', country: 'USA', mcc: '5814' },
    cardId: 'c1', cardholderBillingCurrency: 'USD', cardholderBillingHoldAmount: 45, cardholderBillingSettledAmount: 0,
    descriptor: 'Corner Coffee', id: 't1', network: 'VISA', subaccountId: 's1', status: 'PENDING',
    transactionCurrency: 'USD', transactionHoldAmount: 45, transactionOccurrenceDate: null, transactionSettledAmount: 0,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  });
  const cases = [['{}', 'transaction.created'], ['null', 'transaction.created'], ['[]', 'transaction.created'],
    ['not json', 'transaction.created'], [transaction, 'transactionmessage.created']];
  for (const [body, type] of cases) {
    assert.throws(signed(body, type), (e) => e instanceof sdk.WebhookPayloadError && e.name === 'WebhookPayloadError', `${type}: ${body.slice(0, 20)}`);
  }
  assert.equal(signed(transaction, 'transaction.created')().data.id, 't1');
  assert.equal(signed('{}', 'something.new')().data.constructor, Object); // unmodelled types stay as they are
});

test('TransactionMessage.dateTime is a TransactionDateTime that keeps the offset, or its absence', () => {
  // No method reads the host time zone, so nothing below depends on it.
  const local = sdk.TransactionMessageFromJSON({ dateTime: '2026-01-01T10:00:00', createdDateTime: '2026-01-01T10:00:00Z' }).dateTime;
  assert.ok(local instanceof sdk.TransactionDateTime);
  assert.deepEqual([local.year, local.month, local.day, local.hour, local.minute, local.second], [2026, 1, 1, 10, 0, 0]);
  assert.equal(local.offsetMinutes, null);
  assert.equal(local.hasOffset, false);
  assert.equal(local.toDate(), null); // Mastercard: no exact moment without the merchant's offset
  assert.equal(local.toDateAtOffset(-300).toISOString(), '2026-01-01T15:00:00.000Z');
  const utc = sdk.TransactionMessageFromJSON({ dateTime: '2026-01-01T10:00:00.250Z', createdDateTime: '2026-01-01T10:00:00Z' }).dateTime;
  assert.equal(utc.offsetMinutes, 0);
  assert.equal(utc.toDate().toISOString(), '2026-01-01T10:00:00.250Z');
  assert.equal(sdk.TransactionDateTime.parse('2026-01-01T10:00:00+05:30').toDate().toISOString(), '2026-01-01T04:30:00.000Z');
  // Serialisation writes back exactly what the API sent.
  for (const raw of ['2026-01-01T10:00:00', '2026-01-01T10:00:00.250Z']) {
    const message = sdk.TransactionMessageFromJSON({ dateTime: raw, createdDateTime: '2026-01-01T10:00:00Z' });
    assert.equal(sdk.TransactionMessageToJSON(message).dateTime, raw);
    assert.equal(JSON.parse(JSON.stringify(message)).dateTime, raw);
  }
  assert.throws(() => sdk.TransactionDateTime.parse('yesterday'), RangeError);
});

test('a dateTime this SDK cannot read keeps the message; impossible values are refused by parse', () => {
  for (const raw of ['2026-01-01 10:00:00', '2026-01-01T10:00:00+05', '2026-02-30T10:00:00Z', '2026-13-45T99:99:99Z', '2026-01-01T10:00:00+19:00']) {
    assert.throws(() => sdk.TransactionDateTime.parse(raw), RangeError, raw);
    const message = sdk.TransactionMessageFromJSON({ dateTime: raw, createdDateTime: '2026-01-01T10:00:00Z' });
    assert.equal(message.dateTime.raw, raw);
    assert.equal(message.dateTime.parsed, false);
    assert.equal(message.dateTime.toDate(), null);
    assert.throws(() => message.dateTime.toDateAtOffset(0), RangeError);
    assert.equal(sdk.TransactionMessageToJSON(message).dateTime, raw);
  }
  assert.equal(sdk.TransactionDateTime.parse('2024-02-29T23:59:59Z').parsed, true);
  assert.equal(sdk.TransactionDateTime.fromJSON(null), null);
  assert.equal(sdk.TransactionDateTime.fromJSON(undefined), undefined);
});

test('a fetchApi that ignores the signal and never answers is still bounded by timeoutMs', async () => {
  const never = () => new Promise(() => {});
  const cfg = new sdk.Configuration({ basePath: 'https://stand-in.invalid', accessToken: 't', fetchApi: never, timeoutMs: 100, maxRetries: 0 });
  const err = await within(new sdk.SubaccountsApi(cfg).getSubaccount({ subaccountId: 's1' }).catch((e) => e), 2000);
  assert.ok(err instanceof sdk.TimeoutError, err && err.name);
});

test('a post middleware that returns an error body it read fails with a clear message', async (t) => {
  const api = await standIn(t, { 'POST /webhooks': () => ({ status: 409, json: { title: 'Conflict', detail: 'exists' } }) });
  const careless = new sdk.WebhooksApi(config(api.basePath)).withPostMiddleware(async ({ response }) => {
    await response.text();
    return response;
  });
  const err = await within(careless.createWebhook({ webhookCreateParams: { url: 'https://example.com/hook', events: ['transaction.created'] } }).catch((e) => e));
  assert.match(err.message, /return response\.clone\(\) instead/);
});

test('a throttled, timed-out or failing login (429, 408, 5xx) is not reported as bad credentials', async (t) => {
  for (const status of [429, 408, 503]) {
    const api = await standIn(t, { [`POST ${TOKEN_PATH}`]: () => ({ status, json: { error: 'busy' } }) });
    const err = await within(new sdk.SubaccountsApi(config(api.basePath, { maxRetries: 0 })).getSubaccount({ subaccountId: 's1' }).catch((e) => e));
    assert.ok(err instanceof sdk.ResponseError, err && err.name);
    assert.ok(!(err instanceof sdk.AuthenticationError), `${status}: ${err.name}`);
    assert.equal(err.status, status);
    assert.match(err.message, /login service could not log in now/);
    assert.doesNotMatch(err.message, /client credentials/);
  }
});

test('a login redirect to a non-HTTP URL does not read "redirect to null"', async (t) => {
  const api = await standIn(t, { [`POST ${TOKEN_PATH}`]: () => ({ status: 302, headers: { Location: 'myapp://callback?code=secret' } }) });
  const err = await within(new sdk.SubaccountsApi(config(api.basePath)).getSubaccount({ subaccountId: 's1' }).catch((e) => e));
  assert.match(err.message, /redirect to another address/);
  assert.doesNotMatch(err.message, /null/);
});

test('createMockFetch honours an aborted signal', async () => {
  const { createMockFetch } = require('../dist/testing/index.js');
  const fetchApi = createMockFetch();
  const controller = new AbortController();
  controller.abort(new Error('gave up'));
  await assert.rejects(fetchApi('https://api.sandbox.astrada.co/subaccounts', { signal: controller.signal }), /gave up/);
});

test('a transaction webhook keeps _embedded.messages, with their dateTime typed', () => {
  // The shape of the docs' "Transaction with Projected TransactionMessage Data" sample, on a full transaction.
  const transaction = {
    _links: { self: { href: '/transactions/t1' }, subaccount: { href: '/subaccounts/s1' }, card: { href: '/cards/c1' }, messages: [{ href: '/transaction-messages/m1' }] },
    acceptor: { city: 'LONDON', country: 'GBR', mcc: '5734', state: 'LND' },
    cardId: 'c1', cardholderBillingCurrency: 'GBP', cardholderBillingHoldAmount: 0, cardholderBillingSettledAmount: 0.81,
    createdAt: '2024-05-01T06:41:43.810Z', descriptor: 'Uber', id: 't1', network: 'MASTERCARD', status: 'SETTLED',
    subaccountId: 's1', transactionCurrency: 'USD', transactionHoldAmount: 0, transactionOccurrenceDate: '2024-05-01',
    transactionSettledAmount: 1, updatedAt: '2024-05-02T08:41:43.810Z',
    _embedded: { messages: [
      { _links: { self: { href: '/transaction-messages/m1' } }, approvalCode: '537254', transactionReference: 'IWVQ22_2024-04-24',
        dateTime: '2024-04-24T13:39:45', id: 'm1', messageType: 'FINL_ADVC', network: 'MASTERCARD', result: 'APPROVED' },
      { id: 'm2', messageType: 'AUTH_REQU', network: 'VISA', dateTime: '2024-04-24T13:39:45Z' },
    ] },
  };
  for (const type of ['transaction.created', 'transaction.updated']) {
    const event = signed(JSON.stringify(transaction), type)();
    const messages = event.data._embedded.messages;
    assert.equal(messages.length, 2);
    assert.equal(messages[0].approvalCode, '537254');
    assert.ok(messages[0].dateTime instanceof sdk.TransactionDateTime);
    assert.equal(messages[0].dateTime.offsetMinutes, null); // Mastercard local time
    assert.equal(messages[1].dateTime.toDate().toISOString(), '2024-04-24T13:39:45.000Z');
    assert.equal(event.data.id, 't1');
  }
});

test('RequestApi.send calls an unwrapped endpoint with the login, typed errors and the retry rules', async (t) => {
  const api = await standIn(t, {
    'GET /widgets': (req, _body, count) => (count === 1 ? { status: 503, json: { title: 'Unavailable' } } : { json: { items: [1], auth: req.headers.authorization } }),
    'POST /widgets': () => ({ status: 503, json: { title: 'Unavailable' } }),
    'GET /widgets/missing': () => ({ status: 404, json: { title: 'Not Found', detail: 'no such widget' } }),
    'PUT /widgets/w1': (_req, body) => ({ json: JSON.parse(body) }),
  });
  const raw = new sdk.RequestApi(config(api.basePath));
  const page = await within(raw.send('GET', '/widgets', { query: { limit: 1 } }));
  assert.equal(page.auth, 'Bearer token-1'); // the SDK's own login
  assert.equal(api.count('GET /widgets'), 2); // GET is retried after a 503
  const post = await within(raw.send('POST', '/widgets', { body: { name: 'x' } }).catch((e) => e));
  assert.ok(post instanceof sdk.InternalServerError, post && post.name);
  assert.equal(api.count('POST /widgets'), 1); // never sent twice
  const missing = await within(raw.send('GET', '/widgets/missing').catch((e) => e));
  assert.ok(missing instanceof sdk.NotFoundError);
  assert.equal(missing.detail, 'no such widget');
  assert.deepEqual(await within(raw.send('PUT', '/widgets/w1', { body: { name: 'y' } })), { name: 'y' });
  await assert.rejects(raw.send('GET', 'widgets'), RangeError);
});

test('a timeout or retry delay above the longest timer is refused; a plain Response from fetchApi works', async () => {
  for (const key of ['timeoutMs', 'retryDelayMs']) {
    assert.throws(() => new sdk.Configuration({ basePath: 'https://stand-in.invalid', accessToken: 't', [key]: 2 ** 31 }), RangeError);
  }
  assert.ok(new sdk.Configuration({ basePath: 'https://stand-in.invalid', accessToken: 't', timeoutMs: 2 ** 31 - 1 }));
  const plain = () => new Response(JSON.stringify({ id: 's1' }), { headers: { 'Content-Type': 'application/json' } });
  const cfg = new sdk.Configuration({ basePath: 'https://stand-in.invalid', accessToken: 't', fetchApi: plain, maxRetries: 0 });
  const raw = await within(new sdk.RequestApi(cfg).send('GET', '/subaccounts/s1'));
  assert.equal(raw.id, 's1');
});

test('RequestApi.send keeps the sandbox rules on the path actually sent, and reads JSON only', async (t) => {
  const production = new sdk.RequestApi(new sdk.Configuration({ environment: 'production', accessToken: 't', fetchApi: () => { throw new Error('sent'); } }));
  for (const [method, path] of [['DELETE', '/subaccounts/s1'], ['DELETE', '/card-subscriptions/c1'], ['DELETE', '/network-bulk-feeds/f1'],
    ['DELETE', '/x/../subaccounts/s1'], ['POST', '/./simulate/transactions'], ['POST', '/x/../simulate/transactions'], ['POST', '/%73imulate/transactions']]) {
    await assert.rejects(production.send(method, path), sdk.SandboxOnlyError, `${method} ${path}`);
  }
  await assert.rejects(production.send('GET', '/x%'), RangeError);
  await assert.rejects(production.send('GET', '/simulate?x=1'), RangeError);
  const api = await standIn(t, {
    'DELETE /subaccounts/s1': () => ({ status: 503, headers: { 'Retry-After': '0' }, json: { title: 'Unavailable' } }),
    'GET /widgets': (req, _body, _count, url) => ({ json: { auth: req.headers.authorization, accept: req.headers.accept, query: url.search } }),
    'GET /report': () => ({ text: 'a,b\n1,2', headers: { 'Content-Type': 'text/csv' } }),
  });
  const sandbox = new sdk.RequestApi(config(api.basePath, { environment: 'sandbox', basePathIsSandbox: true }));
  const err = await within(sandbox.send('DELETE', '/subaccounts/s1').catch((e) => e));
  assert.equal(err.status, 503);
  assert.equal(api.count('DELETE /subaccounts/s1'), 1); // never retried
  const widgets = await within(sandbox.send('GET', '/widgets', { query: { limit: 1, cursor: undefined }, headers: { authorization: 'mine', 'X-Extra': '1' } }));
  assert.equal(widgets.auth, 'Bearer token-1'); // the caller's lower-case authorization was dropped
  assert.equal(widgets.query, '?limit=1'); // an undefined value is left out
  const csv = await within(sandbox.send('GET', '/report').catch((e) => e));
  assert.ok(csv instanceof sdk.ResponseError, csv && csv.name);
  assert.equal(csv.status, 200);
  assert.match(csv.message, /not JSON/);
});


test('the request path rule: one normalised path is checked and sent', async (t) => {
  const n = (p) => sdk.normaliseRequestPath(p).sent;
  assert.equal(n('/x/..//subaccounts/s1'), '/subaccounts/s1');
  assert.equal(n('/subaccounts//s1/'), '/subaccounts/s1');
  assert.equal(n('/./simulate/./transactions'), '/simulate/transactions');
  for (const bad of ['/subaccounts/s1#/x', '/subaccounts/s1?x=1', '/subaccounts%2Fs1', '/a%2e%2e/b', '/x\\y', '/x%zz', 'subaccounts']) {
    assert.throws(() => sdk.normaliseRequestPath(bad), RangeError, bad);
  }
  const production = new sdk.RequestApi(new sdk.Configuration({ environment: 'production', accessToken: 't', fetchApi: () => { throw new Error('sent'); } }));
  for (const [method, path] of [['DELETE', '/x/..//subaccounts/s1'], ['DELETE', '/subaccounts//s1'], ['delete', '/Card-Subscriptions/c1/'],
    ['POST', '//simulate/transactions'], ['POST', '/simulate/transactions/t1']]) {
    await assert.rejects(production.send(method, path), sdk.SandboxOnlyError, `${method} ${path}`);
  }
  // The method cannot change after the checks.
  await assert.rejects(production.send('POST', '/subaccounts/s1', {}, { method: 'DELETE' }), RangeError);
  const api = await standIn(t, {
    'GET /report': () => ({ text: 'a,b', headers: { 'Content-Type': 'text/csv' } }),
    'GET /echo': (req) => ({ json: { accept: req.headers.accept } }),
  });
  const raw = new sdk.RequestApi(config(api.basePath));
  const err = await within(raw.send('GET', '/report').catch((e) => e));
  assert.equal(await err.response.text(), 'a,b'); // the response stays readable
  assert.equal((await within(raw.send('GET', '/echo', { headers: { accept: 'application/hal+json' } }))).accept, 'application/hal+json');
});

test('control characters in the path are refused; method overrides are taken out; a stored delivery replays', async (t) => {
  for (const bad of ['/simu\tlate/transactions', '/x/.\t./subaccounts/s1', '/x\r\ny', '/x%0Ay', '/x%5Cy', '/x%3Fy', '/x%23y']) {
    assert.throws(() => sdk.normaliseRequestPath(bad), RangeError, JSON.stringify(bad));
  }
  const api = await standIn(t, { 'PATCH /things/t1': () => ({ json: { ok: 1 } }) });
  const raw = new sdk.RequestApi(config(api.basePath));
  assert.deepEqual(await within(raw.send('PATCH', '/things/t1', {}, { method: undefined })), { ok: 1 });
  assert.deepEqual(await within(raw.send('PATCH', '/things/t1', {}, async () => undefined)), { ok: 1 });
  assert.equal(api.count('PATCH /things/t1'), 2);
  // Replay: a stored body is read again without a signature.
  const event = sdk.parseStoredWebhookEvent({ body: JSON.stringify({ id: 'x' }), type: 'something.new', id: 'msg_1', timestamp: 1764000000 });
  assert.equal(event.id, 'msg_1');
  assert.equal(event.timestamp.toISOString(), '2025-11-24T16:00:00.000Z');
  assert.throws(() => sdk.parseStoredWebhookEvent({ body: '[1]', type: 'transaction.created', id: 'm', timestamp: 1 }), sdk.WebhookPayloadError);
  assert.throws(() => sdk.parseStoredWebhookEvent({ body: 'nope', type: 'transaction.created', id: 'm', timestamp: 1 }), sdk.WebhookPayloadError);
});

test('parseStoredWebhookEvent replays a modelled event and refuses invalid stored fields', () => {
  const transaction = {
    _links: { self: { href: '/transactions/t1' }, subaccount: { href: '/subaccounts/s1' }, card: { href: '/cards/c1' }, messages: [{ href: '/transaction-messages/m1' }] },
    acceptor: { city: 'LONDON', country: 'GBR', mcc: '5734', state: 'LND' },
    cardId: 'c1', cardholderBillingCurrency: 'GBP', cardholderBillingHoldAmount: 0, cardholderBillingSettledAmount: 0.81,
    createdAt: '2024-05-01T06:41:43.810Z', descriptor: 'Uber', id: 't1', network: 'MASTERCARD', status: 'SETTLED',
    subaccountId: 's1', transactionCurrency: 'USD', transactionHoldAmount: 0, transactionOccurrenceDate: '2024-05-01',
    transactionSettledAmount: 1, updatedAt: '2024-05-02T08:41:43.810Z',
    _embedded: { messages: [{ id: 'm1', messageType: 'FINL_ADVC', network: 'MASTERCARD', dateTime: '2024-04-24T13:39:45' }] },
  };
  const body = Buffer.from(JSON.stringify(transaction));
  for (const timestamp of [1764000000, '1764000000', new Date(1764000000000), '2025-11-24T16:00:00Z', '2025-11-24T17:00:00+01:00', '2025-11-24T16:00:00.0Z']) {
    const event = sdk.parseStoredWebhookEvent({ body, type: 'transaction.updated', id: 'msg_1', timestamp });
    assert.equal(event.type, 'transaction.updated');
    assert.equal(event.data.id, 't1');
    assert.ok(event.data.updatedAt instanceof Date);
    assert.ok(event.data._embedded.messages[0].dateTime instanceof sdk.TransactionDateTime);
    assert.equal(event.timestamp.toISOString(), '2025-11-24T16:00:00.000Z');
  }
  const good = { body, type: 'transaction.updated', id: 'msg_1', timestamp: 1764000000 };
  for (const bad of [{ type: '' }, { type: undefined }, { type: null }, { id: '' }, { id: undefined }, { timestamp: 'yesterday' }, { timestamp: NaN }, { timestamp: undefined },
    { timestamp: Infinity }, { timestamp: -1 }, { timestamp: 1764000000000 }, { timestamp: '1764000000000' }, { timestamp: '2025-11-24T16:00:00' }, { timestamp: '2025-11-24 16:00:00' }, { body: 42 }]) {
    assert.throws(() => sdk.parseStoredWebhookEvent({ ...good, ...bad }), RangeError, JSON.stringify(bad));
  }
  const err = (() => { try { sdk.parseStoredWebhookEvent({ ...good, body: '{"id":"x"}' }); } catch (e) { return e; } })();
  assert.ok(err instanceof sdk.WebhookPayloadError);
  assert.match(err.message, /^The stored transaction.updated delivery msg_1 is not/);
  assert.doesNotMatch(err.message, /signed/);
});

test('a raw space in the path is refused, so the checked path is the path sent', () => {
  for (const bad of ['/simulate ', '/subaccounts/s1/. ', '/x y', '/x%00', '/x%1f', '/x%7F']) {
    assert.throws(() => sdk.normaliseRequestPath(bad), RangeError, JSON.stringify(bad));
  }
  assert.equal(sdk.normaliseRequestPath('/x%20y').sent, '/x%20y');
});

test('an accepted path reaches fetch exactly as checked', async () => {
  const urls = [];
  const fetchApi = async (url) => {
    urls.push(String(url));
    return new Response('{}', { headers: { 'Content-Type': 'application/json' } });
  };
  const raw = new sdk.RequestApi(new sdk.Configuration({ basePath: 'https://stand-in.invalid', accessToken: 't', fetchApi, maxRetries: 0 }));
  for (const [path, sent] of [['/x%20y', '/x%20y'], ['/x/..//things/t1/', '/things/t1']]) {
    await raw.send('GET', path);
    assert.equal(new URL(urls.at(-1)).pathname, sent);
    assert.equal(sdk.normaliseRequestPath(path).sent, sent);
  }
});

test('query lists are sent as repeated pairs; null values and items are left out', async () => {
  const urls = [];
  const fetchApi = async (url) => {
    urls.push(String(url));
    return new Response('{}', { headers: { 'Content-Type': 'application/json' } });
  };
  const raw = new sdk.RequestApi(new sdk.Configuration({ basePath: 'https://stand-in.invalid', accessToken: 't', fetchApi, maxRetries: 0 }));
  await raw.send('GET', '/cards', { query: { status: ['a', null, 'b'], network: new Set(['VISA']), empty: [], gone: null, limit: 5 } });
  assert.equal(new URL(urls[0]).search, '?status=a&status=b&network=VISA&limit=5');
});

test('a stored ISO time without seconds is read', () => {
  const event = sdk.parseStoredWebhookEvent({ body: '{"id":"x"}', type: 'something.new', id: 'm', timestamp: '2025-11-24T16:00Z' });
  assert.equal(event.timestamp.toISOString(), '2025-11-24T16:00:00.000Z');
});

