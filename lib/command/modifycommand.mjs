/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Command                  from "./command.mjs";

export default class ModifyCommand extends Command {

    /**
     * properties must contain the '_id'
     * @param properties
     */
    constructor(properties) {
        super(properties);
    }

    async commit() {
        this.checkId();
        return await super.commit();
    }

    get mold() {
        return 'modify';
    }

    /*
     * child entities
     */

    getAddChildCommand(ctx, parent, property, data) {
        return ctx.getAddChildCommand(this, parent, property, data);
    }

    getSetChildCommand(ctx, parent, property, data) {
        return ctx.getSetChildCommand(this, parent, property, data);
    }
}
