/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }              from "/evolux.universe";
import { emsg }                 from "/evolux.supervise";
import Command                  from "./command.mjs";

const lpad0     = (s, size) => s.toString().padStart(size, '0');
const tsid      = (dttm) => `${lpad0(dttm.getYear()+1900,4)}-${lpad0(dttm.getMonth()+1,2)}-${lpad0(dttm.getDate(),2)}`; // day string
const ts        = () => tsid(new Date());

// const ts        = (dttm) => `${lpad0(dttm.getYear()+1900,4)}-${lpad0(dttm.getMonth()+1,2)}-${lpad0(dttm.getDate(),2)}T${lpad0(dttm.getHours(),2)}:${lpad0(dttm.getMinutes(),2)}:${lpad0(dttm.getSeconds(),2)}`;  // seconds

const CURRENT   = 'current';
const REJECTED  = 'rejected';
const DONE      = 'done';

const storage   = universe.matter.root;

export default class CommandUtil {

    static handle(commanddata, node, cmdroot) {
        let handler         = new this();
        handler.commanddata = commanddata;
        handler.node        = node;
        handler.cmdroot     = cmdroot;

        return handler;
    }

    static async enqueue(cmd, cmdroot) {
        let curr = cmdroot[CURRENT];

        if (this.isWorking(curr)) {
            return this._enqueuePending(cmd, curr);
        } else {
            universe.logger.info("Command enqueued CUR", cmd.command, cmd.payload);
            cmd.lastcmd = cmd.command;
            cmdroot[CURRENT] = cmd;
            await doAsync();
            return await curr.soul;
        }
    }

    static async isWorking(curr) {
        let currcmd = await curr.val;
        return currcmd && currcmd.state !== 'done' && currcmd.state !== 'rejected';
    }

    static async _enqueuePending(cmd, current) {
        let pending = current.pending;
        let pendcmd = await pending.val;

        if (pendcmd) return this._enqueuePending(cmd, pending);

        universe.logger.info("Command enqueued PEND", cmd.command);

        current.pending = cmd;
        await doAsync();

        return current.pending.soul;
    }

    async resolve() {
        let commanddata = this.commanddata;
        let control = commanddata.control ? await storage[commanddata.control['#']].full : null;
        let payload = commanddata.payload ? await storage[commanddata.payload['#']].full : null;
        let cmd = { command: commanddata.command, id: commanddata.id };
        if (control) cmd.control = control;
        if (payload) cmd.payload = payload;

        return cmd;
    }

    async running() {
        this.node.state = Command.states.running;   // persist state change; this invokes this handler again, but it will abort because of the state condition
    }

    async reject(errors) {
        this.node.state = Command.states.rejected;   // persist state change; this invokes this handler again, but it will abort because of the state condition
        if (errors && errors.length > 0) {
            let errs = errors.map(error => emsg(error));
            this.node.errors = { ...errs };
        }
        let done_ts = ts();  // done timestamp
        this.cmdroot[REJECTED][done_ts].add(this.node);
        this._dequeuePending(this.node);
        // todo: send domain event(s)
    }

    async done(results) {
        universe.logger.info("Command done", results);
        this.node.state = Command.states.done;   // persist state change; this invokes this handler again, but it will abort because of the state condition
        if (results && Object.keys(results).length > 0) {
            this.node.results = results;
        }
        let done_ts = ts();  // done timestamp;
        this.cmdroot[DONE][done_ts].add(this.node);      // add to done
        this._dequeuePending(this.node);
        // todo: send domain event(s)
    }

    async _dequeuePending(current) {
        if (await current.has('pending')) {
            universe.logger.info("Command dequeued PEND", results);
            let pending = await current.pending;
            this.cmdroot[CURRENT] = pending;
        } else {
            this.cmdroot[CURRENT].command = "";     // just remove the command id
        }
    }

}
