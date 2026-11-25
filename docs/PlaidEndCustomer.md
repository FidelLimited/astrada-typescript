
# PlaidEndCustomer

Admin-managed policy controlling whether an account's bank links are created under the
account's own Plaid reseller End-Customer (EC) client instead of the shared legacy client.
Fields are optional and nullable; absent fields leave the current value unchanged, explicit
`null` clears a field.


## Properties

### `enabled`

`boolean`, optional, can be `null`

Master gate for routing this account's bank links through its own Plaid reseller
End-Customer client. Absent / `null` / `false` → disabled (legacy shared client).

Admin-set, account-level. When `true`, the account's bank links are created under the
account's own Plaid reseller End-Customer client; once that client is provisioned and
Plaid's registration with the relevant institutions has completed, the hosted Link
experience carries the account's own branding (display name and Link customization)
rather than Astrada's. Enabling an account whose End-Customer client is not yet
provisioned fails link creation rather than silently falling back to the shared client.

Resolution is passthrough from the account onto the effective subaccount read: this
object is account-level only in v1 (there is no subaccount-level override) and
subaccount GETs return the account's stored value as their **effective** value.


[Back to top](#) · [Back to README](../README.md)


