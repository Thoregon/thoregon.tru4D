/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class Command {

    constructor({
                    id
                } = {}) {
        Object.assign(this, {id});
    }

    async commit() {
        // must be implemented by subclasses
    }

}
