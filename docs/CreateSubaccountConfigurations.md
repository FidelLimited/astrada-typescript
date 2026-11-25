
# CreateSubaccountConfigurations

Subaccount network and regional configurations which determine the available networks and geographies during card enrollment.

The `countries` property for each network accepts either:
- An array of ISO 3166 alpha-3 country codes (e.g. `["USA", "CAN"]`)
- The string `"*"` to inherit all countries from the parent account's capabilities for that network

When `"*"` is used, the subaccount automatically reflects the parent account's current country list. If the parent account's capabilities change, subaccounts using `"*"` will inherit the updated countries. API responses always return the resolved country list, never the `"*"` literal.

The single and bulk enrollment configurations are optional. Countries are set per network: each one's country list is the network's `countries`, limited to the countries the account allows for that way of enrolling. The supported card types for single and bulk enrollment is CONSUMER, while the supported funding card types is DEBIT. If not provided, the block rules for both card types will default to the parent account's default block rule for that network and enrollment level. A list you send is combined with the account's defaults, so it can add blocks but never remove one of the account's defaults. Visa consumer debit and prepaid cards are blocked at the network level regardless of these settings; see `networkBlockedCards` on the subaccount.

Inside `single-enrollment` and `bulk-enrollment`, only `blockedCardTypes` and `blockedFundingCardTypes` are read. Any other key is ignored, not refused: a `countries` there (reads return the countries Astrada works out for each way of enrolling), and a misspelled name too, so a block list sent as `blockedCardType` is not saved and the account's default applies.

The same holds higher up: inside a network only `countries`, `single-enrollment` and `bulk-enrollment` are read, and at the top only `VISA`, `MASTERCARD` and `AMEX`. Any other key there is ignored, not refused. So a network sent as `Visa` is dropped: on create the subaccount is made without it (with no network left, the request is refused with `Configuration is not a subset of the Capabilities.`), and on `PATCH`, if the subaccount has Visa, the request is refused with `Delete a configuration is not supported.` (or with `Configuration is not a subset of the Capabilities.` when no network is left in the body), because every network the subaccount has must be sent.

To set the default rule on the parent account, please reach out to your account manager or support.


## Properties

### `VISA`

[CreateSubaccountConfigurationsVISA](CreateSubaccountConfigurationsVISA.md), optional

### `MASTERCARD`

[CreateSubaccountConfigurationsMASTERCARD](CreateSubaccountConfigurationsMASTERCARD.md), optional

### `AMEX`

[CreateSubaccountConfigurationsAMEX](CreateSubaccountConfigurationsAMEX.md), optional

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "VISA": {
    "countries": [
      "USA",
      "CAN"
    ],
    "single-enrollment": {
      "blockedCardTypes": [
        "CONSUMER"
      ],
      "blockedFundingCardTypes": [
        "DEBIT"
      ]
    },
    "bulk-enrollment": {
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
      "blockedCardTypes": [
        "CONSUMER"
      ],
      "blockedFundingCardTypes": [
        "DEBIT"
      ]
    },
    "bulk-enrollment": {
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
      "blockedCardTypes": [
        "CONSUMER"
      ],
      "blockedFundingCardTypes": [
        "DEBIT"
      ]
    },
    "bulk-enrollment": {
      "blockedCardTypes": [
        "CONSUMER"
      ],
      "blockedFundingCardTypes": [
        "DEBIT"
      ]
    }
  }
}
```

[Back to top](#) · [Back to README](../README.md)


