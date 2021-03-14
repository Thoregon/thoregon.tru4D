/**
 * Queries does not directly return results
 * it provides entities by events
 *
 * When subclassing do initializations as late as they can be.
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

import IQuery from "./interfaces/iquery.mjs";

export default class Query extends IQuery() {

    constructor(app) {
        super();
        this.app        = app;
    }

    static in(app) {
        let query = new this(app);
        return query;
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
