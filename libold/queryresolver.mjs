/**
 * a resolver interfaces to the persitent storage
 * only for one query, it can't be reused
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class QueryResolver {

    /**
     * called from the query
     * the resolver may retrieve information from the query
     * @param query
     */
    resolve(query) {
        this._query = query;
    }

    /**
     * add a listener for all items of the query result
     * reactive, reports every change in the collection
     * reports item added, item removed
     */
    on(listener) {
        if (!listener) return;
        let nolistener = !this._listener;
        this._listener = listener
        if (nolistener) this.isObserved();
    }

    /**
     * remove a listener from collection events
     * @param listener
     */
    off(listener) {
        delete this._listener;
        this.notObserved();
    }

    /**
     *
     * @param {{ id, content }} modification
     */

    emit(modification) {
        if (!this._listener) return;
        try {
            let schema = this.determineSchema(modification);
            this._listener(modification);
        } catch (e) {
            console.log('error in listener', e);
        }
    }

    //
    // implement by subclass
    //
    /**
     * add the schema or a generic definition to the modification
     * @param modification
     */
    determineSchema(modification) {
        // implement by subclass
    }

    /**
     * invoked when the first listener observes the query
     */
    isObserved() {
        // implement by subclass
    }

    /**
     * invoked when no more listeners observe the query
     */
    notObserved() {
        // implement by subclass
    }

}
