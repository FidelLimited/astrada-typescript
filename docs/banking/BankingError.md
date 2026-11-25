
# BankingError

The error body of the Banking API: plain JSON with `statusCode` and `message`. The card APIs use a different body (`title` and `detail`). Branch on `code` where a refusal carries one; `message` is text for people.

One exception: a `401` for a missing or invalid token comes from the gateway, before the request reaches the Banking API, and carries `title` and `detail` like the card APIs.


## Properties

### `statusCode`

`number`, required

The HTTP status code of the answer, repeated in the body.

### `message`

`string`, required

What went wrong, in words. Some messages carry ids or states, so do not parse it.

### `code`

`string`, optional

A stable name for the refusal, such as `SUBACCOUNT_NOT_FOUND`. Present on some refusals only.

### `error`

`string`, optional

The name of the HTTP status, such as `Not Found`. Present on some refusals only.

### `reason`

`string`, optional

Why the refusal happened, on the refusals that name one. For example, `BANK_ENROLLMENT_DISABLED` carries `network-not-allowed` when the account's setting does not allow a bank link for that card network.

### `errors`

`Array<object>`, optional

The validation problems, on a `400` for a request that did not pass validation. Each item has a `path`, the place of the field in the request; its other fields come from the validation library and can change.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "statusCode": 400,
  "message": "Invalid cardId",
  "error": "Bad Request"
}
```

[Back to top](#) · [Back to README](../../README.md)


