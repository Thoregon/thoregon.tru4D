/**
 * Creates an Entity
 *
 * Uses the Matter API to persist the entity in a collection or a map
 *
 * @author: Bernhard Lukassen
 */

import Action           from "./action.mjs";

export default class ModifyAction extends Action {

    constructor(properties) {
        super();
        Object.assign(this, properties);
    }


}
