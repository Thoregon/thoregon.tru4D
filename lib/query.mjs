/**
 * Queries does not directly return results
 * it provides entities by events
 *
 * wrap (business) objects created from DB with a decorator
 * the decorator keeps information for the command where (how)
 * to modify the (business) object
 *
 * when subclassing do initializations as late as they can be.
 * Be as lazy as possible -> https://en.wikipedia.org/wiki/Sloth
 *
 * todo [OPEN]:
 *  - provide a opened event which passes all currently existing items (.map(), then .on() and emit only changes)
 *  - ! changes inside elements
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import IQuery         from "./interfaces/iquery.mjs";
import ThoregonObject from "./thoregonobject.mjs";

export default class Query extends IQuery(ThoregonObject) {

    constructor(app) {
        super();
        this.app        = app;
    }

    static in(app) {
        let query = new this(app);
        return query;
    }

    /**
     * get the root for the query
     */
    root() {
        // implement by subclass
    }

    /*
     * item handling
     */

    /**
     * init query to access persistent storage
     */
    connect() {
        // get the root
    }

    /**
     * return a definition with the object, either a new one or an updated
     * modifications should able to be sent as events
     *
     * @param item
     * @param id
     * @param old
     * @return {Promise<{ kind, obj, modifications }>}
     */
    async received(item, id, old) {
        // implement by subclass,
    }

}
