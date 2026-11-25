
# EnrollmentLinkCreatedBy

## Properties

### `via`

`string`, required

- `api`: `POST /enrollment-links` with `subaccounts:write`.
- `staff`: `POST /enrollment-links` with Astrada's `accounts:write`.
- `sdk`: `POST /subaccounts/{subaccountId}/team-link`, the route for the SDK's
  "Invite your team" ending.


One of: `api`, `sdk`, `staff`. A value the SDK does not know yet is passed through as a plain string.

### `clientId`

`string`, optional

The client ID of the credential that created the link, when known.

[Back to top](#) · [Back to README](../README.md)


