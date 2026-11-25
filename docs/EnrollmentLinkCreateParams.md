
# EnrollmentLinkCreateParams

## Properties

### `subaccountId`

`string`, required

The subaccount that cards enrolled through the link join. It must be one of your subaccounts.

### `kind`

`string`, required

`cardholder` for a personal link, `team` for a team link.

One of: `cardholder`, `team`. A value the SDK does not know yet is passed through as a plain string.

### `customerReferenceId`

`string`, optional

Your reference for the link, such as the employee a personal link is for. It
must be a UUID, as `customerReferenceId` on `POST /card-subscriptions` is;
any other value answers `400`. A session from the link can create card
subscriptions only with this reference.


### `platformName`

`string`, optional

The platform's name, shown on the hosted page. Letters, digits, spaces and
`. , & ' ’ ( ) - _ + ! # @` only, with at least one letter or digit;
surrounding spaces are trimmed. Default: your account's name. A name
that is a well-known brand, such as a card network or a large bank, answers
`400` `LINK_NAME_NOT_ALLOWED`. Once Astrada has set a brand profile for your
account, the hosted pages show its name and ignore this one.


### `organizationName`

`string`, optional

The employer's name, shown on the hosted page. The same characters as
`platformName`, and the same `LINK_NAME_NOT_ALLOWED` refusal. Default: none;
the hosted page then names only the platform.


### `startingPoint`

`string`, optional

Where the hosted page starts. Only `card` is available now; any other value
answers `400`.


One of: `card`. A value the SDK does not know yet is passed through as a plain string.

### `expiresInHours`

`number`, optional

How long the link can start sessions. Default: 168 (7 days) for a personal
link, 336 (14 days) for a team link.


### `maxUses`

`number`, optional

Team links only: the session starts the link allows. Default: 50. On a
personal link it answers `400`.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "subaccountId": "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
  "kind": "cardholder",
  "customerReferenceId": "2b7e9d14-5c3a-4f8e-9b21-0d6c4a8e7f35",
  "platformName": "Ledgerly",
  "organizationName": "Vertex Industries"
}
```

[Back to top](#) · [Back to README](../README.md)


