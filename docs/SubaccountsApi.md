# SubaccountsApi

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createSubaccount**](#createsubaccount) | **POST** /subaccounts | Create subaccount |
| [**getSubaccount**](#getsubaccount) | **GET** /subaccounts/{subaccountId} | Retrieve subaccount |
| [**listSubaccounts**](#listsubaccounts) | **GET** /subaccounts | List subaccounts |
| [**updateSubaccount**](#updatesubaccount) | **PATCH** /subaccounts/{subaccountId} | Update subaccount configurations |


<a id="createsubaccount"></a>
## createSubaccount

`createSubaccount(params): Promise<Subaccount>`

Create subaccount

Creates a new subaccount, allowing you to set network and regional configurations.

Each network's `countries` can be set to either an array of specific ISO 3166 alpha-3 country codes, or the string `"*"` to inherit all countries from the parent account's capabilities for that network.

When using `"*"`, the subaccount will automatically reflect the parent account's current country list. If the parent account's capabilities change, subaccounts configured with `"*"` will inherit the updated countries.

The single and bulk enrollment configurations are optional. Countries are set per network: each one's country list is the network's `countries`, limited to the countries the account allows for that way of enrolling.
The supported card types for single and bulk enrollment is CONSUMER, while the supported funding card types is DEBIT. If not provided, the block rules for both card types will default to the parent account's default block rule for that network and enrollment level. A list you send is combined with the account's defaults, so it can add blocks but never remove one of the account's defaults. Visa consumer debit and prepaid cards are blocked at the network level regardless of these settings; see `networkBlockedCards` on the subaccount.

To set the default rule on the parent account, please reach out to your account manager or support.


### Example

```ts
import { Configuration, SubaccountsApi } from '@astrada.co/ts-astrada-sdk';
import { SubaccountCreateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new SubaccountsApi(config);

const result = await api.createSubaccount({
  subaccountCreateParams: SubaccountCreateParamsFromJSON({
  "name": "Subaccount A",
  "configurations": {
    "VISA": {
      "countries": [
        "USA",
        "CAN"
      ]
    },
    "MASTERCARD": {
      "countries": [
        "USA"
      ]
    }
  }
}),
});
console.log(result);
```

### Parameters


- **subaccountCreateParams** ([SubaccountCreateParams](SubaccountCreateParams.md), optional)

### Returns

[Subaccount](Subaccount.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

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

### Scopes

`subaccounts:write`

### Responses

| Status | Description |
|--------|-------------|
| **201** | New subaccount created successfully. The body is the same effective read model `GET /subaccounts/{subaccountId}` returns (`enrollmentPolicy`, `bankLinkingPolicy`, `plaidEndCustomer` and `enforceIssuerCountry` resolved against the parent account, and `networkBlockedCards` resolved from the platform network configuration), not the raw create-time snapshot. Account-level and platform-level settings therefore appear here even though the new subaccount stores no value for them.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="getsubaccount"></a>
## getSubaccount

`getSubaccount(params): Promise<Subaccount>`

Retrieve subaccount

Returns detailed information about a specific subaccount by its identifier, including configuration details and associated data.

`_links.team-link` appears when enrollment links are enabled for the account, the token holds `card-subscriptions:write` or `subaccounts:write`, and the subaccount's card enrollment is on (its `enrollmentPolicy.cardEnrollment` is not `false`). It points to `POST /subaccounts/{subaccountId}/team-link`, which creates a team link for the subaccount. An enrollment link session's token never gets it.


### Example

```ts
import { Configuration, SubaccountsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new SubaccountsApi(config);

const result = await api.getSubaccount({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required)

### Returns

[Subaccount](Subaccount.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

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

### Scopes

`subaccounts:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Details of the subaccount giving the accountId and subaccountId |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="listsubaccounts"></a>
## listSubaccounts

`listSubaccounts(params): Promise<SubaccountList>`

List subaccounts

Returns a list of all subaccounts associated with the account.

This endpoint supports [cursor-based pagination](https://docs.astrada.co/reference/pagination).


### Example

```ts
import { Configuration, SubaccountsApi } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new SubaccountsApi(config);

const result = await api.listSubaccounts({
  // cursor: 'ZXhhbXBsZQ==',
  // limit: 25,
});
console.log(result);
```

### Parameters


- **cursor** (`string`, optional): The cursor to use for pagination. Identifies your place on the list
- **limit** (`number`, optional): Maximum number of items to return

### Returns

[SubaccountList](SubaccountList.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

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

### Scopes

`subaccounts:read`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Subaccounts list retrieved successfully |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

<a id="updatesubaccount"></a>
## updateSubaccount

`updateSubaccount(params): Promise<SubaccountUpdateResult>`

Update subaccount configurations

Update a subaccount name and configurations.
All updated configurations are validated against the capabilities of the main account to ensure compliance.
It is possible to add new networks and/or regions but it is not possible to remove any configurations that were previously set.
`configurations` replaces the whole object: send every network the subaccount has (a network left out is refused with `Delete a configuration is not supported.`), and every block list you want to keep (a block list left out goes back to the account's default).

Each network's `countries` can be set to either an array of specific ISO 3166 alpha-3 country codes, or the string `"*"` to inherit all countries from the parent account's capabilities for that network.

When using `"*"`, the subaccount will automatically reflect the parent account's current country list. If the parent account's capabilities change, subaccounts configured with `"*"` will inherit the updated countries.

The single and bulk enrollment configurations are optional. Countries are set per network: each one's country list is the network's `countries`, limited to the countries the account allows for that way of enrolling. The supported card types for single and bulk enrollment is CONSUMER, while the supported funding card types is DEBIT. If not provided, the block rules for both card types will default to the parent account's default block rule for that network and enrollment level. A list you send is combined with the account's defaults, so it can add blocks but never remove one of the account's defaults. Visa consumer debit and prepaid cards are blocked at the network level regardless of these settings; see `networkBlockedCards` on the subaccount.

To set the default rule on the parent account, please reach out to your account manager or support.


### Example

```ts
import { Configuration, SubaccountsApi } from '@astrada.co/ts-astrada-sdk';
import { SubaccountUpdateParamsFromJSON } from '@astrada.co/ts-astrada-sdk';

const config = new Configuration({
  environment: 'sandbox',
  accountId: process.env.ASTRADA_ACCOUNT_ID!,
  clientId: process.env.ASTRADA_CLIENT_ID!,
  clientSecret: process.env.ASTRADA_CLIENT_SECRET!,
});
const api = new SubaccountsApi(config);

const result = await api.updateSubaccount({
  subaccountId: '24c4f90d-ab3b-4f6e-8a1d-d251a4fcf34c',
  subaccountUpdateParams: SubaccountUpdateParamsFromJSON({
  "name": "New name"
}),
});
console.log(result);
```

### Parameters


- **subaccountId** (`string`, required)
- **subaccountUpdateParams** ([SubaccountUpdateParams](SubaccountUpdateParams.md), required)

### Returns

[SubaccountUpdateResult](SubaccountUpdateResult.md)

Example response body (as sent by the API; the SDK turns date strings into `Date`):

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

### Scopes

`subaccounts:write`

### Responses

| Status | Description |
|--------|-------------|
| **200** | Specified subaccount updated successfully. The body is the same effective read model `GET /subaccounts/{subaccountId}` returns (`enrollmentPolicy`, `bankLinkingPolicy`, `plaidEndCustomer` and `enforceIssuerCountry` resolved against the parent account, and `networkBlockedCards` resolved from the platform network configuration), so it may include account-level and platform-level settings that were not part of the request and that the subaccount stores no value for.  When the request\'s `enrollmentPolicy` holds keys this endpoint does not accept, the body also carries `ignoredFields`, which names each of them. Unknown keys outside `enrollmentPolicy` are ignored and not listed.  |
| **400** | The server cannot or will not process the request due to something that is perceived to be a client error |
| **401** | Authentication credentials were either missing or incorrect |
| **403** | Authentication credentials used do not have have permissions to perform the request |
| **404** | The requested resource was not found on the server |
| **500** | The server encountered an unexpected condition that prevented it from fulfilling the request |

Answers outside 2xx throw a `ResponseError` subclass; see [Errors](../README.md#errors).

[Back to top](#) · [Back to README](../README.md)

