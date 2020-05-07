/**
 * Commands will be stored in an event stream.
 * Uses the Matter API for persistence
 *
 * todo
 * - forward commit to 'BoundedContext'
 * - move storage to 'BoundedContext'
 *
 * @author: Bernhard Lukassen
 */

import { className }                    from "/evolux.util";
import { myuniverse, tservices }        from "/evolux.universe";

import { ErrCommandAlreadyComitted, ErrNoId, ErrCommandHasNoSchema, ErrParentEntityMissing }       from "../errors.mjs";

const cmdstate = {
    created:    'created',
    running:    'running',
    done:       'done',
    rejected:   'rejected'
};

export default class Command {

    /**
     *
     * @param {String} ctxid            - target context; mandatory
     * @param {String} [responsibility] - override responsibility; if omitted, defined responsibility is used
     */
    constructor(ctxid, responsibility) {
        this.ctxid          = ctxid;
        if (responsibility) this.responsibility = responsibility;
    }

    static get states() {
        return cmdstate;
    }

    /**
     * Create an Entity as child of another Entity
     * @param parent
     */
    for(parent, property, type, data, auto) {
        this.parent = { parent, property, type };
        this.properties = data;
        this.auto = !!auto;
        return this;
    }

    /**
     * use when an object or mockup for the schema is available.
     * Key will be extracted and used to get the object
     * @param object
     * @return {Command}
     */
    async useKey(object) {
        let schema = await this.schema();
        if (!schema) throw ErrCommandHasNoSchema(className(this));
        let key = schema.keyFrom(object);
        if (!key) throw ErrNoId(className(this));
        this.key = key;
        return this;
    }

    /**
     * use when the (primary) key is already available
     * Key will be used to get the object
     * @param key
     * @return {Command}
     */
    static key(key) {
        let cmd = new this();
        cmd.key = key;
        return cmd;
    }

    /*
     * Status information
     */

    get rejected() {
        return this.state === cmdstate.rejected;
    }

    setRejected(err) {
        this.state = cmdstate.rejected;
        if (err) throw err;
    }

    /**
     * execute (commit) the command.
     * To get the result listen to the domain events!
     * @return {Promise} a handle to observe the command execution
     */
    async commit() {
        if (this.cmd) this.setRejected(ErrCommandAlreadyComitted(this.cmd.command));
        await this.prepare();

        let payload = this.payload();       // data needed for the command to be executed
        let control = this.control();

        let cmd = this.cmd = {
            command:    className(this),
            mold:       this.mold,
            control,
            payload,
            state:      cmdstate.created
        };

        // do't forget the objects key if there is one
        if (this.id)        cmd.id  = this.id;
        if (this.key)       cmd.key = this.key;
        if (this.parent)    cmd.parent = this.parent;
        if (this.auto)      cmd.auto = true;

        // let bounded context instance work
        await this.tru4d.context(this.ctxid).commitCommand(this, cmd);

        return this;
    }

    async results() {
        if (!this.cmd && !this.cmd.cmdid) return undefined;
        return myuniverse().matter.root[this.cmd.cmdid].results.full;
    }

    checkId() {
        if (!this.id && !this.key) this.setRejected(ErrNoId(JSON.stringify(this)));
    }

    /*
     * information & control
     */

    get workResponsibility() {
        return this.responsibility || this.constructor.responsibility || universe.t͛zodiac;
    }

    get tru4d() {
        return tservices().tru4d;
    }

    control() {
        let ctrl = {};
        this.supplementControl(ctrl);
        return ctrl;
    }

    payload() {
        let payload = {};
        if (this.defaults) {
            Object.assign(payload, Object.fromEntries(Object.entries(this.defaults).filter(([key, val]) => !!val)));
        }
        if (this.properties) {
            // defaults will be overwritten by defined properties
            Object.assign(payload, Object.fromEntries(Object.entries(this.properties).filter(([key, val]) => !!val)));
        }
        payload = this.settlePayload(payload);
        return payload;
    }

    /*
     * override by subclass if necessary
     */

    /**
     * Use it to distinguish the commands in their meaning
     * @return {string}
     */
    get mold() {
        return 'generic';
    }

    /**
     * may be overwritten by subclass to modify (settle) the commands payload.
     * @param payload
     * @return {*}
     */
    settlePayload(payload) {
        return payload;
    }

    supplementControl(ctrl) {
        // nothing to do, override by subclass
    }

    /**
     * will be called before the actual commit to the event store is done.
     * implement whatever is neccessary, throw errors if commit cannot be performed
     */
    async prepare() {
        if (this.hasSchema()) {
            const schema = await this.schema();
            if (schema) {
                try {
                    await schema.validate(this.properties); // will throw on error
                } catch (e) {
                    this.setRejected(e);
                }
            }
        }
    }

    /**
     * answer a schema if defined
     * @return {Schema} schema or null
     */

    hasSchema() {
        return !!this.constructor.schema || !!this._schemaname;
    }

    async schema() {
        return this.constructor.schema || (this._schemaname
            ? await tservices().schema.schema(this._schemaname)
            : null);
    }

    set schemaname(schema) {
        this._schemaname = schema;
    }

    get schemaname() {
        return this._schemaname;
    }
}
