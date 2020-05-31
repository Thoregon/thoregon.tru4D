/**
 * A query is a bound to a collection
 *
 *
 * @author: Bernhard Lukassen
 */

export default class Query {

    constructor(collection) {
        this.collection = collection;
    }
    /*
     * querying
     */

    select(selectorfn) {
        this.selectorfn = selectorfn;
    }

    /**
     * does the selection have elements
     */
    has() {

    }

    /**
     * get the first element
     */
    first() {

    }

    last() {

    }

    forEach(fn, reftype) {

    }

    /**
     * works on the value items of the collection
     * @param fn
     */
    map(fn) {

    }

    reduce(fn, initval) {

    }

    drop() {

    }
}

