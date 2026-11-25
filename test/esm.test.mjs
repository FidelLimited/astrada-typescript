// Checks that Node loads the package both ways through its `exports` map: `import` gets the ES
// module build in dist/esm, `require` gets the CommonJS build in dist. Uses the package's own
// name (Node resolves a package's name from inside the package), so it reads package.json the
// way an installed copy would.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('import loads the ES module build', async () => {
  const esm = await import('@astrada.co/ts-astrada-sdk');
  assert.match(import.meta.resolve('@astrada.co/ts-astrada-sdk'), /\/dist\/esm\/index\.js$/);
  assert.equal(esm.BASE_PATH, 'https://api.astrada.co');
  assert.equal(typeof esm.SubaccountsApi, 'function');
  assert.equal(typeof esm.verifyWebhook, 'function');
  assert.equal(typeof esm.banking.BankLinksApi, 'function');
});

test('require loads the CommonJS build', () => {
  assert.match(require.resolve('@astrada.co/ts-astrada-sdk'), /\/dist\/index\.js$/);
  const cjs = require('@astrada.co/ts-astrada-sdk');
  assert.equal(typeof cjs.SubaccountsApi, 'function');
  assert.equal(typeof cjs.banking.BankLinksApi, 'function');
});

test('the ES module build makes an authenticated call', async () => {
  const { Configuration, SubaccountsApi } = await import('@astrada.co/ts-astrada-sdk');
  const urls = [];
  const fetchApi = async (url) => {
    urls.push(String(url));
    const body = String(url).includes('/openid-connect/token')
      ? { access_token: 't', token_type: 'Bearer', expires_in: 300 }
      : { id: 'sub-1' };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const config = new Configuration({ accountId: 'a', clientId: 'c', clientSecret: 's', environment: 'sandbox', fetchApi });
  const result = await new SubaccountsApi(config).getSubaccount({ subaccountId: 'sub-1' });
  assert.equal(result.id, 'sub-1');
  assert.equal(urls.length, 2);
});
