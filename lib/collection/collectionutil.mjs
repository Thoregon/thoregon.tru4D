/**
 *
 *
 * @author: Bernhard Lukassen
 */

// import { forEach }              from '/evolux.util';
import { doAsync }              from '/evolux.universe';

const CollectionUtil =  (base) => class CollectionUtil extends (base || Object) {

    constructor() {
        super();
        this.findqueues = [];
    }

    _doinit(waitfn) {
        this._isinit = true;
        if (waitfn) this._waitfn = waitfn;
    }

    _donesync() {
        this._isinit = false;
        // now perform all waiting requests
        (async () => {
            await doAsync();    // push back to process queue
            if (this._waitfn) {
                this._waitfn(this);
                delete this._waitfn;
            }
        })();
        (async () => {
            await doAsync();    // push back to process queue
            this.findqueues = this.findqueues.filter(fn => !fn());
        })();
    }

    /*
     * work with items
     */

    /**
     * do when no item matches the selection criteria
     * will be performed exactly one time, selects only current items
     * @param {Function} selectorfn - select the items which may be missing
     * @param {Function} dofn       - perform, if no item found matching the selectorfn
     */
    whenMissing(selectorfn, dofn) {
        let missingfn = (items) => {
            if (items.length === 0) dofn();
            return true;    // deenqueue
        };
        let fn = () => {
            return this._selectItems(selectorfn, missingfn);
        }
        // reserve the request while init
        if (this._isinit) {
            this.findqueues.push(fn);
        } else {
            fn();
        }

        return this;    // fluent API
    }

    /**
     * do when one/some item matches the selection criteria
     * will be performed exactly one time
     * waits if an item arrives in the collection if missing so far
     * @param {Function} selectorfn - select the items which may be missing
     * @param {Function} dofn       - perform, if no item found matching the selectorfn; the items found will be passed as param
     */
    whenFound(selectorfn, dofn) {
        let foundfn = (items) => {
            if (items.length > 0) {
                dofn(items);
                return true;
            } else {
                // enqueue again, maybe the item fill arrive later
                return false;
            }
        };
        let fn = () => {
            return this._selectItems(selectorfn, foundfn);
        }
        // reserve the request while init
        if (this._isinit) {
            this.findqueues.push(fn);
        } else {
            if (!fn()) this.findqueues.push(fn);    // queue it if not found so far
        }

        return this;    // fluent API
    }


    _selectItems(selectorfn, fn) {
        let selected = [];
        for(let i = 0; i < this.items.length; i++) {
            if (selectorfn(this.items[i])) selected.push(this.nodes[i]);
        }
        // let selected = this.items.filter(selectorfn);
        return fn(selected);
    }

};

export default CollectionUtil;
