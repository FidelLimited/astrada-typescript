/* Hand-written (not generated): iterate over every item of a list endpoint.
 *
 * Astrada list endpoints come in two shapes, both handled here:
 * - Main API: `{ _embedded: { <items>: [...] }, _links: { next?: { href } } }`. The `next` link
 *   carries the next page's query (`cursor=...` on cursor lists, `offset=...` on offset lists).
 * - Banking API: `{ items: [...], pagination: { cursor?, hasMore } }`.
 */

export type EmbeddedItems<E> = { [K in keyof E]: E[K] extends ReadonlyArray<infer T> | undefined ? T : never }[keyof E];

/** The item type of a list response. */
export type PageItem<R> =
    R extends { items: ReadonlyArray<infer T> } ? T
    : R extends { _embedded?: infer E } ? EmbeddedItems<NonNullable<E>>
    : never;

/** Query parameters that move between pages. Other parameters are sent unchanged on every page. */
export interface PageParams {
    cursor?: string;
    offset?: number;
    limit?: number;
}

export interface PaginateOptions {
    /** Stop after this many items in total. */
    maxItems?: number;
}

function nextFromLink(href: string): Partial<PageParams> | undefined {
    const query = new URL(href, 'https://placeholder.invalid').searchParams;
    const next: Partial<PageParams> = {};
    const cursor = query.get('cursor');
    const offset = query.get('offset');
    if (cursor !== null) next.cursor = cursor;
    if (offset !== null && Number.isFinite(Number(offset))) next.offset = Number(offset);
    return Object.keys(next).length ? next : undefined;
}

function readPage(page: any): { items: unknown[]; next?: Partial<PageParams> } {
    if (page && Array.isArray(page.items)) {
        const pagination = page.pagination;
        const next = pagination && pagination.hasMore && pagination.cursor ? { cursor: String(pagination.cursor) } : undefined;
        return { items: page.items, next };
    }
    const embedded = page?._embedded;
    const items = embedded && typeof embedded === 'object'
        ? (Object.values(embedded).find(Array.isArray) as unknown[] | undefined) ?? []
        : [];
    const href = page?._links?.next?.href;
    return { items, next: typeof href === 'string' ? nextFromLink(href) : undefined };
}

/**
 * Calls a list method page by page and yields each item.
 *
 * ```ts
 * for await (const subaccount of paginate((p) => subaccounts.listSubaccounts(p), { limit: 100 })) {
 *   console.log(subaccount.id);
 * }
 * ```
 *
 * @param list a list method, called with `params` plus the next page's `cursor` or `offset`
 * @param params the first page's parameters (filters and `limit`); string literals keep their
 *   literal type, so enum filters such as `state: 'failed'` type-check
 */
export async function* paginate<const P extends object, R>(
    list: (params: P) => Promise<R>,
    params: P = {} as P,
    options: PaginateOptions = {},
): AsyncGenerator<PageItem<R>, void, undefined> {
    let current: P = { ...params };
    let yielded = 0;
    const seen = new Set<string>();
    for (;;) {
        const { items, next } = readPage(await list(current));
        for (const item of items) {
            if (options.maxItems !== undefined && yielded >= options.maxItems) {
                return;
            }
            yielded++;
            yield item as PageItem<R>;
        }
        // An empty page with a next cursor is not the end (a filter can empty a page). An empty
        // offset page is: the offset is past the last item.
        if (!next || (items.length === 0 && next.cursor === undefined)) {
            return;
        }
        // Guard against a server that keeps answering with the same next page.
        const key = JSON.stringify(next);
        if (seen.has(key)) {
            return;
        }
        seen.add(key);
        current = { ...current, ...next };
    }
}

/** Collects every item of a list endpoint into an array. See `paginate`. */
export async function listAll<const P extends object, R>(
    list: (params: P) => Promise<R>,
    params: P = {} as P,
    options: PaginateOptions = {},
): Promise<Array<PageItem<R>>> {
    const all: Array<PageItem<R>> = [];
    for await (const item of paginate(list, params, options)) {
        all.push(item);
    }
    return all;
}
