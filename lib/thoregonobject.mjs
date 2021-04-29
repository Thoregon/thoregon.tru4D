/*
 * Copyright (c) 2021.
 */

/*
 *
 * @author: Martin Neitz
 */

export default class ThoregonObject {


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
}
 