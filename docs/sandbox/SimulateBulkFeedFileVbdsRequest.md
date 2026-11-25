
# SimulateBulkFeedFileVbdsRequest

## Properties

### `networkReference`

`string`, required

The Visa RPIC identifier for the bulk feed, made of the Visa region,
processor, issuer and company segments joined by '_'
('{region}_{processor}_{issuer}_{company}'), such as
'1_12345_67890_54321'. Must match the feed created via
`POST /network-bulk-feeds`.


### `cardCount`

`number`, optional

Number of cards from the head of the sandbox card pool to
include. These are the same cards every call; once enrolled
in the subaccount they deduplicate. `cardCount + newCardCount`
must be at least 1.


### `newCardCount`

`number`, optional

Number of not-yet-enrolled cards to draw from the sandbox
pool for this feed's subaccount. Each call enrolls this many
new cards (with `cardsubscription.created` webhooks). Requires
an active feed for the `networkReference`; returns `400` when
none exists or when the subaccount has exhausted the pool.


### `transactionsPerCard`

`number`, optional

Number of settlements generated for every included card, with
fresh transaction ids and recent dates on each call. Use `0`
for a cards-only delivery.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "networkReference": "1_12345_67890_54321",
  "cardCount": 5
}
```

[Back to top](#) · [Back to README](../../README.md)


