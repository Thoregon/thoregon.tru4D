/**
 * Deletes an Entity
 *
 * Uses the Matter API to persist the entity in a collection or a map
 *
 * @author: Bernhard Lukassen
 */

import Action           from "./action.mjs";
import { myuniverse }   from "/evolux.universe";

export default class DeleteAction extends Action {

    constructor() {
        super(...arguments);
    }


}
