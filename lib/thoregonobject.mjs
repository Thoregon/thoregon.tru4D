/*
 * Copyright (c) 2021.
 */

/*
 *
 * @author: Martin Neitz, Bernhard Lukassen
 */


class Observer {

    constructor( properties ) {
        Object.entries(this.constructor.objectSchema().attributes).forEach(([attribute, def]) =>{
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

    static objectSchema() {
        if (this.objectschema) return this.objectschema;
        this.objectschema = {
        };
        return this.objectschema;
    }

    static objectSchemaMeta() {
        return  {
            '@created': {
                get: () => Date.now()
            },
            '@changed': '',
            '@context': '',
        };
    }
}

export default (base) => class ThoregonObject extends (base || Object) {
}
