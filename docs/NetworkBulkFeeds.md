
# NetworkBulkFeeds

## Properties

### `_links`

[SelfLinks](SelfLinks.md), required

### `id`

`string`, required

The unique identifier of this network bulk feed entity.

### `subaccountId`

`string`, required

The unique identifier of the subaccount related to this entity.

### `network`

`string`, required

The network where the feed belongs.

One of: `AMEX`, `MASTERCARD`, `VISA`. A value the SDK does not know yet is passed through as a plain string.

### `networkReference`

`string`, required

The identifier associated with the card network's bulk enrollment feed. Its format depends on the network.
For Amex, the Recipient ID in the format 'R{RecipientId}', such as 'R123456', or the 6-digit Amex corporate ID (CID), such as '014640'.
For Mastercard, the Delivery ID, such as 'G1234567'; its format is not checked.
For Visa-VBDS, the RPIC: four numeric parts joined by underscores, 'RegionId_ProcessorId_IssuerId_CompanyId', such as '1_123_45_6789'.
For Visa-VCF, the same RPIC 'RegionId_ProcessorId_IssuerId_CompanyId', such as '1_123_45_6789' (the region segment is ignored), or the 3-segment PIC form 'ProcessorId_IssuerId_CompanyId', such as '123_45_6789'.
For Visa, a part that is not all digits is refused with `400`, naming the part. Spaces around each part and leading zeros are removed before the reference is stored.
For more details on our bulk enrollment process, refer to [this guide](https://docs.astrada.co/docs/network-bulk-enrollment).


### `state`

`string`, required

The state of the network bulk feed entity.

> **Note**: The `failed` state is currently only applicable to VISA bulk feeds.


One of: `submitted`, `active`, `deactivated`, `failed`. A value the SDK does not know yet is passed through as a plain string.

### `type`

`string`, required, can be `null`

The feed's delivery rail. Always set for `AMEX` (`GL`) and `MASTERCARD`
(`SMARTDATA`), and for a `VISA` feed created with an explicit type.

`null` while a `VISA` feed created without a type is still discovering
its rail: it stays `submitted` and becomes `VBDS` or `VCF` (and
`active`) as soon as a VBDS connection or a VCF file confirms the rail.
The `networkbulkfeed.statechanged` webhook for that transition carries
the resolved value.


One of: `GL`, `SMARTDATA`, `VBDS`, `VCF`. A value the SDK does not know yet is passed through as a plain string.

### `panFormat`

`string`, required

The PAN format of the feed's card data: `encrypted` (raw PAN) or
`tokenized` (Amex network token / `tokenizedId`).

Outside the sandbox environment this is derived internally at feed
creation (determined by Astrada from the network/file signals, never
accepted on the create request) and defaults to `encrypted`. In the
sandbox environment it may be set explicitly on the create request for
`type: GL` (AMEX) feeds only, so the Simulate flow can register a
tokenized feed (see `panFormat` on `POST /network-bulk-feeds`). It is
always returned on the feed representation.


One of: `encrypted`, `tokenized`. A value the SDK does not know yet is passed through as a plain string.

### `errorReason`

`string`, optional, can be `null`

A human-readable reason explaining why the bulk feed failed. Present when `state` is `failed`.
For a `VISA` feed still discovering its rail (`type` is `null`, `state` is `submitted`) it may
also carry the latest error reported by one rail, prefixed with that rail (for example `VBDS: ...`);
the feed keeps waiting for the other rail and the field is cleared when the feed becomes `active`.

> **Note**: Currently only applicable to VISA bulk feeds.


### `expectedCardCount`

`number`, optional

The expected number of cards that will be enrolled under this bulk feed, as provided at creation time.
Only present when the feed was created with this field.


### `transactionStartDate`

`Date`, optional

Transactions posted on or after this calendar date are ingested for this
feed's deliveries, replacing the default 15-day ingestion window.
Currently supported for SMARTDATA feeds only. Only present when set;
when absent, the default 15-day window applies. The comparison is
calendar-day based in UTC: the network's posting date is a date-only
field, so the cutoff is the start of the stated day with no
local-timezone adjustment.


### `createdAt`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

### `updatedAt`

`Date`, required

Date and time when this resource was last updated, in UTC, following ISO 8601 format.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/network-bulk-feeds/75ea3c99-6bf5-4b16-8f68-0cdc43d75806"
    }
  },
  "id": "75ea3c99-6bf5-4b16-8f68-0cdc43d75806",
  "subaccountId": "f297d659-c13d-4219-aeaa-e10a845140a5",
  "network": "MASTERCARD",
  "networkReference": "G1234567",
  "state": "submitted",
  "type": "SMARTDATA",
  "panFormat": "encrypted",
  "createdAt": "2024-12-19T14:45:00Z",
  "updatedAt": "2024-12-19T14:45:00Z"
}
```

[Back to top](#) · [Back to README](../README.md)


