/**
 * This is a definition of a bounded context
 * Create an instance of a bounded context
 *
 * Structure
 * - {metactx}
 *    - 'revisions' []
 *    - 'instances' []        ... collection of references
 *      - {ctxinstanceid}
 *
 * todo:
 *  - deploy and store meta bounded context in matter   --> cli/admin UI
 *  - migration actions for updates
 *  - ad owner (creator/admin)
 *  - only owner can update/edit the structure of the meta ctx
 *
 * @author: blukassen
 */

import { tservices }            from "/evolux.universe";
import BoundedContext           from "./boundedcontext.mjs";

import { ErrBoundedContextExists, ErrBoundedContextNonExists } from "../errors.mjs";

const rnd = universe.Gun.text.random;
const SEA = universe.Gun.SEA;

export default class MetaBoundedContext {

    constructor({
                    name,                   // name the bounded context
                    description,            // give an educated description
                } = {}) {
        Object.assign(this, { name, description });

        this.commands       = {};
        this.actions        = {};
        this.events         = {};
        this._collections   = {};

        this.instances      = {};
    }

    /* Collections */

    /**
     * define a collection
     * @param {String} collectionname   - the name/id of the collection
     * @param {String} scope            - one of 'public', 'context', 'shared' or 'private'. default = shared (between context and identity)
     */
    useCollection(collectionname, scope, schema) {
        let metacoll = { scope: scope || 'shared', schema };
        this._collections[collectionname] = metacoll;
    }

    get collections() {
        return this._collections;
    }

    /* Commands */
    useCommand(cmdid, command) {
        this.commands[cmdid] = command;
    }

    /* Actions */
    useAction(actionid, action) {
        this.actions[actionid] = action
    }

    hasActions() {
        return Object.keys(this.actions).length > 0;
    }

    /**
     *
     * @param eventid
     * @param {String} cmdid    - event will be emitted when the command was committed
     */
    useEvent(eventid, cmdid) {
        this.events[eventid] = cmdid;
    }

    /*
     * Instances
     */

    /**
     * create an instance of this bounded context.
     *
     * @param {String} ctxid        - (unique) id of the context
     * @param {String} pair         - the keypair to encrypt the bounded context
     * @param {Object} config       - arbitrary config data
     */

    async establish(ctxid, pair, config) {
        // let bc = await this.ctxroot[ctxid].val;
        if (await this.exists(ctxid)) {
            this.connect(ctxid, pair, config);
        } else {
            this.make(ctxid, pair, config);
        }
    }

    async make(ctxid, pair, config) {
        if (await this.exists(ctxid)) throw ErrBoundedContextExists(this.name, ctxid);
        let bc = new BoundedContext(this, this.ctxroot[ctxid], this.noderesponsibilities);
        await bc.make(ctxid, pair, config);
        this.addRepo(ctxid, bc);
    }

    async connect(ctxid, pair, config) {
        if (!(await this.exists(ctxid))) throw ErrBoundedContextNonExists(this.name, ctxid);
        let bc = new BoundedContext(this, this.ctxroot[ctxid], this.noderesponsibilities);
        await bc.connect(ctxid, pair, config);
        this.addRepo(ctxid, bc);
    }

    addRepo(ctxid, bc) {
        let tru4d   = tservices().tru4d;
        tru4d.useContext(ctxid, bc);
    }

    /**
     * Answers the root node from matter. A bounded context instance is a unique root object.
     * @return {*}
     */
    get ctxroot() {
        return universe.matter;
    }

    get noderesponsibilities() {
        return universe.responsibilities;
    }

    async exists(ctxid) {
        let bc = await this.ctxroot[ctxid].val;
        return !!bc;
    }

    async update(ctxid) {
        // todo
    }
}
