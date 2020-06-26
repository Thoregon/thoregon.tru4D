/**
 * helper to build commands easy
 *
 * @author: blukassen
 */

export default class CommandBuilder {

    constructor() {
        this._params    = [];
        this._actions   = [];
    }

    create(name, kind) {
        this._name      = name;
        this._cmd       = kind ||  'create';
        return this;
    }

    name(name) {
        this._name = name;
        return this;
    }

    in(collection) {
        this._collection = collection;
        return this;
    }

    addParam(param) {
        this._params.push(param);
        return this;
    }

    result(resultdef) {
        this._result = resultdef;
        return this;
    }

    withSchema(schema) {
        this._schemaparams = schema;
        return this;
    }

    resultSchema(schema) {
        this._schemaresult = schema;
        return this;
    }

    addAction(action) {
        this._actions.push(action);
        return this;
    }

    build() {

    }
}
