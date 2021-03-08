/**
 * A query is a bound to a collection
 *
 *  CAUTION: Old implementation! Don't use
 *
 * @author: Bernhard Lukassen
 */

export default class Query {

    constructor(app) {
        this.app        = app;
        this._listeners = [];
    }

    static in(app) {
        let query = new this(app);
        return query;
    }

    /*
     * setup and params
     */

    /**
     * use the reference for the query
     * @param ref
     */
    withRef(ref) {

    }

    /**
     * if used within a parent e.g. in a collection
     * @param parent
     */
    withParent(parent) {

    }

    /*
     * querying
     */

    /**
     * sets a selector function which wil
     * @param selectorfn
     */
    select(selectorfn) {
        this.selectorfn = selectorfn;
    }

    /**
     * register a callback when an item is available
     * @param fn
     */
    addMutationListener(fn) {
        this._listeners.push(fn);
    }

    removeMutationListener(fn) {
        this._listeners = this._listeners.filter(listener => listener != fn);
    }

    /*
     * item handling
     */

    connect() {
        // implement by subclass
    }

    /**
     *
     * @param item
     * @param id
     * @param old
     * @return {Promise<void>}
     */
    async received(item, id, old) {
        // impelement by subclass,
    }

}

