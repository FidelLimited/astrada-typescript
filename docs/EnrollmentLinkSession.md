
# EnrollmentLinkSession

A session started from an enrollment link, as the hosted page ran it.

## Properties

### `id`

`string`, required

The session's identifier.

### `state`

`string`, required

- `open`: started and not yet completed.
- `completed`: the page reported the session's outcome.
- `expired`: an open session past `expiresAt`. It can no longer complete.


One of: `open`, `completed`, `expired`. A value the SDK does not know yet is passed through as a plain string.

### `startedAt`

`Date`, required

### `expiresAt`

`Date`, required

60 minutes after `startedAt`.

### `completedAt`

`Date`, optional

### `outcome`

[EnrollmentLinkSessionOutcome](EnrollmentLinkSessionOutcome.md), optional

[Back to top](#) · [Back to README](../README.md)


