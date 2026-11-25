
# SubaccountUpdateParams

## Properties

### `configurations`

[CreateSubaccountConfigurations](CreateSubaccountConfigurations.md), optional

### `name`

`string`, optional

### `verificationPolicy`

[VerificationPolicy](VerificationPolicy.md), optional

Set or clear fields of the subaccount's card verification policy. Fields you send
replace those fields and fields you leave out keep their value; the policy as a
whole cannot be sent as `null`. Customers may set any
level above LOW (MEDIUM, HIGH, HIGHEST), send a null level to clear the
override, toggle the `sandbox` test flag, and set `failedAttemptLockout`.
LOW is internal-only and is rejected on this endpoint.


### `enrollmentPolicy`

[CustomerEnrollmentPolicy](CustomerEnrollmentPolicy.md), optional

[Back to top](#) · [Back to README](../README.md)


