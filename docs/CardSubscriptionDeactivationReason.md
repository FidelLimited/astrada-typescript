
# CardSubscriptionDeactivationReason

Why a card subscription was deactivated, as given by the customer in the deactivation request.

- `card_lost`: the cardholder lost the card.
- `card_stolen`: the card was stolen.
- `card_replaced`: the card was reissued or replaced with a new card number.
- `card_closed`: the issuer or bank closed the card or its account.
- `cardholder_offboarded`: the cardholder no longer works for the business.
- `organization_offboarded`: the business no longer uses your platform.
- `suspected_fraud`: the card is suspected of fraudulent use.
- `duplicate_enrollment`: the card was enrolled more than once.
- `no_longer_needed`: the card no longer needs to share data.
- `other`: any other reason.

New values may be added later. Handle a value you don't recognize as `other`.


One of: `card_lost`, `card_stolen`, `card_replaced`, `card_closed`, `cardholder_offboarded`, `organization_offboarded`, `suspected_fraud`, `duplicate_enrollment`, `no_longer_needed`, `other`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


