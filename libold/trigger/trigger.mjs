/**
 * base class for (external) event based triggers
 *
 * @author: Bernhard Lukassen
 */

export default class Trigger {

    constructor({
                    id
                } = {}) {
        Object.assign(this, {id});
    }

}
