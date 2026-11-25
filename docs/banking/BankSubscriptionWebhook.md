
# BankSubscriptionWebhook

Webhook configuration for this subscription.

## Properties

### `url`

`string`, required, can be `null`

The URL where webhook events will be delivered.

### `status`

`string`, required

The current status of the webhook configuration.
- `pending`: The webhook URL has been set but not yet confirmed by the provider.
- `confirmed`: The provider has acknowledged the webhook URL.
- `none`: No webhook URL has been configured.


One of: `pending`, `confirmed`, `none`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../../README.md)


