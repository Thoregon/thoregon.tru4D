/**
 * The bounded context is an instance of a meta bounded context (definition; class)
 * It encapsulates storage and handling of all procedures belonging to it

 * - permissions for identities on bounded contexts
 *      - read
 *      - read/write
 *
 * bounded context instance persistent structure.
 *
 *   - {ctxinstanceid}
 *      - revision, ...
 *      - 'identities'  -> shared secret between user and bounded context
 *          - 'trusted' -> information about the bounded context
 *      - 'permissions'
 *          - {identitiyid}
 *              - {permissions}
 *              - 'pcollections' -> private per user --> store under the user node?
 *              - 'scollections' -> shared between user and service -> secret
 *      - 'responsibilities'
 *          - {responsibility} | {tzodiac}       ... 'tzodiac' id means this node
 *              - 'commands'
 *                  - 'current'
 *                      - 'pending'
 *                  - done
 *                      - {time} -> group       ! meta bounded context defines an interval; default 1 day
 *                          - {command}
 *      - 'collections' -> all collections, access may need permission (shared secret)
 *          - private       -> those collections are stored under the user node
 *             - {ctxid}
 *               - 'collections'
 *                 - {collectionname}
 *          - shared
 *            - {identity}      -> can be accessed by identity and context, shared secret
 *              - {collectionname}
 *          - context       -> can be accessed only by context, encrypted. access can be granted to identities -> permissions collection key encoded by shared secret of ctx-identity
 *            - {collectionname}
 *          - public    -> public accessible collections, not encrypted
 *            - {collectionname}
 *      - 'events'
 *          - {hourtime} -> group
 *              - {event}
 * Procedure
 *   1) Local command (tzodiac)
 *   2) Service command (responsibility)
 *
 * Permissions
 *  - each grant gets its own root node in the DB, encrypted with a DH secret
 *      - collections
 *      - events
 *      - singletons
 *  - permission can now be partly revoked (for new items and changes on entities)
 *      - information already queried can not be withdrawn again!
 *
 * todo:
 *  - ad owner (creator/admin)
 *  - only owner can update/edit the structure (meta) of the ctx instance
 *  - maybe save the key pair in matter (like SEA User does, but think this is not a good idea)
 *  - Move encryption/decryption to GUN adapter as firewall (better control of deletions/overwrites) -> very important !!!
 *
 *  Creata gun adapter, see 'sea.js' line 1083
 *          // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
         Gun.on('opt', function(at){
              if(!at.sea){ // only add SEA once per instance, on the "at" context.
                at.sea = {own: {}};
                at.on('in', security, at); // now listen to all input data, acting as a firewall.
                at.on('out', signature, at); // and output listeners, to encrypt outgoing data.
                at.on('node', each, at);
              }
              this.to.next(at); // make sure to call the "next" middleware adapter.
            });

 *
 * @author: blukassen
 */

import { doAsync }                          from "/evolux.universe";
import { forEach }                          from "/evolux.util";
import { EventEmitter}                      from "/evolux.pubsub";
import { Reporter, emsg }                   from "/evolux.supervise";
// import CommandUtil                          from "../command/commandutil.mjs";
import Collection                           from "../collection/collection.mjs";
import Command                              from "../command/command.mjs";
import CreateCommand                        from "../command/createcommand.mjs";

import { ErrInvalidBoundedContext, ErrCollectionMissing }         from "../errors.mjs";
import CreateAction from "../action/createaction.mjs";

const rnd           = universe.Gun.text.random;
const SEA           = universe.Gun.SEA;

const tru4d         = () => universe.services.tru4d;

const CURRENT       = 'current';
const DONE          = 'done';

const lpad0         = (s, size) => s.toString().padStart(size, '0');
const tsid          = (dttm) => `${lpad0(dttm.getYear()+1900,4)}-${lpad0(dttm.getMonth()+1,2)}-${lpad0(dttm.getDate(),2)}T${lpad0(dttm.getHours(),2)}:${lpad0(dttm.getMinutes(),2)}:${lpad0(dttm.getSeconds(),2)}.${dttm.getMilliseconds()}`; // seconds
const ts            = () => tsid(new Date());

const TCTX          = 't͛ctx';

export default class BoundedContext extends Reporter(EventEmitter) {

    constructor(meta,                        // bounded context class
                root,                        // root node in matter
                metaresponsibilities = []   // responsibilties for this node
                ) {
        super();
        Object.assign(this, { meta, root, metaresponsibilities });

        this.commands       = {};
        this.cmdactions     = {};
        this._collections   = {};       // cache for collections;
    }

    /*
     * management
     */

    /**
     * Connect to the bounded context instance
     *
     * @param ctxid
     * @param pair
     * @param config        ... arbitrary config data
     * @return {Promise<void>}
     */
    async connect(ctxid, pair, config) {
        let ctx         = this.root;
        this.ctxid      = ctxid;

        if (pair) {
            let pubkeys     = { pub: pair.pub, epub: pair.epub };
            this._pair      = pair;     // todo: move the pair in a secure storage !!! --> see metamask wallet
            this._pubkeys   = pubkeys;
            ctx._pubkeys    = pubkeys;
        }


        // check meta bounded context
        this.metaid     = await ctx.metaid.val;
        if (this.metaid !== this.meta.name) throw ErrBoundedContextMetaMissmatch(this.metaid, this.meta.name);

        // now connect to matter events
        this.establish();
    }

    /**
     * Create the bounded context instance
     *
     * @param ctxid
     * @param passphrase
     * @param config        ... arbitrary config data
     * @return {Promise<void>}
     */
    async make(ctxid, pair, config) {
        let ctx         = this.root;
        this.ctxid      = ctxid;

        if (pair) {
            let pubkeys     = { pub: pair.pub, epub: pair.epub };
            this._pair      = pair;     // todo: move the pair in a secure storage !!! --> see metamask wallet
            this._pubkeys   = pubkeys;
            ctx._pubkeys    = pubkeys;
        }

        ctx[TCTX]       = true;
        this.metaid     = this.meta.name;
        ctx.metaid      = this.meta.name;

        // create identities

        // create permissions

        // create responsibilities

        // create collections

        // create events

        // now connect to matter events
        this.establish();
    }

    /*
     * encoding and security
     */

    get pubkeys() {
        return new Promise(async (resolve, reject) => {
            if (!this._pubkeys) {
                this._pubkeys = await ctx.pubkeys.val;
            }
            resolve(this._pubkeys);
        })
    }


    /*
     * setup
     */

    async establish() {
        this.buildCommandFns();

        // faster queries for actions
        this.collectCommandActions();

        // listen to tru4d
        tru4d().on('pause',  () => this.commandsOn());
        tru4d().on('resume', () => this.commandsOff());

        // connect listeners if not paused
        if (!tru4d().paused) this.commandsOn();
    }

    buildCommandFns() {
        let metacmds = this.meta.commands;
        let cmds = this.commands;
        Object.entries(metacmds).forEach(([id, CmdCls]) => {
            let cmdfn = (...args) => {
                let cmd = new CmdCls(...args);
                cmd.ctxid = this.ctxid;
                return cmd;
            };
            Object.defineProperty(cmds, id, { value: cmdfn,  configurable: false, enumerable: true, writable: false });
        });
    }

    collectCommandActions() {
        // collect cmd actions for fast check
        if (this.meta.hasActions()) {
            Object.values(this.meta.actions).forEach(action => {
                let id = action.commandid;
                if (id) {
                    let cmdactions = this.cmdactions[id];
                    if (!cmdactions) {
                        cmdactions = {};
                        this.cmdactions[id] = cmdactions;
                    }
                    cmdactions[id] = action;
                }
            });
        }
    }

    async commandsOn() {
        let ctx = this.root;
        let cmds = ctx.responsibilities;

        // setup listeners for responsiblities
        let responsibilities = await this.metaresponsibilities;
        let zodiac = universe.t͛zodiac;

        responsibilities.forEach((responsibility) => {
            let cmdpath = cmds[responsibility].commands;
            cmdpath.map().on((command, key, node) => {
                this.handleCommand(responsibility, command, key, node, cmdpath);
            });
        });

        if (zodiac) {
            let cmdpath = cmds[zodiac].commands;
            cmdpath.map().on((command, key, node) => {
                this.handleCommand(null, command, key, node, cmdpath);
            });
        }
    }

    async commandsOff() {
        let ctx = this.root;
        let cmds = ctx.responsibilities;

        // setup listeners for responsiblities
        let responsibilities = await this.metaresponsibilities;
        let zodiac = universe.t͛zodiac;

        responsibilities.forEach((responsibility) => {
            let cmdpath = cmds[responsibility].commands;
            cmdpath.off();
        });

        if (zodiac) {
            let cmdpath = cmds[zodiac].commands;
            cmdpath.off();
        }
    }

    /*
     * Event Listeners on events
     */

    listen(ctxid, eventid) {
        // todo
    }

    /*
     * Permissions
     */

    async grant(request) {

    }

    /*
     * work with identities
     */

    get identities() {
        return new Promise((resolve, reject) => {

        });
    }

    get permissions() {
        return new Promise((resolve, reject) => {

        });
    }

    get responsibilities() {
        return new Promise((resolve, reject) => {

        });
    }

    get collections() {
        return new Promise((resolve, reject) => {

        });
    }


    getMetaCollection(name) {
        return this.meta.collections[name];
    }

    /**
     * get the collection from this bounded context
     *
     * child collection path:
     *  - {objid}.collectionproperty    ... {objid} is the soul from gundb
     *  - todo: toplevelcoll[id][id].collectionproperty
     *
     * @param {String} name - the name of a top level collection or a path to a child collection
     * @return {Promise<*>}
     */
    async getCollection(name) {
        // Check if it is cached
        if (this._collections[name]) return this._collections[name];
        let metacoll    = this.meta.collections[name];
        if (!metacoll) return;

        // get the right collection

        let colldef     = {};
        let collnode    = this.getCollectionNode(name);  // this is the node in Matter where the collection lives

        colldef.name    = name;
        colldef.schema  = metacoll.schema;
        colldef.scope   = metacoll.scope;
        colldef.ctx     = this;
        colldef.node    = collnode;

        let collection  = new Collection(colldef);
        this._collections[name] = collection;

        await collection.establish();
        return collection;
    }

    getCollectionNode(name) {
        let metacoll    = this.meta.collections[name];
        if (!metacoll) return;

        let scope = metacoll.scope;

        // depending on scope, another collection root is choosen
        let path = 'public';    // default

        // do this mapping because it can be changed in future
        switch (scope) {
            case 'context':             // private for the context
                path = 'context';
                break;
            case 'private':             // private for the user
                let id = universe.identity.root;
                let node = id[ctxid].collections[name];
                return node;
                // break;
            case 'shared':              // shared between context and users
                path = 'shared';
                break;
            otherwise:                  // should be -> case 'public':  accessible by everyone
                break;
        }

        let node = this.root.collections[path][name];
        return node;
    }

    async _collectionExists(name) {
        let bc = await this.root.collections[name].val;
        return !!bc;
    }

    /*
     * commands
     */

    getAddChildCommand(modifycommand, parent, prop, data) {
        let responsibility = modifycommand.constructor.responsibility;
        // todo: [OPEN]: get default values from schema
        let cmd = new CreateCommand(this.ctxid, responsibility).for(parent, prop, 'collection', data, true);
        return cmd;
    }

    getSetChildCommand(modifycommand, parent, prop, data) {
        let responsibility = modifycommand.constructor.responsibility;
        // todo: [OPEN]: get default values from schema
        let cmd = new CreateCommand(this.ctxid, responsibility).for(parent, prop, 'object', data, true);
        return cmd;
    }

    /*
     * command utils
     */

    get commandsDone() {

    }

    get commandsPending() {

    }

    async clearCommands(resposibility) {
        let ctx = this.root;
        let cmds = ctx.responsibilities;
        let workResp = resposibility || universe.t͛zodiac;

        delete cmds[resposibility].commands;
        await doAsync();
    }

    async purgeCommands(responsibility, logname) {
        let ctx = this.root;
        let cmdroot = ctx.responsibilities;
        let workResp = resposibility || universe.t͛zodiac;

        let cmds = cmdroot[resposibility].commands;
        // remove all 'done' commands, save them in a log if requested
        await doAsync();
    }

    /*
     * Command processing
     * todo: eventually refactor to separate (responsibility) handlers and use the pubsub infrastructure for dispatching
     */

    async commitCommand(command, cmddata) {
        let ctx = this.root;
        let cmds = ctx.responsibilities;
        // get cmd responsibility. Use zodiac from peer for local execution
        let responsibility = command.workResponsibility;
        // get store
        let store = cmds[responsibility].commands;

        cmddata.created = ts();
        store.set(cmddata);
        // enqueue command; persist the command in matter
        // cmddata.cmdid = await CommandUtil.enqueue(cmddata, store);
    }

    async handleCommand(responsibility, commanddata, key, node, cmdroot) {
        if (!commanddata) return;
        if (!commanddata.command) {
            // this is not a command object -> ignore, clear queue
            // await this.clearCommands(responsibility);
            return;
        }
        if (commanddata.state !== 'created') return;   // check if no one else is processing the command
        if (!this.isResponsible(responsibility)) return;
        // const db = universe.matter.root;   //db root to query sub objects
        // const handler = CommandUtil.handle(commanddata, node, cmdroot);
        commanddata.cmdid = key;
        let cmdnode = cmdroot[key];
        this.running(commanddata, cmdnode);
        this.logger.debug(`handleCommand`); // ${JSON.stringify(commanddata)}
        // let command = Command.from(commanddata);
        // command.setPending();
        let cmd = await this.resolve(commanddata);
        let actions = this.actionsFor(commanddata.command, cmd);
        let errors = [];
        let results = {};
        await forEach(actions, async (action) => {
            try {
                // actions should always process very fast. for long lasting transactions react on the events created
                // todo: introduce a timeout if necessary --> action.abort()
                let result = await action.exec(cmd, cmd.payload, cmd.control, this);
                if (result) results[cmd.command] = result;
            } catch (err) {
                errors.push(err);
            }
        });
        if (this.hasErrors(errors)) {
            this.reportErrors('handleCommand', errors);
            this.reject(commanddata, cmdnode, errors, results);
        } else {
            this.done(commanddata, cmdnode, results);
            // todo: create event
            // events may trigger long lasting processes, introduce your own state object and states
        }
    }

    running(cmd, node) {
        node.state = Command.states.running;   // persist state change; this invokes this handler again, but it will abort because of the state condition
        node.start = ts();
    }

    async resolve(commanddata) {
        let storage = universe.matter.root;
        const ctrlid = commanddata.control['#'];
        let control = commanddata.control ? await storage[ctrlid].full : null;
        const payloadid = commanddata.payload['#'];
        let payload = commanddata.payload ? await storage[payloadid].full : null;
        const parentid = commanddata.parent['#'];
        let parent = commanddata.parent ? await storage[parentid].val : null;
        let cmd = { command: commanddata.command, cmdid: commanddata.cmdid, mold: commanddata.mold };
        if (commanddata.id) cmd.id = commanddata.id;
        if (commanddata.key) cmd.key = commanddata.key;
        if (control) cmd.control = control;
        if (payload) cmd.payload = payload;
        if (parent)  cmd.parent = parent;

        return cmd;
    }


    done(cmd, node, results) {
        node.state = Command.states.done;   // persist state change; this invokes this handler again, but it will abort because of the state condition
        node.processed = ts();
        if (results && results.length > 0) {
            results.forEach(result => node.results.add(result));
        }
    }

    reject(cmd, node, errors, results) {
        node.state = Command.states.rejected;   // persist state change; this invokes this handler again, but it will abort because of the state condition
        node.processed = ts();
        if (errors && errors.length > 0) {
            errors
                .map(error => emsg(error))
                .forEach(errmsg => node.errors.add(errmsg));
        }
        if (results && results.length > 0) {
            results.forEach(result => node.results.add(result));
        }
    }

    isResponsible(responsibility) {
        return !responsibility || this.metaresponsibilities.includes(responsibility);
    }

    actionsFor(commandid, cmd) {
        let cmdactions = this.cmdactions[commandid] || [];
        if (!cmd.auto) {
            let action = this.buildAction(commandid, cmd);
            cmdactions.unshift(action);     // do this action at very first
        }
        return cmdactions;
    }

    buildAction(commandid, cmd) {
        let action;
        if (cmd.parent) {
            switch(cmd.mold) {
                case 'create':
                    action = new CreateAction(commandid).for(cmd.parent);
                    break;
                case 'modify':
                    action = new ModifyAction(commandid).for(cmd.parent);       // this ia a 'move' to another parent! the properties from the child entity can be modified with its own modify command
                    break;
                case 'delete':
                    action = new CreateAction(commandid).for(cmd.parent);
                    break;
                default:
                    break;
            }
        }
        return action;
    }

    hasErrors(errors) {
        return errors && errors.length > 0;
    }

    reportErrors(msg, errors) {
        if (!errors) return;
        errors.forEach(err => this.logger.error(msg, err));
    }

    /*
     * Identities
     */

    signon(identity) {
        universe.logger.info(`[BC ${this.ctxid}] signon '${identity.prettyprint()}'`)
    }

    signoff(identity) {
        universe.logger.info(`[BC ${this.ctxid}] signoff '${identity.prettyprint()}'`)
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'Context ready',
            exit:           'Context exit',
            cmdcommit:      'Command comitted',
            cmderror:       'Command error',
            elemadd:        'Collection Element added',
            elemmod:        'Collection Element modified',
            elemdel:        'Collection Element deleted',
        };
    }

}
