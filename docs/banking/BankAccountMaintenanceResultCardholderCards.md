
# BankAccountMaintenanceResultCardholderCards

Present only when `createCardholderCards: true` was sent. Counts only; no cardholder name is ever returned.


## Properties

### `enabled`

`boolean`, required

False when card creation is not switched on for the subaccount; nothing was created.

### `routeEnabled`

`boolean`, required

True when each cardholder's transactions are emitted on their own card.

### `accounts`

`number`, required

Pooled American Express billing accounts served.

### `suffixesSeen`

`number`, required

Distinct cardholders (by the card's last 4) seen in those accounts' transactions.

### `created`

`number`, required

Cardholder cards created in this run.

### `linkedEnrolled`

`number`, required

Cards the cardholder had already enrolled, linked instead of creating one.

### `named`

`number`, required

Cards whose cardholder name was written in this run.

### `relinked`

`number`, required

Cardholder cards found on another bank account of the subaccount after a re-link, left where they are and counted (the background re-home moves them).

### `failed`

`number`, required

Cards that could not be created this run; the next run tries again.

### `skipped`

`{ [key: string]: number; }`, required

Reason -> count of cardholders given no card of their own (their transactions stay on the account's main card). Reasons: `no_primary`, `ambiguous_primary`, `bulk_owned`, `ambiguous_enrolled`, and the permanent `deactivated`, `not_active`, `unlinked` and `foreign_reuse`. Only reasons with a count appear.


### `directoryUnavailable`

`boolean`, required

True when this action's own read of the cards directory failed; no card was created this run.

[Back to top](#) · [Back to README](../../README.md)


