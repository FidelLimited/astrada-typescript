
# BankLinkFilters

The account filtering actually applied to this link, after resolution against the account's bank-linking policy. Echoes what the hosted session will offer; absent on links created before filtering existed.


## Properties

### `accountTypes`

`Array<string>`, optional

Account types selectable in the hosted session.

One of: `checking`, `savings`, `credit`. A value the SDK does not know yet is passed through as a plain string.

### `linkCustomizationName`

`string`, optional

The Plaid Link customization this link asked for: the request's `filters.linkCustomizationName`, or else the bank-linking policy's `plaidLinkCustomizationName`. Absent when neither applies. When Plaid refused `amex_only` and the create was retried without it, this still reads `amex_only`, and the link's completion is still held to American Express institutions.


[Back to top](#) · [Back to README](../../README.md)


