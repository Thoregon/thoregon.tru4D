import ThoregonDecorator from "./thoregondecorator.mjs";

/**
 * Interface to extend classes with Query functions
 *
 * how a query works
 * - new query
 *      - instantiate query
 *      - provide query node (starting point in DB)
 *          - may be a derived index (see commands maintaining multiple indexes)
 *      - provide schema if content is unspecified or uniform
 *      - provide query params
 *          - filter via index or in memory
 *      - provide sort params or compare fn
 *          - via index or in memory
 * - register for (list) modifications
 *      - item added
 *      - item removed
 *      ! item modified directly triggers the item listener, not the query listener
 *
 *  - modify query
 *      - change one or more params
 *      - cleanup list
 *      - modification handler works as before
 *
 *  - the query maintains a current item list
 *      - reset when filter changes
 *      - count (length) is available, refresh on change events
 *
 *
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

const matches = (item, sample) => {
    for (let [prop, val] of Object.entries(sample)) {
        if (item[prop] !== val) return false;
    }
    return true;
}

export default class Query {

    constructor() {
        this._filter = (item) => true;
        this._sort   = (item1, item2) => -1;    // always at last
        this._items  = new Map();
    }

    static at(resolver) {
        let query = new this();
        query.resolver = resolver;
        return query;
    }

    get length() {
        return this._items.size;
    }

    /**
     * must be called to be used
     */
    open() {
        this.resolver.resolve(this);
        this.resolver.on((modification) => this.dispatch(modification));
    }

    close() {
        this.resolver.off();
    }

    filter(filterfn) {
        this._filter = filterfn;
        return this;
    }

    sort(sortfn) {
        this._sort = sortfn;
        return this;
    }

    /**
     * callback for changes in the list
     *
     * @param cbfn
     */
    on(listener) {
        this._listener = listener;
        this.dispatchAll();
    }

    off() {
        delete this._listener;
    }

    //
    //
    //

    dispatch(modification) {
        let id      = modification.id;
        let item    = modification.content;
        let schema  = modification.schema;
        if (this._items.has(id)) {
            if (content == undefined) {
                // item was removed
                let event = { type: 'remove', id, oldItem: this._items.get(id) };
                if (this._listener) this._listener(event);
            } else {
                // item was replaced
                let oldItem = this._items.get(id);
                this._items.set(id, item);
                let event = { type: 'replace', id, item, oldItem };
                if (this._listener) this._listener(event);
            }
        } else {
            // item added
            // get schema, create instance
            let oitem = ThoregonDecorator.observe(item, schema);
            this._items.set(id, oitem);
            let event = { type: 'add', id, item: oitem };
            if (this._listener) this._listener(event);
        }
    }

    dispatchAll() {
        [...this._items.entries()].forEach(([id, item]) => {
            let event = { type: 'add', id, item }
            if (this._listener) this._listener(event);
        });
    }

    //
    //
    //

    // todo [REFACTOR]: use indexes (btree) for larger collections
    find(ref) {
        for (let item of this._items.values()) {
            if (matches(item, ref)) return item;
        }
    }
}

/*
class IQueryOld {
    constructor() {
        super();
        this._listeners    = [];
        this._currentItems = {};
    }

    static with({ on, current }) {
        let query    = new this();
        this.on      = on;
        this.current = current;
        return query;
    }

    get length() {
        return Object.keys(this._currentItems).length;
    }

    /!**
     * use the reference for the query
     * @param ref
     *!/
    static withRef(ref, { on, current }) {

    }

    /!**
     * if used within a parent e.g. in a collection
     * @param parent
     *!/
    static withParent(parent) {
        let query    = new this();
        query.parent = parent;
        return query;
    }

    /!*
     * initializers
     *!/

    /!**
     * will be called just once with the existing items
     * as Array
     * @param fn
     *!/
    addCurrentItemsHandler(fn) {
        this.currentItemsListener = fn;
        this.currentItemsListenerRegistered();
    }

    async propagateCurrentItems() {
        if (!this.currentItemsListener) return;
        await this.currentItemsListener(this._currentItems);
/!*
        await forEach(Object.entries(this._currentItems), async ([id, item]) => {
            await forEach(this._listeners, async (fn) => await fn({ type: 'new', item, id }));
        });
*!/
    }

    async itemAdded(id, item) {
        if (!this._listeners) return;
        await forEach(this._listeners, async (fn) => await fn({ type: 'new', item, id }));
    }

    /!**
     * this is to enable lazy init
     *!/
    currentItemsListenerRegistered() {
        // react if necessary
    }

    /!*
     * listeners
     *!/

    /!**
     * will be called for every mutation
     *  - item added
     *  - item modified
     *  - item removed
     *
     *  items which already
     * @param fn
     *!/
    addMutationListener(fn) {
        let n = this._listeners.length;
        this._listeners.push(fn);
        if (n === 0) this.firstMutationListenerAdded();
    }

    /!**
     * this is to enable lazy init
     *!/
    firstMutationListenerAdded() {
        // react if necessary
    }
    /!**
     * just remove the listeners
     * @param fn
     *!/
    removeMutationListener(fn) {
        this._listeners = this._listeners.filter(listener => listener != fn);
    }

}
*/


/****************************************
 * old version:
 * ------------
 * how a query works
 * - new query
 *      - instantiate query
 *      - provide query node (starting point in DB)
 *          - may be a derived index (see commands maintaining multiple indexes)
 *      - provide schema if content is unspecified or uniform
 *      - provide query params
 *          - filter via index or in memory
 *      - provide sort params or compare fn
 *          - via index or in memory
 * - register for current items
 *      - callback when current items are available
 * - register for modifications
 *      - item added
 *      - item modified
 *      - item removed
 *
 *  - modify query
 *      - change one or more params
 *  - current items handler will be called again
 *  - modification handler works as before
 */
