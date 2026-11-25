
# BankAccountMaintenanceResultJunctionLast4

Present only when `backfillJunctionLast4: true` was sent.

## Properties

### `rowsUpdated`

`number`, required

Links that gained a last 4 in this run.

### `rowsUnresolved`

`number`, required

Links still without one (the directory did not list the card).

### `directoryUnavailable`

`boolean`, required

True when this action's own read of the cards directory failed (the mask pass does not fail on it); call again later.

[Back to top](#) · [Back to README](../../README.md)


