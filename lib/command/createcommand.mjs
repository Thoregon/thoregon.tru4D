/**
 * Create Command applies a unique 'id' on commit.
 * The id can also be passed at creation, but be careful
 * it has to be unique in the whole universe.
 *
 * Don't apply a unique id at 'commit'. The id should be
 * applied by the persistence layer when transaction successful.
 *
 * @author: Bernhard Lukassen
 */

import Command                  from "./command.mjs";

export default class CreateCommand extends Command {

    /**
     * just mark as new,
     * don't add a unique id, this must be supplied by the persistence layer
     */
    async commit() {
        if (!this._isNew) this._isNew = true;
        return await super.commit();
    }

    async createdID() {
        let resultnode  = this.results();
        let results     = await resultnode.full;
        if (results) {
            let create = Object.keys(results).filter(prop => prop.toLowerCase().startsWith('create'));
            if (create.length > 0) return results[create[0]].id;
        }
    }

    /*
     * implement by subclasses
     */

    get mold() {
        return 'create';
    }

    /**
     * answer a constructor if neccessary.
     * if undefined just plane javascript objects will be built.
     *
     * @return {class} constructor or null
     */
    constructs() {
        return null;
    }

}
