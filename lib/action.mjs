/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Action {

    static forCommand(command, options) {
        let action = new this();
        action.command = command;
        action.options = options;
        return action;
    }

    async exec() {}

}
