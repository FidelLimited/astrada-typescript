
# EnrollmentLinkSessionOutcome

What the hosted page reported when the session completed. A session completes something
when it reports at least one id.

The ids are as the page sent them: nothing checks them against the card or bank APIs.
The `cardsubscription` webhooks are the source of truth for what was enrolled. When the
link has a `customerReferenceId`, the card subscriptions created through it carry that
reference.


## Properties

### `subscriptionIds`

`Array<string>`, optional

Card subscriptions the page reports it created.

### `cardIds`

`Array<string>`, optional

Cards the page reports it enrolled.

### `bankLinkIds`

`Array<string>`, optional

Bank links the page reports it completed.

### `summary`

`{ [key: string]: number; }`, optional

Up to 10 counts the page reports. Each name is 1 to 40 letters and digits and starts
with a letter.


[Back to top](#) · [Back to README](../README.md)


