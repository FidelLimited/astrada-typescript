
# BankAccountLinkCardsResult

## Properties

### `linked`

`{ [key: string]: Array<string>; }`, required

bankAccountId -> cardIds linked in THIS run.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "linked": {
    "059d5e6a-cfb1-46e6-ab84-6586582b6b58": [
      "da28e1b8-c7a4-4575-b72f-3a88d6fe34df"
    ]
  }
}
```

[Back to top](#) · [Back to README](../../README.md)


