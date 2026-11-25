
# EnrollmentLinkDetail

## Properties

### `_links`

[SelfLinks](SelfLinks.md), required

### `id`

`string`, required

The link's identifier.

### `kind`

`string`, required

- `cardholder`: a personal link for one employee. It allows up to 5 session starts and
  is used up by the first session that completes something.
- `team`: a link to share with a team. Every session start counts as a use, up to
  `maxUses`.


One of: `cardholder`, `team`. A value the SDK does not know yet is passed through as a plain string.

### `subaccountId`

`string`, required

The subaccount that cards enrolled through the link join.

### `startingPoint`

`string`, required

Where the hosted page starts. Only `card` is available now; links made before the field existed read as `card`.

One of: `card`. A value the SDK does not know yet is passed through as a plain string.

### `state`

`string`, required

- `active`: sessions can start.
- `used`: a personal link whose session completed something.
- `revoked`: revoked with `POST /enrollment-links/{linkId}/revoke` or by deleting its
  subaccount. Team links revoked by the former five-active-link limit on
  `POST /subaccounts/{subaccountId}/team-link` stay revoked.
- `expired`: an active link past `expiresAt`.


One of: `active`, `used`, `revoked`, `expired`. A value the SDK does not know yet is passed through as a plain string.

### `expiresAt`

`Date`, required

After this time no session starts from the link.

### `maxUses`

`number`, required

1 on a personal link. On a team link, the session starts it allows.

### `uses`

`number`, required

On a team link, the sessions started so far. On a personal link, 1 once it is used, otherwise 0.

### `starts`

`number`, required

The sessions started from the link so far.

### `customerReferenceId`

`string`, optional

The reference given when the link was created. Absent when none was given.

### `platformName`

`string`, optional

The platform name given when the link was created. Absent when none was given. The
hosted page ignores it once the account has a brand profile.


### `organizationName`

`string`, optional

The organization name given when the link was created. Absent when none was given.

### `createdBy`

[EnrollmentLinkCreatedBy](EnrollmentLinkCreatedBy.md), required

### `createdAt`

`Date`, required

### `updatedAt`

`Date`, required

### `usedAt`

`Date`, optional

When a personal link was used up.

### `revokedAt`

`Date`, optional

When the link was revoked.

### `sessions`

[Array<EnrollmentLinkSession>](EnrollmentLinkSession.md), required

The sessions started from the link, oldest first.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/enrollment-links/1d0a6c52-8f3e-4b7a-9c21-5e4d3b2a1f09"
    }
  },
  "id": "1d0a6c52-8f3e-4b7a-9c21-5e4d3b2a1f09",
  "kind": "cardholder",
  "subaccountId": "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
  "startingPoint": "card",
  "state": "used",
  "expiresAt": "2026-11-11T18:00:00.000Z",
  "maxUses": 1,
  "uses": 1,
  "starts": 2,
  "customerReferenceId": "2b7e9d14-5c3a-4f8e-9b21-0d6c4a8e7f35",
  "platformName": "Ledgerly",
  "organizationName": "Vertex Industries",
  "createdBy": {
    "via": "api",
    "clientId": "3f9c1e7a-2b4d-4c6e-8f0a-1b3d5e7f9a2c"
  },
  "createdAt": "2026-11-04T18:00:00.000Z",
  "updatedAt": "2026-11-05T09:14:22.000Z",
  "usedAt": "2026-11-05T09:14:22.000Z",
  "sessions": [
    {
      "id": "7b9d1f3a-5c7e-4a9b-8d1f-3a5c7e9b1d3f",
      "state": "expired",
      "startedAt": "2026-11-05T08:02:10.000Z",
      "expiresAt": "2026-11-05T09:02:10.000Z"
    },
    {
      "id": "9a3e5c7b-1d2f-4e6a-8b0c-3e5a7c9e1b2d",
      "state": "completed",
      "startedAt": "2026-11-05T09:05:40.000Z",
      "expiresAt": "2026-11-05T10:05:40.000Z",
      "completedAt": "2026-11-05T09:14:22.000Z",
      "outcome": {
        "subscriptionIds": [
          "c4e6a8b0-2d4f-4a6c-9e1b-3d5f7a9c1e3b"
        ],
        "cardIds": [
          "e1b3d5f7-9a1c-4e3b-8d5f-7a9c1e3b5d7f"
        ],
        "summary": {
          "cardsEnrolled": 1
        }
      }
    }
  ]
}
```

[Back to top](#) · [Back to README](../README.md)


