/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class CollectionMirror extends Array {

    constructor(source) {
        super();
        Object.defineProperty(this, 'source', { value: source,  configurable: false, enumerable: false, writable: false }); // omit it in loops over object keys
    }

    release() {
        this.source.releasemirror(this);    // disconnect events, keep current content
    }
}
