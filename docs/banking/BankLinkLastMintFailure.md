
# BankLinkLastMintFailure

Present once a completion attempt was aborted because card creation (the `bank-feed` mint) failed for one or more discovered credit accounts. The link stays pending and completion is retried; a later successful completion clears this field (an expired link keeps its last failure). `transient` failures resolve on retry; a `permanent` one keeps aborting until investigated.


## Properties

### `at`

`Date`, optional

When the failed completion attempt happened, in UTC, following ISO 8601 format.

### `kind`

`string`, optional

Whether the underlying failure is expected to clear on retry.

One of: `permanent`, `transient`. A value the SDK does not know yet is passed through as a plain string.

### `failedAccountCount`

`number`, optional

How many discovered credit accounts failed to mint on the attempt.

[Back to top](#) · [Back to README](../../README.md)


