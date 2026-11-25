
# SimulateBulkFeedFileVcfRequest

## Properties

### `networkReference`

`string`, required

The Visa reference for the bulk feed. Pass the same value used
to create the feed via `POST /network-bulk-feeds`: the full
RPIC '{region}_{processor}_{issuer}_{company}', such as
'1_123_45_6789'; the region segment is ignored. The 3-segment
PIC form '{processor}_{issuer}_{company}' is also accepted.


### `cardCount`

`number`, optional

Number of cards from the head of the sandbox test-card pool to
include. These are the same cards every call; once enrolled in
the subaccount they deduplicate. `cardCount + newCardCount`
must be at least 1.

While a feed has not completed an ingestion (normally its
first call), a call with `newCardCount` of `0` also adds one
card the feed's subaccount has not seen before, so the feed
can become active.


### `newCardCount`

`number`, optional

Number of not-yet-enrolled cards to draw from the sandbox
new-card pool for this feed's subaccount. Each call enrolls
this many new cards (with `cardsubscription.created`
webhooks). Requires an active feed for the `networkReference`;
returns `400` when none exists or when the subaccount has
exhausted the pool.


### `transactionsPerCard`

`number`, optional

Number of transactions generated for every included card, with
fresh transaction references and recent dates on each call.
Use `0` for a cards-only (starter) file.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "networkReference": "1_123_45_6789",
  "cardCount": 5
}
```

[Back to top](#) · [Back to README](../../README.md)


