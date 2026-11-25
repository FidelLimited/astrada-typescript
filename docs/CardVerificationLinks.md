
# CardVerificationLinks

## Properties

### `self`

[Link](Link.md), required

The link to this verification resource.

### `steps`

[Link](Link.md), required

The link to this verification's steps (`/card-verifications/3ds/{verificationId}/steps`).

### `currentStep`

[Link](Link.md), optional

The link to the step the client should execute next. Absent once the
verification reaches a terminal `state` (`completed` or `failed`).


[Back to top](#) · [Back to README](../README.md)


