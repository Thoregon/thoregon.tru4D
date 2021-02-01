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

    getAddChildCommand(cmdid, ctx, parent, property, data) {
        return ctx.getAddChildCommand(cmdid, this, parent, property, data);
    }

    getSetChildCommand(cmdid, ctx, parent, property, data) {
        return ctx.getSetChildCommand(cmdid, this, parent, property, data);
    }
}
