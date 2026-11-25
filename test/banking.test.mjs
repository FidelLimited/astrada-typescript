// Checks the Banking API module (src/banking, generated from api-spec's `banking` bundle): it is
// exported as `banking`, logs in with client credentials like the main client, and calls the
// banking routes on the configured base URL. Runs with a fake fetch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { banking, Configuration, ResponseError } = require('../dist/index.js');

test('exports the banking APIs', () => {
  for (const name of ['BankLinksApi', 'BankAccountsApi', 'BankSubscriptionsApi', 'BankTransactionsApi', 'TransactionMatchesApi']) {
    assert.equal(typeof banking[name], 'function', name);
  }
});

test('shares the main runtime: one Configuration and one error hierarchy', () => {
  assert.equal(banking.Configuration, Configuration);
  assert.equal(banking.ResponseError, ResponseError);
});

test('logs in and calls a banking route', async () => {
  const calls = [];
  const fetchApi = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const body = String(url).includes('/openid-connect/token')
      ? { access_token: 'token-1', token_type: 'Bearer', expires_in: 300 }
      : { id: 'bl-1' };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const config = new Configuration({
    accountId: 'acct-1',
    clientId: 'client-1',
    clientSecret: 'secret-1',
    environment: 'sandbox',
    fetchApi,
  });
  const response = await new banking.BankLinksApi(config).getBankLinkRaw({ bankLinkId: 'bl-1' });

  assert.equal(response.raw.status, 200);
  assert.equal(calls[0].url, 'https://api.sandbox.astrada.co/auth/realms/acct-1/protocol/openid-connect/token');
  assert.equal(calls[1].url, 'https://api.sandbox.astrada.co/bank-links/bl-1');
  assert.equal(calls[1].init.headers.Authorization, 'Bearer token-1');
});

test('the Banking API defaults to production, like the main API', () => {
  // src/banking/runtime.ts is the main runtime, so the banking bundle's own servers (which can list
  // only the sandbox) never set the host.
  assert.equal(banking.BASE_PATH, 'https://api.astrada.co');
  const cfg = new banking.Configuration({ environment: 'production', accountId: 'a', clientId: 'c', clientSecret: 's' });
  assert.equal(cfg.basePath, 'https://api.astrada.co');
});
