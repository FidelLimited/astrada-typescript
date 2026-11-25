
# BankAccountUpdateResultBackfill

The result of the backfill, when the request asked for one and added at least one card. If fetching history from the bank data provider fails, matching still runs on the bank transactions already stored, and this object is returned with counts for those. It is left out when a later step fails (reading the stored or card transactions, or matching); the update itself still stands. The fields mean the same as on `POST /bank-accounts/{bankAccountId}/backfill`, except that matching here only looks for the cards this request added.


## Properties

### `transactionsProcessed`

`number`, optional

Unmatched bank transactions in the window that matching looked at, whether imported by this call or already stored.

### `matchesFound`

`number`, optional

Matches found against the cards this request added.

[Back to top](#) · [Back to README](../../README.md)


