// Checks the hand-written parts of the SDK (the runtime template): the
// client-credentials token request, token reuse, the Authorization header and the base URL.
// Runs against the built package in dist/ with a fake fetch, so it needs no network or account.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sdk = require('../dist/index.js');

const SANDBOX = 'https://api.sandbox.astrada.co';

function fakeFetch({ tokenStatus = 200, expiresIn = 300 } = {}) {
  const calls = [];
  const fetchApi = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('/protocol/openid-connect/token')) {
      const body = tokenStatus === 200
        ? { access_token: `token-${calls.length}`, token_type: 'Bearer', expires_in: expiresIn }
        : { error: 'unauthorized_client', error_description: 'Invalid client credentials' };
      return new Response(JSON.stringify(body), {
        status: tokenStatus,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ id: 'sub-1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  return { calls, fetchApi };
}

function config(fetchApi, extra = {}) {
  return new sdk.Configuration({
    accountId: 'acct-1',
    clientId: 'client-1',
    clientSecret: 'secret-1',
    environment: 'production',
    fetchApi,
    ...extra,
  });
}

test('the environment sets the base URL', () => {
  assert.equal(sdk.BASE_PATH, 'https://api.astrada.co');
  assert.equal(config(fakeFetch().fetchApi).basePath, 'https://api.astrada.co');
  assert.equal(config(fakeFetch().fetchApi, { environment: 'sandbox' }).basePath, SANDBOX);
});

test('requests a client-credentials token from the account realm', async () => {
  const { calls, fetchApi } = fakeFetch();
  await new sdk.SubaccountsApi(config(fetchApi, { basePath: SANDBOX })).getSubaccount({ subaccountId: 'sub-1' });

  const token = calls[0];
  assert.equal(token.url, `${SANDBOX}/auth/realms/acct-1/protocol/openid-connect/token`);
  assert.equal(token.init.method, 'POST');
  assert.equal(token.init.headers['Content-Type'], 'application/x-www-form-urlencoded');
  const form = new URLSearchParams(token.init.body);
  assert.equal(form.get('grant_type'), 'client_credentials');
  assert.equal(form.get('client_id'), 'client-1');
  assert.equal(form.get('client_secret'), 'secret-1');
});

test('sends the token as a Bearer header to the configured base URL', async () => {
  const { calls, fetchApi } = fakeFetch();
  const result = await new sdk.SubaccountsApi(config(fetchApi, { basePath: SANDBOX })).getSubaccount({ subaccountId: 'sub-1' });

  assert.equal(result.id, 'sub-1');
  const call = calls[1];
  assert.equal(call.url, `${SANDBOX}/subaccounts/sub-1`);
  assert.equal(call.init.headers.Authorization, 'Bearer token-1');
});

test('reuses a token until it expires', async () => {
  const { calls, fetchApi } = fakeFetch();
  const api = new sdk.SubaccountsApi(config(fetchApi));
  await api.getSubaccount({ subaccountId: 'sub-1' });
  await api.getSubaccount({ subaccountId: 'sub-1' });

  const tokenCalls = calls.filter((c) => c.url.includes('/openid-connect/token'));
  assert.equal(tokenCalls.length, 1);
  assert.equal(calls.length, 3);
});

test('requests a new token once the cached one is within 30 seconds of expiry', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1_700_000_000_000 });
  const { calls, fetchApi } = fakeFetch({ expiresIn: 60 });
  const api = new sdk.SubaccountsApi(config(fetchApi));
  const tokenCalls = () => calls.filter((c) => c.url.includes('/openid-connect/token'));

  await api.getSubaccount({ subaccountId: 'sub-1' });
  t.mock.timers.tick(29_000); // 31s left: still reused
  await api.getSubaccount({ subaccountId: 'sub-1' });
  assert.equal(tokenCalls().length, 1);

  t.mock.timers.tick(1_000); // 30s left: refreshed
  await api.getSubaccount({ subaccountId: 'sub-1' });
  assert.equal(tokenCalls().length, 2);
  assert.equal(calls.at(-1).init.headers.Authorization, `Bearer token-${calls.length - 1}`);
});

test('a refused token request raises AuthenticationError with the reason', async () => {
  const { fetchApi } = fakeFetch({ tokenStatus: 401 });
  const api = new sdk.SubaccountsApi(config(fetchApi));
  await assert.rejects(api.getSubaccount({ subaccountId: 'sub-1' }), (err) => {
    assert.ok(err instanceof sdk.AuthenticationError);
    assert.ok(err instanceof sdk.ResponseError);
    assert.equal(err.response.status, 401);
    assert.equal(err.status, 401);
    assert.equal(err.code, 'unauthorized_client');
    assert.equal(err.detail, 'Invalid client credentials');
    assert.match(err.message, /Invalid client credentials/);
    return true;
  });
});

test('mintSdkAccessToken mints with the SDK client and never returns the backend token', async () => {
  const forms = [];
  let n = 0;
  const fetchApi = async (url, init) => {
    const form = Object.fromEntries(new URLSearchParams(String(init.body)));
    forms.push(form);
    const scope = form.client_id === 'sdk-client' ? 'subaccounts:read card-subscriptions:write' : 'subaccounts:read banking:admin';
    return new Response(JSON.stringify({ access_token: `tok-${++n}`, token_type: 'Bearer', expires_in: 300, scope }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const config = new sdk.Configuration({ environment: 'production', accountId: 'acct-1', clientId: 'backend', clientSecret: 's', fetchApi });
  const backend = (await config.accessToken()).replace('Bearer ', '');
  const allowed = ['subaccounts:read', 'card-subscriptions:write'];
  const token = await config.mintSdkAccessToken({ clientId: 'sdk-client', clientSecret: 'sdk-secret', allowedScopes: allowed });
  assert.notEqual(token, backend);
  assert.ok(!token.startsWith('Bearer '));
  assert.deepEqual([forms[1].client_id, forms[1].client_secret, forms[1].scope], ['sdk-client', 'sdk-secret', undefined]);
  assert.notEqual(await config.mintSdkAccessToken({ clientId: 'sdk-client', clientSecret: 'sdk-secret' }), token);
  // A token with a scope outside allowedScopes is not returned.
  await assert.rejects(config.mintSdkAccessToken({ clientId: 'other', clientSecret: 'x', allowedScopes: allowed }), (e) => {
    assert.ok(e instanceof sdk.UnexpectedScopesError, e.name);
    assert.deepEqual(e.extraScopes, ['banking:admin']);
    return true;
  });
  await assert.rejects(config.mintSdkAccessToken({ clientId: 'sdk-client', clientSecret: 'x', allowedScopes: 'subaccounts:read' }), RangeError);
  const sent = forms.length;
  await assert.rejects(config.mintSdkAccessToken({ clientId: 'backend', clientSecret: 's' }), RangeError);
  for (const bad of [{ clientId: undefined, clientSecret: 's' }, { clientId: 'sdk', clientSecret: '' }]) {
    await assert.rejects(config.mintSdkAccessToken(bad), /missing or empty/);
  }
  // The label says sandbox, the host is production: the backend client is refused too.
  const mislabelled = new sdk.Configuration({ environment: 'sandbox', basePath: 'https://api.astrada.co', accountId: 'acct-1', clientId: 'backend', clientSecret: 's', fetchApi });
  await assert.rejects(mislabelled.mintSdkAccessToken({ clientId: 'backend', clientSecret: 's' }), RangeError);
  assert.equal(forms.length, sent, 'the refused calls sent nothing');
  // The sandbox's one self sign-up client may mint for the browser too.
  const sandbox = new sdk.Configuration({ environment: 'sandbox', accountId: 'acct-1', clientId: 'one', clientSecret: 's', fetchApi });
  assert.match(await sandbox.mintSdkAccessToken({ clientId: 'one', clientSecret: 's' }), /^tok-/);
});

test('the README allowedScopes list takes the sandbox SDK client and refuses a backend scope', async () => {
  // Read from the README itself, so an edit there is tested.
  const { readFileSync } = await import('node:fs');
  const readmeText = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  const block = /allowedScopes: \[([^\]]+)\]/.exec(readmeText)[1];
  const readme = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.equal(readme.length, 8);
  // The scopes the sandbox SDK client's token carried on 2026-11-25.
  const sandboxSdk = 'enrollment-methods:write card-verifications:read card-verifications:write banking:read banking:write subaccounts:read card-subscriptions:read card-subscriptions:write';
  for (const [scope, extra] of [[sandboxSdk, []], [`${sandboxSdk} banking:admin`, ['banking:admin']], [`${sandboxSdk} webhooks:write`, ['webhooks:write']], ['', []], ['  ', []]]) {
    const fetchApi = async () => new Response(JSON.stringify({ access_token: 'tok', token_type: 'Bearer', expires_in: 300, scope }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    const config = new sdk.Configuration({ environment: 'production', accountId: 'acct-1', clientId: 'backend', clientSecret: 's', fetchApi });
    const minted = config.mintSdkAccessToken({ clientId: 'sdk', clientSecret: 's', allowedScopes: readme });
    if (scope === sandboxSdk) assert.equal(await minted, 'tok');
    else await assert.rejects(minted, (e) => e instanceof sdk.UnexpectedScopesError && JSON.stringify(e.extraScopes) === JSON.stringify(extra));
  }
  // A wrong allowedScopes type is refused before anything is sent.
  let sent = 0;
  const counting = new sdk.Configuration({ environment: 'production', accountId: 'acct-1', clientId: 'backend', clientSecret: 's', fetchApi: async () => { sent += 1; throw new Error('sent'); } });
  await assert.rejects(counting.mintSdkAccessToken({ clientId: 'sdk', clientSecret: 's', allowedScopes: 'subaccounts:read' }), RangeError);
  assert.equal(sent, 0);
});

test('allowedScopes with a login that states no scope throws UnexpectedScopesError, not a caller error', async () => {
  const fetchApi = async () => new Response(JSON.stringify({ access_token: 'tok', token_type: 'Bearer', expires_in: 300 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  const config = new sdk.Configuration({ environment: 'production', accountId: 'acct-1', clientId: 'backend', clientSecret: 's', fetchApi });
  await assert.rejects(config.mintSdkAccessToken({ clientId: 'sdk', clientSecret: 's', allowedScopes: ['subaccounts:read'] }), (e) => {
    assert.ok(e instanceof sdk.UnexpectedScopesError);
    assert.deepEqual(e.extraScopes, []);
    assert.match(e.message, /did not state/);
    return true;
  });
  assert.equal(await config.mintSdkAccessToken({ clientId: 'sdk', clientSecret: 's' }), 'tok');
});

