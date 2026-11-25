
# TeamLink

## Properties

### `id`

`string`, required

The link's identifier.

### `url`

`string`, required

The link to share. Its secret follows `#`, and only this response returns it.

### `expiresAt`

`Date`, required

After this time no session starts from the link.

### `maxUses`

`number`, required

The session starts the link allows.

## Example

As sent by the API (the SDK turns date-time strings into `Date`, except a transaction message's `dateTime`, which becomes a `TransactionDateTime`):

```json
{
  "id": "8e2f4a6c-1b3d-4e5f-9a7b-2c4d6e8f0a1b",
  "url": "https://sdk.sandbox.astrada.co/unified/v2/enroll.html#el1_Qm9Lx2Vt8RkZ1pW4nJ7cH0sD3fG6aY9uE2iO5rT8bN1",
  "expiresAt": "2026-11-19T10:00:00.000Z",
  "maxUses": 50
}
```

[Back to top](#) · [Back to README](../README.md)


