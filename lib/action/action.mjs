/**
 * An Action will be triggered from an Event in the EventStream
 *
 * @author: Bernhard Lukassen
 */

export default class Action {

    constructor({
                    commandname,
                    responsiblity
                } = {}) {
        Object.assign(this, { commandname, responsiblity });
    }

}
