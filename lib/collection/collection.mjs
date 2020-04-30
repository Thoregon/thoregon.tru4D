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

import { ErrDuplicatePrimaryKey, ErrPrimaryKeyMissing }     from "../errors.mjs";

const TSET = 't͛set';
const TDEL = 't͛del';

const keep  = (key) => key === '_' /*|| key === TSET*/ || key === TDEL;
const rnd   = universe.Gun.text.random;
// const SEA   = universe.Gun.SEA;


export default class Collection {

    constructor({
                    name,
                    node,
                    ctx,
                    schema,
                    scope
                } = {}) {
        Object.assign(this, { name, node, ctx, schema, scope });
        this.listners = [];
    }

    async init(name, ctxid, schemaid, scope) {
        let node = this.node;
        let meta    = {};
        meta.name   = this.name;
        meta.ctx    = this.ctx.id;
        meta.schema = this.schema.name;
        meta.scope  = this.scope;

        // todo: pubkeys, salt, ...

        // persist meta information
        node.meta = meta;
        node[TSET] = true;
        // listen to all modifications in the collection
        node.content.map().on((item, key) => this.syncCollection(item, key), { wait: 99 }); // do't use open(), Observe the objects inside the collection only when they are displayed or used
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

        // todo: maintain indexes

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

    async syncCollection(item, key) {
        if (!item) {    // item deleted

        } else {

        }
    }

    /*
     * usage
     */

    async mirror() {

    }

    /*
     * util
     */

    get list() {
        return new Promise(resolve => {
            const gunnode  = this.node.content;
            const set      = [];

            gunnode.once(async (ref) => {
                await forEach( Object.keys(ref), async key => {
                    if (!keep(key) && !ref[TDEL]) {
                        let item = universe.Matter.$access(key, gunnode.get(key));
                        /*if (exists(item))*/ set.push(item);
                    }
                });
                resolve(set);
            });
        });
    }

    get pk() {
        return new Promise(resolve => {
            const gunnode  = this.node.pk;
            const set      = [];

            gunnode.once((ref) => {
                let pk = Object.keys(ref).filter(key => !keep(key));
                resolve(pk);
            });
        });
    }

}
