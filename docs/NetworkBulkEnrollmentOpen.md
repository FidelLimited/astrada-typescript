
# NetworkBulkEnrollmentOpen

Whether the card program has an open kickoff, the answer of
`GET /network-bulk-enrollments/open`. When it has none, the body is `{ "open": false }`
and nothing else. When it has one, the body carries only that kickoff's `enrollmentId`,
`state` and `requestedAt`: no names, emails, bank contact, `binInfo`, consent or outreach,
as the kickoff may have been sent by someone else.


## Properties

### `open`

`boolean`, required

Whether the program has an open kickoff, by the same rule `POST /network-bulk-enrollments` uses.

### `enrollmentId`

`string`, optional

The open kickoff's identifier, the `id` that `POST /network-bulk-enrollments` answers
with when it finds the same kickoff. Present only when `open` is `true`.


### `state`

`string`, optional

The open kickoff's state. `requested`: it was created less than 90 days ago and no feed
is registered yet. `feed-created`: its feed is registered and live. Present only when
`open` is `true`.


One of: `requested`, `feed-created`. A value the SDK does not know yet is passed through as a plain string.

### `requestedAt`

`Date`, optional

When the open kickoff was created, in UTC, following ISO 8601 format. Present only when
`open` is `true`.


## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "open": false
}
```

[Back to top](#) · [Back to README](../README.md)


