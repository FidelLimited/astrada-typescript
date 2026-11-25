
# NetworkBulkConfirmationSummary

The `200` body of `POST /network-bulk-confirmations` when the request's program already has
an open confirmation request that another request wrote. A program is the calling account,
the `subaccountId`, the `network` and the `bin`. The summary names the open request and
leaves out its contact details: no names, emails, bank contact, `binInfo` or `grade`. It is
plain JSON with no `_links`, as a confirmation has no GET. `alreadyOpen` is always `true`
here, and the full confirmation never carries it, a replay of your own `requestId` included.


## Properties

### `alreadyOpen`

`boolean`, required

Always `true`. Tells this summary apart from the full confirmation.

### `id`

`string`, required

The unique identifier of the open confirmation request.

### `requestId`

`string`, required

The `requestId` this request sent. It is never the `requestId` the open request was stored under.

### `subaccountId`

`string`, required

The subaccount of the open request, the same as the request's.

### `network`

`string`, required

The network of the open request, the same as the request's.

One of: `AMEX`, `MASTERCARD`, `VISA`. A value the SDK does not know yet is passed through as a plain string.

### `state`

`string`, required

The state of the open request. `requested` is the only state for now.

One of: `requested`. A value the SDK does not know yet is passed through as a plain string.

### `createdAt`

`Date`, required

When the open request was created, in UTC, following ISO 8601 format. Its 30-day window counts from this time.

[Back to top](#) · [Back to README](../README.md)


