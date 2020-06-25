/**
 * helper to build commands easy
 *
 * @author: blukassen
 */

export default class CommandBuilder {

    create(name, kind) {
        this._name      = name;
        this._cmd       = kind ||  'create';
        this._params    = [];
        this._actions   = [];
        return this;
    }

    in(collection) {
        this._collection = collection;
        return this;
    }

    addParam(param) {
        this._params.push(param);
    }

    result(resultdef) {
        this._result = resultdef;
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
    }

    build() {

    }
}
