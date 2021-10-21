/**
 *
 *
 * @author: Bernhard Lukassen
 */

const REF = Symbol.for('REF');
let item = { a: 'A', b: 'B' };
let node = { node: 'Node' };
Object.defineProperty(item, REF, { value: node,  configurable: false, enumerable: false, writable: false })

Object.entries(item).forEach(([key, val]) => console.log(`Key '${key}', Val '${val}'`))

console.log(Object.assign({}, item));

/*

import path from 'path';
const makeapi       = (path) => path.startsWith('/') ? path : `/${path}`;

console.log(makeapi(path.join('thatsme.api/', 'sidrequest')));


import { CreateCommand } from "/thoregon.tru4D";

class Test {

    constructor({
        id,
        name
    } = {}) {
        Object.assign(this, { id, name });
    }

}

class CreateTest extends CreateCommand {

}
*/



// ************************************************************************************************************

/*
(async () => {
    try {
        const cc = new CreateCommand();
        await cc.commit();
    } catch (e) {
        console.error(e.trace());
    }
})();
*/
