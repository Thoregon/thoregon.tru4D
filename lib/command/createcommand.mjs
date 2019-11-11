/**
 * Create Command applies a unique 'id' on commit.
 * The id can also be passed at creation, but be careful
 * it has to be unique in the whole universe.
 *
 * @author: Bernhard Lukassen
 */

import Command              from "./command.mjs";
import cuid                 from '/cuid';

export default class CreateCommand extends Command {

    constructor({
                    id
                } = {}) {
        super();
        Object.assign(this, { id });
    }

    /**
     *
     */
    async commit() {
        if (!this.id) this.id = cuid();
        super.commit();
    }


}
