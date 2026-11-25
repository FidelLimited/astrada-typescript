
# CardSubscriptionLinks

## Properties

### `self`

[Link](Link.md), required

### `card`

[Link](Link.md), required

### `verifications`

[Link](Link.md), optional

The link to this card's 3-D Secure verifications (`/card-verifications/3ds?cardId=`). Useful when a subscription is stuck at `reqSCA` to inspect why verification failed.


### `networkBulkFeed`

[Link](Link.md), optional

The link to the network bulk feed associated with this card subscription, if applicable. This link may be present when the `enrollmentType` is `network-bulk`. It will not be present for subscriptions created through the `cardholder-single` flow.


### `bankAccount`

[Link](Link.md), optional

The link to the bank account this subscription's card was materialized from (`/bank-accounts/{bankAccountId}`). Present only when the `enrollmentType` is `bank-feed`; the bank-connected analog of `networkBulkFeed`. Not present for `cardholder-single` or `network-bulk` subscriptions.


[Back to top](#) · [Back to README](../README.md)


