/**
 * Interface to extend classes with Query functions
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import { forEach } from "/evolux.util";

export default (base) => class IQuery extends (base || Object) {

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

    /**
     * use the reference for the query
     * @param ref
     */
    static withRef(ref, { on, current }) {

    }

    /**
     * if used within a parent e.g. in a collection
     * @param parent
     */
    static withParent(parent) {
        let query    = new this();
        query.parent = parent;
        return query;
    }

    /*
     * initializers
     */

    /**
     * will be called just once with the existing items
     * as Array
     * @param fn
     */
    addCurrentItemsHandler(fn) {
        this.currentItemsListener = fn;
        this.currentItemsListenerRegistered();
    }

    async propagateCurrentItems() {
        if (!this.currentItemsListener) return;
        await this.currentItemsListener(this._currentItems);
/*
        await forEach(Object.entries(this._currentItems), async ([id, item]) => {
            await forEach(this._listeners, async (fn) => await fn({ type: 'new', item, id }));
        });
*/
    }

    async itemAdded(id, item) {
        if (!this._listeners) return;
        await forEach(this._listeners, async (fn) => await fn({ type: 'new', item, id }));
    }

    /**
     * this is to enable lazy init
     */
    currentItemsListenerRegistered() {
        // react if necessary
    }

    /*
     * listeners
     */

    /**
     * will be called for every mutation
     *  - item added
     *  - item modified
     *  - item removed
     *
     *  items which already
     * @param fn
     */
    addMutationListener(fn) {
        let n = this._listeners.length;
        this._listeners.push(fn);
        if (n === 0) this.firstMutationListenerAdded();
    }

    /**
     * this is to enable lazy init
     */
    firstMutationListenerAdded() {
        // react if necessary
    }
    /**
     * just remove the listeners
     * @param fn
     */
    removeMutationListener(fn) {
        this._listeners = this._listeners.filter(listener => listener != fn);
    }


}
