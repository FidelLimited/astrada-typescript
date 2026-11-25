
# EnrollmentLink

An enrollment link to the Astrada-hosted page where people enroll their own cards into
one subaccount. The link's `url` is returned only by the request that creates it.


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

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/enrollment-links/8e2f4a6c-1b3d-4e5f-9a7b-2c4d6e8f0a1b"
    }
  },
  "id": "8e2f4a6c-1b3d-4e5f-9a7b-2c4d6e8f0a1b",
  "kind": "team",
  "subaccountId": "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
  "startingPoint": "card",
  "state": "revoked",
  "expiresAt": "2026-11-19T10:00:00.000Z",
  "maxUses": 50,
  "uses": 12,
  "starts": 12,
  "createdBy": {
    "via": "sdk",
    "clientId": "5a7c9e1b-3d5f-4a6c-8e0b-2d4f6a8c0e1f"
  },
  "createdAt": "2026-11-05T10:00:00.000Z",
  "updatedAt": "2026-11-07T09:30:00.000Z",
  "revokedAt": "2026-11-07T09:30:00.000Z"
}
```

[Back to top](#) · [Back to README](../README.md)


