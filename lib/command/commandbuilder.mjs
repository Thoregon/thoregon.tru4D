/**
 * helper to build commands easy
 *
 * @author: blukassen
 */

export default class CommandBuilder {

    create(name) {
        this._name = name;
        this._cmd = 'create';
        return this;
    }

    in(collection) {
        this._collection = collection;
        return this;
    }

    with(proerties) {
        this._properties = proerties;
        return this;
    }

    build() {

    }
}
