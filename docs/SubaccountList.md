
# SubaccountList

## Properties

### `_embedded`

[SubaccountListEmbedded](SubaccountListEmbedded.md), required

### `_links`

[PageLinks](PageLinks.md), required

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "_links": {
    "self": {
      "href": "/subaccounts"
    }
  },
  "_embedded": {
    "subaccounts": [
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
                "USA",
                "CAN"
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
                "USA",
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
              "blockedCardTypes": [],
              "blockedFundingCardTypes": []
            },
            "bulk-enrollment": {
              "countries": [
                "USA"
              ],
              "blockedCardTypes": [],
              "blockedFundingCardTypes": []
            }
          }
        }
      },
      {
        "_links": {
          "self": {
            "href": "/subaccounts/3788493c-49f5-4f5e-9152-56abc2a4e153"
          }
        },
        "accountId": "073fe1bb-3350-46ad-b3a6-32afb3780994",
        "id": "3788493c-49f5-4f5e-9152-56abc2a4e153",
        "name": "Subaccount B",
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
                "USA",
                "CAN"
              ],
              "blockedCardTypes": [],
              "blockedFundingCardTypes": [
                "DEBIT"
              ]
            },
            "bulk-enrollment": {
              "countries": [
                "USA",
                "CAN"
              ],
              "blockedCardTypes": [],
              "blockedFundingCardTypes": []
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
              "blockedFundingCardTypes": []
            },
            "bulk-enrollment": {
              "countries": [
                "USA"
              ],
              "blockedCardTypes": [],
              "blockedFundingCardTypes": []
            }
          }
        }
      }
    ]
  }
}
```

[Back to top](#) · [Back to README](../README.md)


