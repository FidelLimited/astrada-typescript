
# Subaccount

A subaccount. Every representation of this resource (`GET /subaccounts/{subaccountId}`,
`GET /subaccounts`, and the `POST /subaccounts` / `PATCH /subaccounts/{subaccountId}`
responses) reports the same EFFECTIVE read model: `enforceIssuerCountry`,
`enrollmentPolicy`, `bankLinkingPolicy`, `plaidEndCustomer` and `consentPolicy` are resolved
live against the parent account rather than echoed as stored on the subaccount, and
`networkBlockedCards` is resolved live from the platform network configuration. A write
response therefore matches the subaccount you would read back immediately afterwards, and
can surface account-level and platform-level settings the subaccount stores nothing for.

Exception: `enforceIssuerCountry` is omitted from the `GET /subaccounts` list items.


## Properties

### `_links`

[SubaccountLinks](SubaccountLinks.md), required

### `accountId`

`string`, required

The unique identifier of the account related to this entity.

### `id`

`string`, required

The unique identifier of this subaccount entity.

### `name`

`string`, required

The name of this subaccount entity.

### `createdAt`

`Date`, required

Date and time when this resource was created, in UTC, following ISO 8601 format.

### `updatedAt`

`Date`, required

Date and time when this resource was last updated, in UTC, following ISO 8601 format.

### `configurations`

[SubaccountConfiguration](SubaccountConfiguration.md), required

### `verificationPolicy`

[VerificationPolicy](VerificationPolicy.md), optional, can be `null`

The subaccount's card verification policy.

- Copied from the account when the subaccount is created; `PATCH` changes it field by field.
- The tier and `sandbox` use only this value (in the sandbox environment, `sandbox` counts as `true` for every subaccount).
- `failedAttemptLockout` falls back to the account's while the subaccount's policy, or its `failedAttemptLockout`, is `null`.


### `enforceIssuerCountry`

`boolean`, optional

Whether card enrollment is restricted to issuer countries within the account's
capabilities. Account-level setting, resolved onto the subaccount at read time;
there is no subaccount-level override, so the subaccount never stores its own
value. Absent on the subaccount list; `false` when the account has not enabled it.


### `networkBlockedCards`

[{ [key: string]: SubaccountNetworkBlockedCardsValue; }](SubaccountNetworkBlockedCardsValue.md), optional, read only

Platform-level enrollment rules resolved from the network configuration at read time.
Applied before the subaccount's own block lists and not configurable per account or
subaccount. Keyed by network (`VISA`, `MASTERCARD`, `AMEX`); a network with no rules is
omitted. A rule matches a card when `cardType` equals the BIN's `type` and
`fundingTypes` contains the BIN's `fundingType`. An omitted or empty `fundingTypes`
matches every funding type. Enrolling a matching card fails with
`card_subscription.network_blocking_card`.


### `amexProduct`

[SubaccountAmexProduct](SubaccountAmexProduct.md), optional, can be `null`

### `enrollmentPolicy`

[SubaccountEnrollmentPolicy](SubaccountEnrollmentPolicy.md), optional, can be `null`

Enrollment policy. Fields are the EFFECTIVE values: the unified-SDK rails
(`cardEnrollment`, `bankEnrollment`, `bulkEnrollment`) and the deprecated
`bulkEnrollmentEnabled` resolve as subaccount-overrides-account, and are SPARSE; only
explicitly-configured fields appear; `linkAnotherCard` resolves live to `false`
when either level stores an explicit `false` (absent everywhere = enabled, field
omitted). `bankEnrollmentLocked` is read-only: it
appears, as `true`, only while the account has locked `bankEnrollment`, and
`bankEnrollment` is then the account's value. `null` means the subaccount stores
no policy and neither a rail nor `linkAnotherCard` is set at the account level
(account-level admin snapshot fields do not surface through a `null` here).


### `plaidEndCustomer`

[PlaidEndCustomer](PlaidEndCustomer.md), optional, can be `null`

Plaid End-Customer routing. `enabled` is the EFFECTIVE value; resolved
from the parent account. This object is account-level only: there is no
subaccount-level override, so the subaccount never stores its own value. `null` means
the account has Plaid End-Customer routing disabled.


### `bankLinkingPolicy`

[BankLinkingPolicy](BankLinkingPolicy.md), optional, can be `null`

Admin-managed bank-linking policy. Fields are the EFFECTIVE values;
per-field live resolution against the parent account (subaccount field if set,
else account, else `null`). A whole-`null` policy means neither level has one
set. The credit-only system default (`accountTypes: [credit]`) is applied
downstream at bank-link creation, not materialized in this read.


### `consentPolicy`

[ConsentPolicy](ConsentPolicy.md), optional

The effective consent policy, set by Astrada. A subaccount with no `consentPolicy` behaves
as `log` with every channel allowed, and an account `mode` of `off` turns the mode off for
every subaccount. Which mode a new or existing account starts in: [When consent is required](https://docs.astrada.co/docs/direct-api-card-enrollment-integration#when-consent-is-required).


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/subaccounts/81e7c267-0927-4234-a2bd-78cef799de54"
    }
  },
  "accountId": "073fe1bb-3350-46ad-b3a6-32afb3780994",
  "id": "81e7c267-0927-4234-a2bd-78cef799de54",
  "name": "Subaccount A",
  "createdAt": "2024-05-01T17:08:43.810Z",
  "updatedAt": "2024-05-01T17:08:43.810Z",
  "configurations": {
    "VISA": {
      "countries": [
        "USA",
        "CAN"
      ],
      "single-enrollment": {
        "countries": [
          "USA"
        ],
        "blockedCardTypes": [
          "CONSUMER"
        ],
        "blockedFundingCardTypes": [
          "DEBIT"
        ]
      },
      "bulk-enrollment": {
        "countries": [
          "CAN"
        ],
        "blockedCardTypes": [
          "CONSUMER"
        ],
        "blockedFundingCardTypes": [
          "DEBIT"
        ]
      }
    },
    "MASTERCARD": {
      "countries": [
        "USA"
      ],
      "single-enrollment": {
        "countries": [
          "USA"
        ],
        "blockedCardTypes": [
          "CONSUMER"
        ],
        "blockedFundingCardTypes": [
          "DEBIT"
        ]
      },
      "bulk-enrollment": {
        "countries": [
          "GBR"
        ],
        "blockedCardTypes": [
          "CONSUMER"
        ],
        "blockedFundingCardTypes": [
          "DEBIT"
        ]
      }
    },
    "AMEX": {
      "countries": [
        "ITA"
      ],
      "single-enrollment": {
        "countries": [
          "ITA"
        ],
        "blockedCardTypes": [
          "CONSUMER"
        ],
        "blockedFundingCardTypes": [
          "DEBIT"
        ]
      },
      "bulk-enrollment": {
        "countries": [
          "SWE"
        ],
        "blockedCardTypes": [
          "CONSUMER"
        ],
        "blockedFundingCardTypes": [
          "DEBIT"
        ]
      }
    }
  },
  "amexProduct": {
    "clearing": {
      "enabled": true
    },
    "realTimeAuth": null
  }
}
```

[Back to top](#) · [Back to README](../README.md)


