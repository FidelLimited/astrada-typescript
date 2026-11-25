
# NetworkBulkFeedCreateVisa

## Properties

### `networkReference`

`string`, required

The identifier associated with the card network's bulk enrollment feed. Its format depends on the network.
For Amex, the Recipient ID in the format 'R{RecipientId}', such as 'R123456', or the 6-digit Amex corporate ID (CID), such as '014640'.
For Mastercard, the Delivery ID, such as 'G1234567'; its format is not checked.
For Visa-VBDS, the RPIC: four numeric parts joined by underscores, 'RegionId_ProcessorId_IssuerId_CompanyId', such as '1_123_45_6789'.
For Visa-VCF, the same RPIC 'RegionId_ProcessorId_IssuerId_CompanyId', such as '1_123_45_6789' (the region segment is ignored), or the 3-segment PIC form 'ProcessorId_IssuerId_CompanyId', such as '123_45_6789'.
For Visa, a part that is not all digits is refused with `400`, naming the part. Spaces around each part and leading zeros are removed before the reference is stored.
For more details on our bulk enrollment process, refer to [this guide](https://docs.astrada.co/docs/network-bulk-enrollment).


### `subaccountId`

`string`, required

The subaccount identifier

### `networkBulkEnrollmentId`

`string`, optional

Optional. The network bulk enrollment (`POST /network-bulk-enrollments`)
this feed fulfils. The enrollment must exist on this account, its
`subaccountId` and `network` must equal the body's, and its `state` must
be `requested` or `feed-created` (re-registering after a failed feed is
allowed). Any mismatch is rejected with a 400 whose `detail` reads
`networkBulkEnrollmentId does not match this subaccount and network`.
When the feed is created, the enrollment's `networkBulkFeedId` is set and
its state moves to `feed-created`; the link lives on the enrollment, so
the feed representation is unchanged. A duplicate feed still answers 409
and leaves the enrollment untouched.


### `expectedCardCount`

`number`, optional

The expected number of cards that will be enrolled under this bulk feed.
Optional. When provided, the value is echoed back on the response and on the
`networkbulkfeed.statechanged` webhook payload.


### `transactionStartDate`

`Date`, optional

Optional. Transactions posted on or after this calendar date (`YYYY-MM-DD`,
a valid date, not in the future) are taken in for this feed's deliveries,
replacing the default window, which keeps only transactions posted on or
after the date 15 days before each file's delivery date (in UTC). On a file
that serves several subaccounts, the earliest window among them applies to
the whole file. Currently supported for `SMARTDATA` feeds only; requests
containing this field for any other feed type are rejected with a 400. When
unset, the 15-day window applies. Also
settable later via `PATCH /network-bulk-feeds/{networkBulkFeedId}`.
The comparison is calendar-day based in UTC: the network's posting date is
a date-only field, so a value of e.g. `2026-06-30` includes every
transaction whose posting date is 2026-06-30 or later, with no
local-timezone adjustment.


### `cardCount`

`number`, optional

Sandbox only. The number of synthetic Visa cards to create when this
bulk feed is created in the sandbox environment. The cards are drawn
from the head of Astrada's published sandbox Visa test-card pool:
the same cards every feed, deduplicated once enrolled (matching the
`cardCount` field on the `SimulateBulkFeedFile*` operations). Only valid
for pulled Visa feeds: `type: VBDS`, or a `VISA` feed sent without
`type`. Requests containing this field outside the sandbox
environment, or for any other feed type, are rejected with a 400.
When omitted on such a feed in sandbox, 5 starter cards are created.


### `newCards`

`number`, optional

Deprecated alias of `cardCount`; use `cardCount` instead. When both
fields are provided, `cardCount` takes precedence. Same constraints
and behavior.


### `panFormat`

`string`, optional

Sandbox only. Selects how card numbers arrive for this feed:
`encrypted` (raw PAN) or `tokenized` (Amex network token /
`tokenizedId`). Only valid for `type: GL` (AMEX) feeds.
Requests containing this field outside the sandbox
environment, or for any non-GL feed type, are rejected with
a 400. When omitted, the feed defaults to `encrypted`.


One of: `encrypted`, `tokenized`. A value the SDK does not know yet is passed through as a plain string.

### `network`

`string`, required

The network that the feed belongs

One of: `VISA`. A value the SDK does not know yet is passed through as a plain string.

### `type`

`string`, optional

Optional. The Visa rail this feed is delivered on. Omit it and
Astrada discovers the rail: the feed is registered on both VBDS
and VCF, `type` is `null` while the feed is `submitted`, and it
becomes `VBDS` or `VCF` when the first delivery (a VBDS
connection or a VCF file) confirms the rail. Pass `VBDS` or `VCF`
to pin the feed to one rail instead. Without a type the
`networkReference` must be the full RPIC
(`RegionId_ProcessorId_IssuerId_CompanyId`).


One of: `VBDS`, `VCF`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


