
# NetworkBulkEnrollmentCreateParamsConsent

The card admin's approval for the company and Astrada to start bulk enrollment with the bank, including contacting the bank on the company's behalf.

## Properties

### `accepted`

`boolean`, required

Must be `true`. The request is rejected with a 400 otherwise.

### `version`

`string`, required

Your own id for the consent wording that was accepted, for example `kickoff-consent-v2`. Stored as an opaque string.

[Back to top](#) · [Back to README](../README.md)


