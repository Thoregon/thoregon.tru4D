/**
 * specialized query for universe matter
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import QueryResolver from "./queryresolver.mjs";

export default class MatterResolver extends QueryResolver {

    constructor(path, schema) {
        super();
        this._path   = path;
        this._schema = schema;
    }

    determineSchema(modification) {
        // todo [OPEN]: first get the meta information to decide which schema

        // if not found use the specified schema as default
        if (this._schema) modification.schema = this._schema;
    }

    isObserved() {
        if (this._node) return;
        this._node = universe.matter.path(this._path);
        this._node.on((value, key) => this.emit({ id: key, content: value }));
    }

    notObserved() {
        this._node.off();
        delete this._node;
    }
}
