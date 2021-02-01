/**
 * Represents a model to translate between
 * persistence and entity model
 *
 * A storemodel should not be created from the app code
 * Use Commands to create, modify and delete entity models
 *
 * Storage follows the north (model) - south (store) direction
 *
 * A store model connects a view with a (entity) model, where
 * - north side  ... model
 * - south side  ... store
 * - inner       ... transform
 *
 * Create:
 * - New entity model first time store
 * - From store create local entity model
 *
 * Modifications:
 * - modifications from the store will be propagated immediately
 * - modifications on the entity model will be propagated at an action
 * - there can be properties which will be stored immediately when modified
 *
 * todo [OPEN]: collaboration features
 *  - same entity is edited by multiple participants at the same time
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class StoreModel {

    constructor({
        model,
        store,
        transformer
                } = {}) {
        Object.assign(this, { model, store, transformer });
    }

    static toSouth(model) {
        // get verifier
        let verify = this.verifier;
        if (verify) verify(model)
        let smodel = model;
        // get transformer
        let transformer = this.transformer;
        if (transformer) smodel = transformer(model);
        // get store
        // create storemodel
        // propagate to store
    }

    static toNorth(store) {
        // get transformer
        // get model instancce
        // create storemodel
        // propagate to model
    }

    /**
     * this properties will be stored immediately when they are modified
     * @return {Array<String>}  array with property names
     */
    get immedProperties() {
        return [];
    }

    get model() {
        return this.north;
    }

    set model(model) {
        this.north = model;
    }

    get store() {
        return this.south;
    }

    set store(store) {
        this.south = store;
    }

    get transform() {
        return this.inner;
    }

    set transform(transformer) {
        this.inner = transformer;
    }
}
