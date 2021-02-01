/**
 * observes property modifications on a 'surrogate' objects used e.g. in view models in a UI
 * produces ModifyPropertyCommands
 *
 * @author: Bernhard Lukassen
 */

export default class ModifyPropertyObserver {

    constructor({
                    id
                } = {}) {
        Object.assign(this, {id});
    }

}
