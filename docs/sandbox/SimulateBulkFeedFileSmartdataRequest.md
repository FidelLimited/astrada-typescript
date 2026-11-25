
# SimulateBulkFeedFileSmartdataRequest

## Properties

### `networkReference`

`string`, required

The Mastercard Delivery ID for the bulk feed, such as 'G1234567'.
Must match the feed created via `POST /network-bulk-feeds`.


### `cardCount`

`number`, optional

Number of cards from the head of the sandbox test-card pool to
include. These are the same cards every call; once enrolled in
the subaccount they deduplicate. `cardCount + newCardCount`
must be at least 1.


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
  "networkReference": "G1234567",
  "cardCount": 5
}
```

[Back to top](#) · [Back to README](../../README.md)


