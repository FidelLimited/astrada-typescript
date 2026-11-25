/* Hand-written (not generated): sandbox conveniences on top of the generated SandboxSimulationApi.
 * Exported in the `sandbox` namespace (src/sandbox-module.ts). The sandbox-only guard
 * (src/sandbox-guard.ts) applies to every call, as on the generated class.
 */
import { SandboxSimulationApi } from './sandbox/apis/SandboxSimulationApi.js';
import { CardSubscriptionApi, type DeleteCardSubscriptionRequest } from './sandbox/apis/CardSubscriptionApi.js';
import { NetworkBulkFeedsApi, type DeleteNetworkBulkFeedRequest } from './sandbox/apis/NetworkBulkFeedsApi.js';
import { SubaccountsApi, type DeleteSubaccountRequest } from './sandbox/apis/SubaccountsApi.js';
import type {
    SimulateBulkFeedFileGlRequest,
    SimulateBulkFeedFileSmartdataRequest,
    SimulateBulkFeedFileVbdsRequest,
    SimulateBulkFeedFileVcfRequest,
} from './sandbox/models/index.js';
import type { InitOverrideFunction } from './runtime.js';

/** A bulk feed's delivery rail, as in the network bulk feed's `type`. */
export type BulkFeedFileType = 'GL' | 'SMARTDATA' | 'VBDS' | 'VCF';

/** The file simulation for one feed type: `type` picks the simulation, the rest is its body. */
export type SimulateBulkFeedFileParams =
    | ({ type: 'GL' } & SimulateBulkFeedFileGlRequest)
    | ({ type: 'SMARTDATA' } & SimulateBulkFeedFileSmartdataRequest)
    | ({ type: 'VBDS' } & SimulateBulkFeedFileVbdsRequest)
    | ({ type: 'VCF' } & SimulateBulkFeedFileVcfRequest);

/** Every sandbox simulation, plus `simulateBulkFeedFile` and the deletes that clear test data. Sandbox only. */
export class SandboxApi extends SandboxSimulationApi {
    /** The middleware added to this instance (withMiddleware and the like), after the configuration's. */
    private addedMiddleware() {
        return this.middleware.slice(this.configuration.middleware.length);
    }

    /**
     * Deletes a subaccount and everything under it (bank links, card subscriptions, cards,
     * transactions, bulk feeds, webhooks). Irreversible. Answers when the delete is done (204), or 502
     * when a step failed; calling it again after a failure is safe. Never retried by the SDK, as a
     * second call while the first still runs is not, except once after a 401 (the token was refused,
     * so the delete never ran). Waits up to SANDBOX_DELETE_TIMEOUT_MS.
     */
    async deleteSubaccount(params: DeleteSubaccountRequest, initOverrides?: RequestInit | InitOverrideFunction): Promise<void> {
        return new SubaccountsApi(this.configuration).withMiddleware(...this.addedMiddleware()).deleteSubaccount(params, initOverrides);
    }

    /** Deletes a card subscription and what depends on it. Irreversible; as deleteSubaccount. */
    async deleteCardSubscription(params: DeleteCardSubscriptionRequest, initOverrides?: RequestInit | InitOverrideFunction): Promise<void> {
        return new CardSubscriptionApi(this.configuration).withMiddleware(...this.addedMiddleware()).deleteCardSubscription(params, initOverrides);
    }

    /** Deletes a network bulk feed and what it enrolled. Irreversible; as deleteSubaccount. */
    async deleteNetworkBulkFeed(params: DeleteNetworkBulkFeedRequest, initOverrides?: RequestInit | InitOverrideFunction): Promise<void> {
        return new NetworkBulkFeedsApi(this.configuration).withMiddleware(...this.addedMiddleware()).deleteNetworkBulkFeed(params, initOverrides);
    }

    /**
     * Delivers a simulated file (or, for VBDS, a starter-data fetch) for an existing bulk feed, by
     * the feed's type: GL (American Express), SMARTDATA (Mastercard), VBDS or VCF (Visa). Answers
     * when the API accepts it (202); the cards and transactions arrive asynchronously, with their
     * webhooks.
     */
    async simulateBulkFeedFile(params: SimulateBulkFeedFileParams, initOverrides?: RequestInit | InitOverrideFunction): Promise<void> {
        switch (params.type) {
            case 'GL': {
                const { type: _type, ...body } = params;
                return this.simulateBulkFeedFileGl({ simulateBulkFeedFileGlRequest: body }, initOverrides);
            }
            case 'SMARTDATA': {
                const { type: _type, ...body } = params;
                return this.simulateBulkFeedFileSmartdata({ simulateBulkFeedFileSmartdataRequest: body }, initOverrides);
            }
            case 'VBDS': {
                const { type: _type, ...body } = params;
                return this.simulateBulkFeedFileVbds({ simulateBulkFeedFileVbdsRequest: body }, initOverrides);
            }
            case 'VCF': {
                const { type: _type, ...body } = params;
                return this.simulateBulkFeedFileVcf({ simulateBulkFeedFileVcfRequest: body }, initOverrides);
            }
            default:
                throw new RangeError(`Unknown bulk feed type "${String((params as { type?: unknown }).type)}": use GL, SMARTDATA, VBDS or VCF`);
        }
    }
}
