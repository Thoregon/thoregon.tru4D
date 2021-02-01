/**
 * Wrapper for collections of objects.
 *
 * Implements basic initialization, synchronization and queries.
 * More sophisticated util function see {@link CollectionUtil}
 * For mirrors - to be used in reactive programming frameworks/libs - see {@link CollectionMirror}
    *
 *
 * ! Using the universe matter requires a strict distinction to be made between
 *  - node of the underlying DB
 *      - items, pk and all indexes contains matter access nodes
 *  - content of the node
 *      - mirrors contains contents of nodes
 *      - use to display, but not to manipulate or drop items
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
 *  - [REFACTOR] check with gundb if there is a better way for initialization of items
 *  - update events for top level objects in collection
 *
 * todo [OPEN]:
 *  - collection views for ACL's (shared key per ACL)
 *
 * @author: Bernhard Lukassen
 */

import { forEach }              from '/evolux.util';
import { doAsync }              from '/evolux.universe';
import { EventEmitter}          from "/evolux.pubsub";
import { Reporter }             from "/evolux.supervise";
import { REF }                  from "/evolux.matter";

import CollectionUtil           from "./collectionutil.mjs";
import CollectionMirror         from "./collectionmirror.mjs";

import { ErrDuplicatePrimaryKey, ErrPrimaryKeyMissing }     from "../errors.mjs";

const TSET = 't͛set';
const TDEL = 't͛del';

const donotkeep  = (key) => key === '_' || key === TDEL;
// const rnd   = universe.Gun.text.random;

export default class Collection extends CollectionUtil(Reporter(EventEmitter)) {

    constructor({
                    name,
                    node,
                    ctx,
                    schema,
                    scope
                } = {}) {
        super();
        Object.assign(this, { name, node, ctx, schema, scope });
        // this.mirrors    = [];

        this.items      = [];               // kept sync with the underlying db; each item as a REF to the persistent node
        this.idxmap     = {};               // maintain a key <-> index map to drop the right items
        this.indexes    = {};               //
        this._mirror    = new CollectionMirror(this);
    }

    static of(metacollection) {
        const collection = new this(metacollection);
        collection.meta = metacollection;
        return collection;
    }

    static async from(obj, property, meta) {
        if (!obj.is) {
            universe.logger.warn('required object not found', id);
            return ;
        }
        let colldef = {
            node: obj[property],
            name: property
        };

        if (meta) colldef.meta = meta;

        let collection  = new this(colldef);
        await collection.establish();
        return collection;
    }

    /**
     * @return {Promise} promise
     */
    establish() {
        return new Promise((resolve, reject) => {
            try {
                let node = this.node;

                // todo: pubkeys, salt, ...

                // persist meta information
                node[TSET] = true;

                this._doinit(resolve); // the collection content needs to be initialized

                // if collection is empty, init is also done
                node.content.not(() => {
                    this._donesync();
                });

                // listen to all modifications in the collection
                node.content.on((itemids) => this.syncCollection(itemids), /*{ wait: 99 }*/ ); // do't use open(), Observe the objects inside the collection only when they are displayed or used

                // node.pk.on((item, key) => this.syncIndex('pk', item, key), /*{ wait: 99 }*/); // do't use open(), Observe the objects inside the collection only when they are displayed or used
            } catch (e) {
                reject(e);
            }
        });
    }

    async clear() {
        let keys = Object.keys(await this.node.content.val);
        if (!keys) return;
        // don't set the content node to 'null'! remove each item
        keys.forEach((key) => {
            if (!donotkeep(key)) this.node.content[key].put(null);
        });

        // should be done automatically
        // let schema = this.schema;
        // if (schema && schema.hasKey()) {
        //     let pkkeys = Object.keys(await this.node.pk.val);
        //     await forEach(pkkeys, async (pk) => {
        //         if (!donotkeep(pk)) {
        //             await this.node.pk[pk].put(null);
        //         }
        //     });
        // }
        // todo: maintain indexes
        // should be done automatically
        // this.items      = [];
        // this.indexes    = {};
    }

    /*
     * items access
     */

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
        // maintain primary key if defined
        let schema = this.schema;
        if (schema && schema.hasKey()) {
            let pk = schema.keyFrom(object);
            if (!pk) throw ErrPrimaryKeyMissing(this.name);
            let existing = await this.node.pk[pk].val;
            if (existing) throw ErrDuplicatePrimaryKey(this.name, pk);
        }
        // todo [OPEN]: maintain child collections of entities

        let result = await this.node.content.add(object);
        if (result) object[REF] = result;   // set the DB node for easy access
        return object;  // return the node from matter
    }

    async delPK(pk) {
        if (!this.hasPK()) return;
        let pknode = this.nodepk[pk];
        let obj = await node.pk[pk].val;
        if (obj && await obj.is) {
            let id = universe.Gun.node.soul(obj);
            // remove it from the content
            obj[TDEL] = true;   // just set deleted flag
            // remove it from the content
            await node.content[id].put(null);
        }
    }

    async del(id) {
        const node  = this.node;
       // if an id is provided, mark the object as deleted
       if (id) {
           const db = universe.matter.root;   //db root to query sub objects
           // get the properties to modify w/o the key of the command param
           let obj = node.content[id];
           if (await obj.is) {
               obj[TDEL] = true;   // just set deleted flag
               // remove it from the content
               await node.content[id].put(null);
           }
       }
    }

    async mod(item, { id, pk } = {}) {
        let obj;
        // todo: maintain PK, check for duplicate key
        // todo: maintain indexes
    }

    /*
     * meta information
     */

    hasPK() {
        let schema = this.schema;
        return schema && schema.hasKey();
    }

    /*
     * synchronisation
     */

    // todo [REFACTOR]: optimize whole method to reduce memory consumption
    async syncCollection(itemids) {
        if (this._syncing) return;      // todo [REFACTOR]: this may loose some items --> check if necessary
        this._syncing = true;
        // let mirrors     = this.mirrors;
        try {
            let idxmap = this.idxmap;
            let items = [];
            let content = this.node.content;

            /*  started refactoring
                    let keys    = await content.val;
                    let newkeys = Object.keys(itemids).filter(k => !donotkeep(k));
                    let oldkeys = Object.keys(keys).filter(k => !donotkeep(k));
                    let added   = newkeys.filter(key => oldkeys.indexOf(key) < 0);
                    let removed = oldkeys.filter(key => newkeys.indexOf(key) < 0);
            */

            let dbkeys = Object.keys(itemids).filter(k => !donotkeep(k));

            await forEach(dbkeys, async (key) => {
                const node = content[key];
                // maintain items
                let item = await node.val;
                if (item) {
                    items.push(item);
                    // maintain idxmap
                    idxmap[key] = items.length - 1;
                }
            });

            // maintain pk
            if (this.hasPK()) {
                let pk = this.node.pk;
                let pks = await pk.val || {};
                let schema = this.schema;
                let itemmap = {};
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    if (item) {
                        let pk = schema.keyFrom(items[i]);
                        itemmap[pk] = items[i];
                    }
                }
                let newpk = Object.keys(itemmap);
                let oldpk = Object.keys(pks).filter(k => !donotkeep(k));
                let added = newpk.filter(pk => oldpk.indexOf(pk) < 0);
                let removed = oldpk.filter(pk => newpk.indexOf(pk) < 0);
                removed.forEach(key => pk[key] = null);
                added.forEach(key => pk[key] = itemmap[key]);
            }
            // todo [OPEN]: maintain indexes

            this.items = items;
            this.idxmap = idxmap;

            this.syncMirrors(items);

            this._donesync();
        } catch (e) {
            this.logger.error('syncCollection', e);
        }
        this._syncing = false;
    }


    syncMirrors(items) {
        // just replace all items
        // todo [REFACTOR]: optimize
        this._mirror.splice(0, this._mirror.length, ...items);
    }

    /*
     * usage
     */

    get mirror() {
        return this._mirror;
    }

    /*
     * util
     */

    // todo [OPEN]: introduce filter/find listeners. When an object matching an expression is added

    // todo [OPEN]: introduce drop listeners. When an object matching an expression is removed

    // todo [OPEN]: listener if object is dropped dor modified (object, not expression)

    // todo [OPEN]: handler when an object matching an expression does not exist

    // todo [PERFORMANCE]: use indexes, ...
    async find(selectorfn) {
        let found = [];
        await forEach(this.items, async (node) => {
            let item = node;    // todo [REFACTOR]: await node.val;
            if (item && selectorfn(item)) found.push(item);
        });
        return found;
    }

    get list() {
        return this.items;
    }

    get pk() {
        return this.indexes.pk;
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


    /*  todo [OPEN]: implement iterator interfaces, maybe only the async is possible
        [Symbol.iterator]() {

        }

        [Symbol.asyncIterator]() {

        }
    */

}
