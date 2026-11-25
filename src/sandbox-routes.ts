/* Written by scripts/sandbox-routes.mjs from the sandbox-only API definition; do not edit. */

/** The sandbox-only operations: method and a pattern for the decoded, lower-case path. */
export const SANDBOX_ROUTES: ReadonlyArray<{ method: string; pattern: RegExp }> = [
    { method: 'DELETE', pattern: /^\/card-subscriptions\/[^\/]+$/ }, // /card-subscriptions/{subscriptionId}
    { method: 'DELETE', pattern: /^\/network-bulk-feeds\/[^\/]+$/ }, // /network-bulk-feeds/{networkBulkFeedId}
    { method: 'POST', pattern: /^\/simulate\/ingestion\/amex-gl$/ }, // /simulate/ingestion/amex-gl
    { method: 'POST', pattern: /^\/simulate\/ingestion\/smartdata$/ }, // /simulate/ingestion/smartdata
    { method: 'POST', pattern: /^\/simulate\/ingestion\/vbds$/ }, // /simulate/ingestion/vbds
    { method: 'POST', pattern: /^\/simulate\/ingestion\/vcf$/ }, // /simulate/ingestion/vcf
    { method: 'POST', pattern: /^\/simulate\/transaction\/scenario$/ }, // /simulate/transaction/scenario
    { method: 'POST', pattern: /^\/simulate\/transactions\/[^\/]+$/ }, // /simulate/transactions/{transactionId}
    { method: 'POST', pattern: /^\/simulate\/transactions$/ }, // /simulate/transactions
    { method: 'DELETE', pattern: /^\/subaccounts\/[^\/]+$/ }, // /subaccounts/{subaccountId}
];
