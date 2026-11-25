
# NetworkBulkEnrollmentSummary

The `200` body of `POST /network-bulk-enrollments` when the request's program already has
an open kickoff that another request wrote. A program is the calling account, the
`subaccountId`, the `network` and the first 8 digits of the `bin`. The summary names the
open kickoff and leaves out its contact details: no names, emails, bank contact, `binInfo`,
consent or outreach. `alreadyOpen` is always `true` here, and the full enrollment never
carries it, a replay of your own `requestId` included.


## Properties

### `_links`

[NetworkBulkEnrollmentSummaryLinks](NetworkBulkEnrollmentSummaryLinks.md), required

### `alreadyOpen`

`boolean`, required

Always `true`. Tells this summary apart from the full enrollment.

### `id`

`string`, required

The unique identifier of the open kickoff.

### `subaccountId`

`string`, required

The subaccount of the open kickoff, the same as the request's.

### `network`

`string`, required

The network of the open kickoff, the same as the request's.

One of: `AMEX`, `MASTERCARD`, `VISA`. A value the SDK does not know yet is passed through as a plain string.

### `state`

`string`, required

The open kickoff's state. `requested`: it was created less than 90 days ago and no
feed has been registered against it yet. `feed-created`: a feed was registered against
it and that feed is live.


One of: `requested`, `feed-created`. A value the SDK does not know yet is passed through as a plain string.

### `networkBulkFeedId`

`string`, required, can be `null`

The live feed registered against the open kickoff. `null` while the kickoff is `requested`.

### `requestId`

`string`, required, can be `null`

The `requestId` this request sent, or `null` when it sent none. It is never the
`requestId` the open kickoff was stored under.


### `createdAt`

`Date`, required

When the open kickoff was created, in UTC, following ISO 8601 format. Its 90-day window counts from this time.

[Back to top](#) · [Back to README](../README.md)


