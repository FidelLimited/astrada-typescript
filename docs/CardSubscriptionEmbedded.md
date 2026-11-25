
# CardSubscriptionEmbedded

Related resources inlined on request with the `expand` query parameter (`?expand=card,cardholder`). A key is
present only when it was requested and the related resource exists; each embedded body is identical to the one
served by the resource's own endpoint. Absent entirely when `expand` is not sent.


## Properties

### `card`

[Card](Card.md), optional

### `cardholder`

[Cardholder](Cardholder.md), optional

[Back to top](#) · [Back to README](../README.md)


