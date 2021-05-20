/**
 * decorate any object used in universe
 *
 * @author: Martin Neitz, Bernhard Lukassen
 */


import AccessObserver from "/evolux.universe/lib/accessobserver.mjs";

const decorator = {
    objectSchema(obj, receiver, observer, prop) {

    }
}

export default class ThoregonDecorator extends AccessObserver {

    constructor(schema, target, parent) {
        super(target, parent);
        this.schema = schema;
    }

    static observe(target, schema, parent) {
        return super.observe(target, parent, schema);
    }

    initialDecorator() {
        return  Object.assign(super.initialDecorator(), decorator);
    }

    initDefaults(properties) {
        Object.entries(this.schema.attributes).forEach(([attribute, def]) =>{
                if ( properties[attribute] ) {
                    this[attribute] = properties[attribute];
                } else if ( def.hasOwnProperty("default") ) {
                    this[attribute] = def.default;
                } else {
                    this[attribute] = undefined;
                }
            }
        );
    }
}
