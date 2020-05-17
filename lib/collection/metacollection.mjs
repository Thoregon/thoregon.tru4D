/**
 * Meta information for a collection
 *
 * @author: Bernhard Lukassen
 */

export default class MetaCollection {

    constructor({
                    name,
                    schema,
                    scope
                } = {}) {
        Object.assign(this, { name, schema, scope });
    }

    /**
     * merge with another collection definition.
     *
     * Note: name and scope can't be merged!
     *
     * @param schema
     */
    merge( {
               schema,
           } = {}) {
        if (this.schema) {
            if (Array.isArray(this.schema))
            this.schema = (Array.isArray(this.schema))
                            ? [...this.schema, schema]
                            : [this.schema, schema];
        }
    }
}
