/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Action {

    static forCommand(command) {
        let action = new this();
        action.command = command;
        return action;
    }

    async exec() {}

}
