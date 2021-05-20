/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import QueryResolver     from "./queryresolver.mjs";

export default class QueryResolverMckup extends QueryResolver {

    constructor(collection, schema) {
        super();
        this._items  = {};
        this._schema = schema;
        collection.forEach(item => {
            this._items[universe.random(32)] = item;
        });
    }

    determineSchema(modification) {
        // todo [OPEN]: first get the meta information to decide which schema

        // if not found use the specified schema as default
        if (this._schema) modification.schema = this._schema;
    }

    isObserved() {
        this.dispatchAll();
    }

    notObserved() {
    }

    dispatchAll() {
        Object.entries(this._items).forEach(([id, content]) => {
            this.emit({ id, content })
        });
    }
}
