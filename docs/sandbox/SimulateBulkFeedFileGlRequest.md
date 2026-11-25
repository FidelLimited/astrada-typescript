
# SimulateBulkFeedFileGlRequest

## Properties

### `networkReference`

`string`, required

The Amex Recipient ID for the bulk feed, in the format
'R{RecipientId}', such as 'R12345', or the 6-digit Company ID the
feed was created with. Must match the feed created via
`POST /network-bulk-feeds`.


### `cardCount`

`number`, optional

Number of cards to include. For an `encrypted` feed these are
drawn from the head of the sandbox account pool: the same
accounts every call; once enrolled in the subaccount they
deduplicate. For a `tokenized` feed they are drawn from the
enrollable 374290-BIN Amex token pool (two tokens). Requesting more than the
tokenized pool holds does not error: the call still returns
`202` and under-delivers (only the enrollable tokens are
written), so do not build a retry on an expected `400`. When
omitted, defaults to 3 for encrypted feeds and to the whole
enrollable token pool for tokenized feeds. When `cardCount` is
sent, `cardCount + newCardCount` must be at least 1.


### `newCardCount`

`number`, optional

Number of not-yet-enrolled accounts to draw from the sandbox
pool for this feed's subaccount. Each call enrolls this many
new cards (with `cardsubscription.created` webhooks). Requires
an active feed for the `networkReference`; returns `400` when
none exists or when the subaccount has exhausted the pool. Not
supported on `tokenized` feeds: a value greater than 0 on a
tokenized feed returns `400` (there is no tokenized new-card
pool).


### `transactionsPerCard`

`number`, optional

Number of settlements generated for every included card
(written as a companion settlement file), with fresh
transaction ids and recent dates on each call. Use `0` for a
cards-only file.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "networkReference": "R12345",
  "cardCount": 5
}
```

[Back to top](#) · [Back to README](../../README.md)


