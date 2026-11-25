
# TransactionMessageBankData

Bank-side provenance, present only on bank-sourced messages (null otherwise). Deliberately slim; the bank's merchant string, dates and amounts map into the canonical fields above; `bankTransactionId` is the stable join key back to the bank feed. It equals `banktransaction.created.id` and `transaction.match.created.matches[].id`, and resolves via `GET /bank-transactions/{id}` for the full bank record.

## Properties

### `provider`

`string`, required

Open banking provider that observed the bank transaction. `mastercard-open-finance` appears once the Mastercard rail is enabled for the subaccount; the payload shape is identical across providers.

One of: `plaid`, `mastercard-open-finance`. A value the SDK does not know yet is passed through as a plain string.

### `bankTransactionId`

`string`, required

The bank transaction entity id; the canonical, lifecycle-stable join key across every bank-data surface.

### `personalFinanceCategory`

[TransactionMessageBankDataPersonalFinanceCategory](TransactionMessageBankDataPersonalFinanceCategory.md), optional, can be `null`

[Back to top](#) · [Back to README](../README.md)


