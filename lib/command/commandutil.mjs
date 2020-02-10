/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { myuniverse }   from "/evolux.universe";
import { emsg }         from "/evolux.supervise";
import Command          from "./command.mjs";

const lpad0     = (s, size) => s.toString().padStart(size, '0');
const tsid      = (dttm) => `${lpad0(dttm.getYear()+1900,4)}-${lpad0(dttm.getMonth()+1,2)}-${lpad0(dttm.getDate(),2)}`; // day string
const ts        = () => tsid(new Date());

// const ts        = (dttm) => `${lpad0(dttm.getYear()+1900,4)}-${lpad0(dttm.getMonth()+1,2)}-${lpad0(dttm.getDate(),2)}T${lpad0(dttm.getHours(),2)}:${lpad0(dttm.getMinutes(),2)}:${lpad0(dttm.getSeconds(),2)}`;  // seconds

const CURRENT   = 'current';
const REJECTED  = 'rejected';
const DONE      = 'done';

const storage   = myuniverse().matter.root;

export default class CommandUtil {

    static handle(commanddata, node, cmdroot) {
        let handler         = new this();
        handler.commanddata = commanddata;
        handler.node        = node;
        handler.cmdroot     = cmdroot;

        return handler;
    }

    static async enqueue(cmd, cmdroot) {
        let curr = await cmdroot[CURRENT];

        if (curr) {
            cmdroot[CURRENT].pending = cmd;
        } else {
            cmdroot[CURRENT] = cmd;
        }
    }

    async resolve() {
        let commanddata = this.commanddata;
        let control = commanddata.control ? await storage[commanddata.control['#']].val : null;
        let payload = commanddata.payload ? await storage[commanddata.payload['#']].val : null;
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
        let donets = ts();
        this.cmdroot[REJECTED][donets].add(this.node);
        if (await this.node.has('pending')) {
            let doneid = myuniverse().Matter.soul(this.commanddata);
            let next = this.node.pending;
            this.cmdroot[CURRENT] = next;
            delete storage[doneid].pending;
        } else {
            delete this.cmdroot[CURRENT];
        }

    }

    async done(results) {
        this.node.state = Command.states.done;   // persist state change; this invokes this handler again, but it will abort because of the state condition
        if (results && results.length > 0) {
            this.node.results = { ...results };
        }
        let donets = ts();
        this.cmdroot[DONE][donets].add(this.node);      // add to done
        if (await this.node.has('pending')) {
            let doneid = myuniverse().Matter.soul(this.commanddata);
            let next = this.node.pending;
            this.cmdroot[CURRENT] = next;
            delete storage[doneid].pending;
        } else {
            delete this.cmdroot[CURRENT];
        }
    }

}
