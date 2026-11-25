
# SubaccountConfiguration

Subaccount network and regional configurations which determine the available networks and geographies during card enrollment.

## Properties

### `VISA`

[SubaccountConfigurationVISA](SubaccountConfigurationVISA.md), optional

### `MASTERCARD`

[SubaccountConfigurationMASTERCARD](SubaccountConfigurationMASTERCARD.md), optional

### `AMEX`

[SubaccountConfigurationAMEX](SubaccountConfigurationAMEX.md), optional

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
}
```

[Back to top](#) · [Back to README](../README.md)


