
# NetworkBulkFeedUpdateParams

## Properties

### `transactionStartDate`

`Date`, optional

Transactions posted on or after this calendar date
(`YYYY-MM-DD`, a valid date, not in the future) are taken in
for this feed's deliveries, replacing the default window, which
keeps only transactions posted on or after the date 15 days
before each file's delivery date (in UTC). On a file that
serves several subaccounts, the earliest window among them
applies to the whole file. Currently supported for `SMARTDATA`
feeds only. The comparison is calendar-day based in UTC: the
network's posting date is a date-only field, so a value of
e.g. `2026-06-30` includes every transaction whose posting
date is 2026-06-30 or later, with no local-timezone
adjustment.


### `expectedCardCount`

`number`, optional

The expected number of cards that will be enrolled under this bulk feed.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "transactionStartDate": "2026-07-01"
}
```

[Back to top](#) · [Back to README](../README.md)


