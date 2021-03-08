/**
 * Queries does not directly return results
 * it provides entities by events
 *
 * todo [OPEN]:
 *  - provide a opened event which passes all currently existing items (.map(), then .on() and emit only changes)
 *  - ! changes inside elements
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
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
     * listeners
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
