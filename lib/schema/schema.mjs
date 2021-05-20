/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Schema {

    constructor(meta) {
        this.meta     = Object.assign({}, meta);
    }

    get name() {
        return this.meta.name;
    }

}
