/**
 * Queries does not directly return results
 * it provides entities by events
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Query {

    constructor(props) {
        this._listeners = [];
    }

    addMutationListener(fn) {
        this._listeners.push(fn);
    }
}
