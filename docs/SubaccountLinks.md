
# SubaccountLinks

## Properties

### `self`

[Link](Link.md), required

### `team-link`

[Link](Link.md), optional

Only on `GET /subaccounts/{subaccountId}`: `POST /subaccounts/{subaccountId}/team-link`,
which creates a team link for the subaccount, the "Invite your team" action. Present
when enrollment links are enabled for the account, the token holds
`card-subscriptions:write` or `subaccounts:write`, and the subaccount's card
enrollment is on (its `enrollmentPolicy.cardEnrollment` is not `false`). Never
offered to an enrollment link session's token. If the check cannot be made, the link
is left out and the read still succeeds.


[Back to top](#) · [Back to README](../README.md)


