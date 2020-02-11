/**
 * Commands will be stored in an event stream.
 * Uses the Matter API for persistence
 *
 * @author: Bernhard Lukassen
 */

import { className }                from "/evolux.util";
import { myuniverse, tservices }    from "/evolux.universe";
import { ErrCommandStoreMissing }   from "../errors.mjs";
import CommandUtil                  from "./commandutil.mjs";

const cmdstate = {
    created:    'created',
    running:    'running',
    done:       'done',
    rejected:   'rejected'
};

export default class Command {

    constructor() {
        this.state = cmdstate.created;
        this.responsibility = myuniverse().t͛zodiac;
    }

    static get states() {
        return cmdstate;
    }

    static from(commanddata) {

    }

    /*
     * Status information
     */

    get created() {
        return this.state === cmdstate.created;
    }

    get pending() {
        return this.state === cmdstate.pending;
    }

    setPending() {
        this.state = cmdstate.pending;
    }

    get comitted() {
        return this.state === cmdstate.comitted;
    }

    setComitted() {
        this.state = cmdstate.comitted;
    }

    get rejected() {
        return this.state === cmdstate.rejected;
    }

    setRejected(err) {
        this.state = cmdstate.rejected;
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
        let payload = this.payload();
        let control = this.control();

        let cmd = {
            command: className(this),
            control,
            payload,
            state: this.state
        };

        // do't forget the objects key if there is one
        if (this.id) cmd.id = this.id;

        // now persist the command in matter
        await CommandUtil.enqueue(cmd, store);
    }

    checkId() {
        if (!this.id) this.setRejected(ErrNoId(JSON.stringify(this)));
    }

    /*
     *
     */

    get store() {
        return this.tru4d.commandroot(this.responsibility);
    }

    get tru4d() {
        return tservices().tru4d;
    }

    get matter() {
        return myuniverse().matter;
    }

    control() {
        return {};
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
