export const DELIMETER = ',';
export const getSearchFromState = (initialValue, filterKeys, filterState) => {
    // preserve all existing params
    const nextParams = new URLSearchParams(initialValue);

    // iterate over available filters
    for (const key of filterKeys) {
        // remove any existing filter values
        nextParams.delete(key);
    }

    // iterate over the latest filter values
    for (const [group, items] of filterState) {
        for (const item of items) {
            const { title, value } = item || {};

            // append the new values
            nextParams.append(
                `${group}[filter]`,
                `${title}${DELIMETER}${value}`
            );
        }
    }

    // prepend `?` to the final string
    return `?${nextParams.toString()}`;
};

export const getStateFromSearch = (initialValue, filterKeys, filterItems) => {
    // preserve all existing params
    const params = new URLSearchParams(initialValue);
    const uniqueKeys = new Set(params.keys());
    const nextState = new Map();

    // iterate over existing param keys
    for (const key of uniqueKeys) {
        // if a key matches a known filter, add its items to the next state
        if (filterKeys.has(key) && key.endsWith('[filter]')) {
            // derive the group by slicing off `[value]`
            const group = key.slice(0, -8);
            const items = new Set();
            const groupItemsByValue = new Map();

            // cache items by value to avoid inefficient lookups
            for (const item of filterItems.get(group)) {
                groupItemsByValue.set(item.value, item);
            }

            // map item values to items
            for (const value of params.getAll(key)) {
                const existingFilter = groupItemsByValue.get(
                    value.split(DELIMETER)[1]
                );

                if (existingFilter) {
                    items.add(existingFilter);
                } else {
                    console.warn(
                        `Existing filter ${value} not found in possible filters`
                    );
                }
            }

            // add items to the next state, keyed by group
            nextState.set(group, items);
        }
    }

    return nextState;
};

/**
 * Looks for filter values within a search string and returns a map like
 * {
 *   "category_id": ["Bottoms,28", "Pants & Shorts,19"]
 * }
 * filter[category_id]=Bottoms,28&filter[category_id]=Pants & Shorts,19
 * @param {String} initialValue a search string, as in from location.search
 */
export const getFiltersFromSearch = initialValue => {
    // preserve all existing params
    const params = new URLSearchParams(initialValue);
    const uniqueKeys = new Set(params.keys());
    const filters = new Map();

    // iterate over existing param keys
    for (const key of uniqueKeys) {
        // if a key matches a known filter, add its items to the next state
        if (key.endsWith('[filter]')) {
            // derive the group by slicing off `[filter]`
            const group = key.slice(0, -8);
            const items = new Set();

            // map item values to items
            for (const value of params.getAll(key)) {
                items.add(value);
            }

            // add items to the next state, keyed by group
            filters.set(group, items);
        }
    }

    return filters;
};

export const stripHtml = html => html.replace(/(<([^>]+)>)/gi, '');
