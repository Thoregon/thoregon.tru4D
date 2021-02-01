/**
 * Definition (Class) of an API
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class BoundedContext {

    constructor({
                    id
                } = {}) {
        Object.assign(this, { id });
    }

}
