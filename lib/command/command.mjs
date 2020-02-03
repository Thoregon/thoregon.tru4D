/**
 * Commands will be stored in an event stream.
 * Uses the Matter API for persistence
 *
 * @author: Bernhard Lukassen
 */

import { className }                from "/evolux.util";
import { myuniverse, tservices }    from "/evolux.universe";
import { ErrCommandStoreMissing }   from "../errors.mjs";

const cmdstatus = {
    created:    'created',
    pending:    'pending',
    comitted:   'done',
    rejected:   'rejected'
};

export default class Command {

    constructor(properties) {
        this.properties = Object.assign({}, properties);
        this._status = cmdstatus.created;
    }

    /*
     * Status information
     */

    get status() {
        return this._status;
    }

    get pending() {
        return this._status === cmdstatus.pending;
    }

    setPending() {
        this._status = cmdstatus.pending;
    }

    get comitted() {
        return this._status === cmdstatus.comitted;
    }

    setComitted() {
        this._status = cmdstatus.comitted;
    }

    get rejected() {
        return this._status === cmdstatus.rejected;
    }

    setRejected(err) {
        this._status = cmdstatus.rejected;
        if (err) throw err;
    }

    /**
     * execute (commit) the command
     * @return {Promise<void>}
     */
    async commit() {
        await this.prepare();

        // todo: 'store' the command in the event store
        // select the event store, defined by the bounded context, but can be overridden
        const store = this.store;
        let prev = store.curr.val;
        let payload = this.payload();

        if (this.tru4d.isResponsible(this._responsibilities)) {
            this._status     = cmdstatus.pending;
            this.t͛zodiac    = this.tru4d.t͛zodiac;
        }

        let cmd = {
            cmd: className(this),
            payload,
            status: this.status
        };
        if (prev) cmd.prev = prev;
        store.curr = cmd;

        await this.tru4d.doCommand(cmd, this);
    }

    checkId() {
        if (!this.properties.id) this.setRejected(ErrNoId(JSON.stringify(this)));
    }

    /*
     *
     */

    get store() {
        // if (!this.commandstore) this.setRejected(ErrCommandStoreMissing(className(this)));
        return this.tru4d.commandroot;
    }

    get tru4d() {
        return tservices().tru4d;
    }

    get matter() {
        return myuniverse().matter;
    }

    get payload() {
        let payload = Object.assign({}, this.properties);
        payload = this.settlePayload(payload);
        return payload;
    }

    /*
     * implement by subclasses
     */

    /**
     * may be overwritten by subclass to modify (settle) the commands payload.
     * @param payload
     * @return {*}
     */
    settlePayload(payload) {
        return payload;
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
        return !!this._schemaname;
    }

    async schema() {
        return this._schemaname
            ? await tservices().schema.schema(this._schemaname)
            : null;
    }

    set schemaname(schema) {
        this._schemaname = schema;
    }

    get schemaname() {
        return this._schemaname;
    }
}
