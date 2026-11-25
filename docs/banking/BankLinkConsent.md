
# BankLinkConsent

The bank-link consent record. The Unified Enrollment SDK sets it on channel `sdk-unified`, naming the Astrada consent text of the bank-connect screen the person saw. Integrators do not send it. Astrada relays it to each card subscription the bank link creates, where it is recorded and never refused. A consent without `textVersionId` is accepted but not kept.


## Properties

### `channel`

`string`, required

Always `sdk-unified`.

One of: `sdk-unified`. A value the SDK does not know yet is passed through as a plain string.

### `textVersionId`

`string`, optional

The id of the bank-connect consent text the SDK showed, such as `sdk-unified:bank-consent.plaid.bank.en@v1`.

### `textHash`

`string`, optional

`sha256:` and the lowercase hex SHA-256 of the text named by `textVersionId`, compared with the registered text when sent.

### `sdkVersion`

`string`, optional

The SDK release that collected the consent.

### `variables`

`{ [key: string]: string; }`, optional

`companyName` and `providerName`, as the screen showed them. For a Plaid link, Astrada adds `plaidLinkSessionId` when it relays the record.


[Back to top](#) · [Back to README](../../README.md)


