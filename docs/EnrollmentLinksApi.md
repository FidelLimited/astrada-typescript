# EnrollmentLinksApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createEnrollmentLink**](#createenrollmentlink) | **POST** /enrollment-links | Create enrollment link |
| [**createTeamLink**](#createteamlink) | **POST** /subaccounts/{subaccountId}/team-link | Create team link |
| [**getEnrollmentLink**](#getenrollmentlink) | **GET** /enrollment-links/{linkId} | Retrieve enrollment link |
| [**listEnrollmentLinks**](#listenrollmentlinks) | **GET** /enrollment-links | List enrollment links |
| [**revokeEnrollmentLink**](#revokeenrollmentlink) | **POST** /enrollment-links/{linkId}/revoke | Revoke enrollment link |


<a id="createenrollmentlink"></a>
## createEnrollmentLink

`createEnrollmentLink(params): Promise<EnrollmentLinkCreateResult>`

Create enrollment link

Creates an enrollment link for one of your subaccounts. The link opens a page on
Astrada's SDK host where the person who has it enrolls their own cards into that
subaccount.

- A personal link (`kind: cardholder`) is for one employee. It allows up to 5 session
  starts and is used up by the first session that completes something.
- A team link (`kind: team`) is for sharing. Each session start counts as a use, up to
  `maxUses`.

The response's `url` carries the link's secret after `#`. This response is the only
one that returns it, and it is sent with `Cache-Control: no-store`. Astrada stores only
a hash of the secret. In sandbox the `url` starts with
`https://sdk.sandbox.astrada.co/unified/v2/enroll.html#`.

Requires `subaccounts:write`.

Refusals carry a `code`:

- `404` `SUBACCOUNT_NOT_FOUND`: `subaccountId` is not one of your subaccounts.
- `409` `ENROLLMENT_LINKS_NOT_ENABLED`: enrollment links are not enabled for your
  account.
- `409` `CARD_ENROLLMENT_OFF`: card enrollment is off for the subaccount (its
  `enrollmentPolicy.cardEnrollment` is `false`). The hosted page offers card enrollment
  only, so a link would have nothing to enroll. This check runs before the daily limit
  is counted, so a refused request does not use it up.
- `400` `LINK_NAME_NOT_ALLOWED`: `organizationName` or `platformName` is a
  well-known brand name, such as a card network or a large bank, matched ignoring case,
  accents and punctuation. Astrada and Plaid are also refused inside a longer name.
- `429` `RATE_LIMITED`: your account has created 2,000 links today (UTC), team links
  made with `POST /subaccounts/{subaccountId}/team-link` included.

A link made before card enrollment was turned off starts no session while card
enrollment stays off: `POST /enrollment-link-sessions/preview` and
`POST /enrollment-link-sessions` answer `409` `CARD_ENROLLMENT_OFF`, and no start is
counted.


### Example

```ts
import { Configuration, EnrollmentLinksApi } from '@astrada.co/ts-astrada-sdk';
import { EnrollmentLinkCreateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new EnrollmentLinksApi(config);

const result = await api.createEnrollmentLink({
  enrollmentLinkCreateParams: EnrollmentLinkCreateParamsFromJSON({
  "subaccountId": "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
  "kind": "cardholder",
  "customerReferenceId": "2b7e9d14-5c3a-4f8e-9b21-0d6c4a8e7f35",
  "platformName": "Ledgerly",
  "organizationName": "Vertex Industries"
}),
});
console.log(result);
```

### Parameters


- **enrollmentLinkCreateParams** ([EnrollmentLinkCreateParams](EnrollmentLinkCreateParams.md), required)

### Returns

[EnrollmentLinkCreateResult](EnrollmentLinkCreateResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

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
  "state": "active",
  "expiresAt": "2026-11-11T18:00:00.000Z",
  "maxUses": 1,
  "uses": 0,
  "starts": 0,
  "customerReferenceId": "2b7e9d14-5c3a-4f8e-9b21-0d6c4a8e7f35",
  "platformName": "Ledgerly",
  "organizationName": "Vertex Industries",
  "createdBy": {
    "via": "api",
    "clientId": "3f9c1e7a-2b4d-4c6e-8f0a-1b3d5e7f9a2c"
  },
  "createdAt": "2026-11-04T18:00:00.000Z",
  "updatedAt": "2026-11-04T18:00:00.000Z",
  "url": "https://sdk.sandbox.astrada.co/unified/v2/enroll.html#el1_4bT7m2QxwZ9lK1pN0vYcRfHsUeGdJaLoWiXqBnMzE3S"
}
```

### Scopes

`subaccounts:write`

### Responses

| Status | Description |
|--------|-------------|
| **201** | The link, with its `url`. |
| **400** | The body failed validation, and `errors` names the field. Or `organizationName` or `platformName` is a well-known brand name, with `code` `LINK_NAME_NOT_ALLOWED`.  |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token holds none of the scopes the route accepts, or it is an enrollment link session\'s token, which no scope lets manage links. A missing scope answers without a `code`. A link session token that holds an accepted scope answers with `code` `LINK_SESSION_FORBIDDEN`.  |
| **404** | The subaccount is not one of your account\'s subaccounts. Nothing is created.  |
| **409** | The link was not created, and nothing is stored. `code` says why:  - `ENROLLMENT_LINKS_NOT_ENABLED`: enrollment links are not enabled for the account.   Astrada enables them per account. - `CARD_ENROLLMENT_OFF`: card enrollment is off for the subaccount (its   `enrollmentPolicy.cardEnrollment` is `false`). The hosted page offers card enrollment   only, so a link would have nothing to enroll.  |
| **429** | A rate limit was reached. The operation\'s description names its limits. Retry later.  |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="createteamlink"></a>
## createTeamLink

`createTeamLink(params): Promise<TeamLink>`

Create team link

Creates a team link for the subaccount: the route for the SDK's "Invite your team"
ending, which calls it with the SDK token's `card-subscriptions:write`. An API client
may call it with `subaccounts:write`. No body.

`_links.team-link` on `GET /subaccounts/{subaccountId}` points here when the route is
available to the caller.

The link has the team defaults: it expires after 14 days and allows 50 session starts.
The response holds only what the SDK screen shows, and is sent with
`Cache-Control: no-store`. Every call makes a new link. A new link does not revoke an
older one: each link ends at its own expiry, when its session starts are used up, or
when it is revoked. Revoke a link you no longer want shared with
`POST /enrollment-links/{linkId}/revoke`.

Refusals carry a `code`:

- `403` `LINK_SESSION_FORBIDDEN`: the token is an enrollment link session's. It holds
  `card-subscriptions:write` too, but cannot make links.
- `404` `SUBACCOUNT_NOT_FOUND`: the subaccount is not one of your account's.
- `409` `ENROLLMENT_LINKS_NOT_ENABLED`: enrollment links are not enabled for your
  account.
- `409` `CARD_ENROLLMENT_OFF`: card enrollment is off for the subaccount (its
  `enrollmentPolicy.cardEnrollment` is `false`). The hosted page offers card enrollment
  only, so a link would have nothing to enroll. This check runs before the daily limits
  are counted, so a refused request does not use them up.
- `429` `RATE_LIMITED`: 20 links were made here for the subaccount today (UTC), or your
  account has created 2,000 links today.

A link made before card enrollment was turned off starts no session while card
enrollment stays off: `POST /enrollment-link-sessions/preview` and
`POST /enrollment-link-sessions` answer `409` `CARD_ENROLLMENT_OFF`, and no start is
counted.


### Example

```ts
import { Configuration, EnrollmentLinksApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new EnrollmentLinksApi(config);

const result = await api.createTeamLink({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required)

### Returns

[TeamLink](TeamLink.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "id": "8e2f4a6c-1b3d-4e5f-9a7b-2c4d6e8f0a1b",
  "url": "https://sdk.sandbox.astrada.co/unified/v2/enroll.html#el1_Qm9Lx2Vt8RkZ1pW4nJ7cH0sD3fG6aY9uE2iO5rT8bN1",
  "expiresAt": "2026-11-19T10:00:00.000Z",
  "maxUses": 50
}
```

### Scopes

Any valid token.

### Responses

| Status | Description |
|--------|-------------|
| **201** | The team link. |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token holds none of the scopes the route accepts, or it is an enrollment link session\'s token, which no scope lets manage links. A missing scope answers without a `code`. A link session token that holds an accepted scope answers with `code` `LINK_SESSION_FORBIDDEN`.  |
| **404** | The subaccount is not one of your account\'s subaccounts. Nothing is created.  |
| **409** | The link was not created, and nothing is stored. `code` says why:  - `ENROLLMENT_LINKS_NOT_ENABLED`: enrollment links are not enabled for the account.   Astrada enables them per account. - `CARD_ENROLLMENT_OFF`: card enrollment is off for the subaccount (its   `enrollmentPolicy.cardEnrollment` is `false`). The hosted page offers card enrollment   only, so a link would have nothing to enroll.  |
| **429** | A rate limit was reached. The operation\'s description names its limits. Retry later.  |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="getenrollmentlink"></a>
## getEnrollmentLink

`getEnrollmentLink(params): Promise<EnrollmentLinkDetail>`

Retrieve enrollment link

Returns one of your enrollment links with its sessions, oldest first, without its
`url`. With the `cardsubscription` webhooks, this is how you see what happened on the
hosted page.

Each session's `outcome` holds the ids the hosted page reported. Nothing checks them
against the card or bank APIs: the `cardsubscription` webhooks are the source of truth
for what was enrolled.

Requires `subaccounts:write`. A link that is not one of yours answers `404` with
`code` `ENROLLMENT_LINK_NOT_FOUND`. A link and its sessions are kept for 90 days after
`expiresAt`, then answer `404`.


### Example

```ts
import { Configuration, EnrollmentLinksApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new EnrollmentLinksApi(config);

const result = await api.getEnrollmentLink({
  linkId: '1d0a6c52-8f3e-4b7a-9c21-5e4d3b2a1f09',
});
console.log(result);
```

### Parameters


- **linkId** (`string`, required): The enrollment link's identifier, the `id` returned when the link was created.

### Returns

[EnrollmentLinkDetail](EnrollmentLinkDetail.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

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

### Scopes

`subaccounts:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | The link and its sessions. |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token holds none of the scopes the route accepts, or it is an enrollment link session\'s token, which no scope lets manage links. A missing scope answers without a `code`. A link session token that holds an accepted scope answers with `code` `LINK_SESSION_FORBIDDEN`.  |
| **404** | No link with this id belongs to your account. Another account\'s link answers the same.  |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="listenrollmentlinks"></a>
## listEnrollmentLinks

`listEnrollmentLinks(params): Promise<EnrollmentLinkList>`

List enrollment links

Lists the enrollment links of one of your subaccounts, newest first, without their
`url`.

A page holds at most `limit` links and can hold fewer, even none, while more remain.
Keep following `_links.next` until a response has no `_links.next`. Use its `href` as
it is: it keeps your `subaccountId`, `state` and `limit`.

A subaccount that has no links, or that is not one of yours, gives an empty list.

Requires `subaccounts:write`, so link details such as references and counts never
reach a browser SDK token.


### Example

```ts
import { Configuration, EnrollmentLinksApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new EnrollmentLinksApi(config);

const result = await api.listEnrollmentLinks({
  subaccountId: '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b',
  // state: 'active',
  // limit: 50,
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required): The subaccount whose links to list.
- **state** (`'active' | 'used' | 'revoked' | 'expired'`, optional): Only links in this state. `active` and `expired` are told apart by `expiresAt`. One of: `active`, `used`, `revoked`, `expired`.
- **limit** (`number`, optional): The most links a page holds.
- **cursor** (`string`, optional): Where the page starts, as set in `_links.next`. A cursor from another subaccount's
listing, or one that does not decode, answers `400` `INVALID_CURSOR`.


### Returns

[EnrollmentLinkList](EnrollmentLinkList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

```json
{
  "_embedded": {
    "enrollmentLinks": [
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
        "state": "active",
        "expiresAt": "2026-11-19T10:00:00.000Z",
        "maxUses": 50,
        "uses": 12,
        "starts": 12,
        "createdBy": {
          "via": "sdk",
          "clientId": "5a7c9e1b-3d5f-4a6c-8e0b-2d4f6a8c0e1f"
        },
        "createdAt": "2026-11-05T10:00:00.000Z",
        "updatedAt": "2026-11-06T16:41:05.000Z"
      },
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
        "usedAt": "2026-11-05T09:14:22.000Z"
      }
    ]
  },
  "_links": {
    "self": {
      "href": "/enrollment-links?subaccountId=6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b&limit=2"
    },
    "next": {
      "href": "/enrollment-links?subaccountId=6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b&limit=2&cursor=eyJwayI6ImxpbmsjMWQwYTZjNTIifQ"
    }
  }
}
```

### Scopes

`subaccounts:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | A page of links. |
| **400** | A query parameter is not valid, and `errors` names it. Or the cursor is not one this listing gave out, with `code` `INVALID_CURSOR`.  |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token holds none of the scopes the route accepts, or it is an enrollment link session\'s token, which no scope lets manage links. A missing scope answers without a `code`. A link session token that holds an accepted scope answers with `code` `LINK_SESSION_FORBIDDEN`.  |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="revokeenrollmentlink"></a>
## revokeEnrollmentLink

`revokeEnrollmentLink(params): Promise<EnrollmentLink>`

Revoke enrollment link

Revokes one of your enrollment links. No body. An active link, an expired one
included, becomes `revoked`: no session starts from it again, and its open sessions
fail their next token refresh, so their access ends within one access token lifetime
(at most 300 seconds). A link that is already used or revoked is returned as it is.

Requires `subaccounts:write`. A link that is not one of yours answers `404` with
`code` `ENROLLMENT_LINK_NOT_FOUND`.


### Example

```ts
import { Configuration, EnrollmentLinksApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new EnrollmentLinksApi(config);

const result = await api.revokeEnrollmentLink({
  linkId: '1d0a6c52-8f3e-4b7a-9c21-5e4d3b2a1f09',
});
console.log(result);
```

### Parameters


- **linkId** (`string`, required): The enrollment link's identifier, the `id` returned when the link was created.

### Returns

[EnrollmentLink](EnrollmentLink.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

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

### Scopes

`subaccounts:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | The link as it is now. |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | The token holds none of the scopes the route accepts, or it is an enrollment link session\'s token, which no scope lets manage links. A missing scope answers without a `code`. A link session token that holds an accepted scope answers with `code` `LINK_SESSION_FORBIDDEN`.  |
| **404** | No link with this id belongs to your account. Another account\'s link answers the same.  |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

