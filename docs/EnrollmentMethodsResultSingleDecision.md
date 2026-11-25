
# EnrollmentMethodsResultSingleDecision

Whether the subaccount named in `subaccountId` can enroll this card one at a time. Present only when the request names a `subaccountId` and that subaccount's controls could be run for these digits. When they could not (for example, the subaccount could not be read, or, in sandbox, the digits match test cards of more than one card type), `singleDecision` is omitted and the rest of the response is the one given without `subaccountId`.

## Properties

### `allowed`

`boolean`, required

`true` when every single-enrollment control passes for the subaccount and the card's own `singleEligible`, as answered without `subaccountId`, is `true`.

### `reason`

`string`, optional

Why single enrollment is refused. Present only when `allowed` is `false`. A control's refusal is named before `coverage`. Each control's reason stands for the refusal that control gives on `POST /card-subscriptions`, shown in parentheses. `bank-enrollment-required`: the subaccount's `enrollmentPolicy.bankEnrollment` is `amex-visa` and this Visa card is not classified as business (`card_subscription.subaccount_blocking_card_type` with `reasonCode` `card_subscription.bank_enrollment_required`). `card-type`: the subaccount's single-enrollment `blockedCardTypes` holds the card's type (`card_subscription.subaccount_blocking_card_type`). `funding-type`: its `blockedFundingCardTypes` holds the card's funding type (`card_subscription.subaccount_blocking_card_funding_type`). `issuer-country`: `enforceIssuerCountry` is on and the card's issuing country is unknown or not one of the subaccount's single-enrollment countries (`card_subscription.subaccount_blocking_card_country`). `network-rule`: a rule in the subaccount's `networkBlockedCards` matches the card (`card_subscription.network_blocking_card`). `coverage`: every control passes, but the card's own `singleEligible` is `false`, for example for any American Express card.

One of: `bank-enrollment-required`, `card-type`, `funding-type`, `issuer-country`, `network-rule`, `coverage`. A value the SDK does not know yet is passed through as a plain string.

[Back to top](#) · [Back to README](../README.md)


