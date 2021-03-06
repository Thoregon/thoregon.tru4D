/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Command                  from "./command.mjs";
// import { ErrNoId }              from '../errors.mjs';

export default class ActionCommand extends Command {

    /**
     * @param properties
     */
    constructor(properties) {
        super(properties);
    }

    /**
     * Use it to distinguish the commands in their meaning
     * @return {string}
     */
    get mold() {
        return 'action';
    }

}
