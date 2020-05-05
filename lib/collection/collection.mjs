/**
 * Wrapper for collections of objects
 *
 * Structure of a collection storage
 *
 * - meta       ... metainformation
 *   - name     ... name
 *   - pubkeys  ... pub and pub key
 *   - salt     ... salt for the proof
 *   - ctx      ... ref to the bounded context (if so)
 *   - schema   ... ref the the schema (if so)
 * - content    ... set of collection items
 * - pk         ... set of primary keys with item ref
 * - indexes    ... indexes for the items (todo)
 * - t͛set = true   indicates this node as collection
 *
 * encryption/decryption and sing/verify is done by the underlying everblack adapters.
 * the encryption is transparent, write and read unencrypted values
 * if any value can't be decrypted and verified, it just undefined --> check
 *
 * todo:
 *  - store ctx and schema in matter (
 *  - index and key handling
 *  - implement
 *      - Iterator Interface
 *          - https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Iteration_protocols
 *          - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator
 *          - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator
 *      - Stream Interface
 *      - utils see Array, Highland, lazy.js
 *
 * @author: Bernhard Lukassen
 */

import { forEach }              from '/evolux.util';
import { doAsync }              from '/evolux.universe';
import { EventEmitter}          from "/evolux.pubsub";
import { Reporter }             from "/evolux.supervise";

import CollectionMirror         from "./collectionmirror.mjs";

import { ErrDuplicatePrimaryKey, ErrPrimaryKeyMissing }     from "../errors.mjs";

const TSET = 't͛set';
const TDEL = 't͛del';

const donotkeep  = (key) => key === '_' /*|| key === TSET*/ || key === TDEL;
const rnd   = universe.Gun.text.random;
// const SEA   = universe.Gun.SEA;


export default class Collection extends Reporter(EventEmitter) {

    constructor({
                    name,
                    node,
                    ctx,
                    schema,
                    scope
                } = {}) {
        super();
        Object.assign(this, { name, node, ctx, schema, scope });
        this.mirrors    = [];

        this.items      = [];               // kept sync with the underlying db
        this.idxmap     = {};               // maintain a key <-> index map to drop the right items
        this.indexes    = {};
    }

    async establish() {
        let node = this.node;

        // todo: pubkeys, salt, ...

        // persist meta information
        node[TSET] = true;
        // listen to all modifications in the collection
        node.content.map().on((item, key) => this.syncCollection(item, key), { wait: 99 }); // do't use open(), Observe the objects inside the collection only when they are displayed or used
        node.pk.map().on((item, key) => this.syncIndex('pk', item, key), { wait: 99 }); // do't use open(), Observe the objects inside the collection only when they are displayed or used
    }

    async clear() {
        let keys = Object.keys(await this.node.content.val);
        await forEach(keys, async (key) => {
            if (!keep(key)) {
                await this.node.content[key].put(null);
            }
        })

        let schema = this.schema;
        if (schema && schema.hasKey()) {
            let pkkeys = Object.keys(await this.node.pk.val);
            await forEach(pkkeys, async (pk) => {
                if (!keep(pk)) {
                    await this.node.pk[pk].put(null);
                }
            });
        }
        // todo: maintain indexes
    }

    /*
     * items access
     */

    async get(id) {
        return await this.content[id].val;
    }

    async pkget(pk) {
        return await this.node.pk[pk].val;
    }

    async itemnode(id) {
        return await this.content[id];
    }

    async pkitemnode(pk) {
        return await this.node.pk[pk];
    }

    /*
     * collection content handling
     */

    async add(object) {
/*
        if (!universe.Gun.node.is(object)) {
            object = universe.Gun.node.ify(object);
        }
*/
        // maintain primary key if defined
        let schema = this.schema;
        if (schema && schema.hasKey()) {
            let pk = schema.keyFrom(object);
            if (!pk) throw ErrPrimaryKeyMissing(this.name);
            let existing = await this.node.pk[pk].val;
            if (existing) throw ErrDuplicatePrimaryKey(this.name, pk);
            let result = await this.node.pk[pk].put(object);
            await doAsync();
            object = await this.node.pk[pk].val; // get it again with soul to reference the same object
            if (object && object.$access) object = object.node;     // get rid of the matter wrapper todo: better API
        }

        // todo [OPEN]: maintain indexes
        // todo [OPEN]: maintain child collections of entities

        // let id = rnd();
        await this.node.content.add(object);
        return this;
    }

   async del({ id, pk } = {}) {
        const node  = this.node;
        let obj, pknode;
        if (!id && pk) {
            // get the id from the object with the PK
            pknode = node.pk[pk];
            obj = await node.pk[pk].val;
            if (obj) id = universe.Gun.node.soul(obj);
        }
       // if an id is provided, mark the object as deleted
       if (id) {
           const db = universe.matter.root;   //db root to query sub objects
           // get the properties to modify w/o the key of the command param
           let obj = node.content[id];
           if (await obj.is) {
               obj[TDEL] = true;   // just set deleted flag
           }
           // remove it from the content
           await node.content[id].put(null);
       }

       // maintain PK
       let schema = this.schema;
       if (!pknode && obj && (await obj.is) && schema && schema.hasKey()) {
           pk = schema.keyFrom(obj);
           pknode = node.pk[pk];
       }
       if (pknode && (await pknode.is)) await node.pk[pk].put(null);

       // todo: maintain indexes

       return this;
    }

    async mod(item, { id, pk } = {}) {
        let obj;
        if (!id) {
            if (!pk) {
                universe.logger.warn(`[Collection#mod] no 'id' and no 'pk' provided`);
                return;
            }
            obj = this.pkitemnode(pk);
            if (!(await obj.is)) {
                universe.logger.warn(`[Collection#mod] item with PK '${pk}' not found`);
                return;
            }
        } else {
            // get the properties to modify w/o the 'gun' key of the payload
            obj = this.itemnode(id);
            if (!(await obj.is)) {
                universe.logger.warn(`[Collection#mod] item with id '${id}' not found`);
                return;
            }
        }
        Object.assign(obj, properties);
        // todo: maintain indexes
        return this;
    }

    /*
     * synchronisation
     */

    async syncCollection(item, key) {
        let mirrors     = this.mirrors;
        let i           = this.idxmap[key];
        let items       = this.items;

        if (!item || item[TDEL]) {    // item deleted
            if (!i || i < 0) return;    // todo [REFACTOR]: maybe log a debug message in this case
            let elems = items.splice(i,1);
            if (elems.length > 0) this.emit('dropped', { item: elems[0] });
            mirrors.forEach(mirror => {
                try {
                    mirror.splice(i,1);
                } catch (e) {
                    this.logger.error('drop item from mirror', e);
                }
            });
        } else {    // item added
            if (donotkeep(key)) return;
            this.idxmap[key] = items.length;
            items.push(item);
            this.emit('added', { item: item });
            mirrors.forEach(mirror => {
                try {
                    mirror.push(item);
                } catch (e) {
                    this.logger.error('add item to mirror', e);
                }
            });
        }
    }

    async syncIndex(name, item, key) {
        let index       = this.indexes[name];
        if (!index) {
            index = {};
            this.indexes[name] = index;
        }
        if (!item) {
            delete index[key];
        } else {
            index[key] = item;
        }
    }

    /*
     * usage
     */

    async mirror() {
        const mirror  = new CollectionMirror(this);
        this.mirrors.push(mirror);
        let items = this.items;
        mirror.push(...items);

        return mirror;
    }

    releasemirror(mirror) {
        let i = this.mirrors.indexOf(mirror);
        if (i > -1) this.mirrors.splice(i, 1);
    }

    /*
     * util
     */

    // todo [OPEN]: introduce filter/find listeners. When an object matching an expression is added

    // todo [OPEN]: introduce drop listeners. When an object matching an expression is removed

    // todo [OPEN]: listener if object is dropped dor modified (object, not expression)

    // todo [OPEN]: handler when an object matching an expression does not exist

    // todo [PERFORMACE]: use indexes, ...
    async find(selectorfn) {
        let list = await this.list();
        let found = [];
        if (list) {
            await forEach(async (node) => {
                let item = await node.val;
                if (selectorfn(item)) found.push(item);
            })
        }

        return found;
    }

    get list() {
        return this.items;
/*        return new Promise(resolve => {
            const gunnode  = this.node.content;
            const set      = [];

            gunnode.once(async (ref) => {
                await forEach( Object.keys(ref), async key => {
                    if (!keep(key) && !ref[TDEL]) {
                        let item = universe.Matter.$access(key, gunnode.get(key));
                        /!*if (exists(item))*!/ set.push(item);
                    }
                });
                resolve(set);
            });
        });*/
    }

    get pk() {
        return this.indexes.pk;
/*
        return new Promise(resolve => {
            const gunnode  = this.node.pk;
            const set      = [];

            gunnode.once((ref) => {
                let pk = Object.keys(ref).filter(key => !keep(key));
                resolve(pk);
            });
        });
*/
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            added:      'an item has been added',
            dropped:    'an item has been dropped',
        };
    }

}
