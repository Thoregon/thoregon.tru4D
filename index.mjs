/**
 *
 *
 * @author: blukassen
 */

import { myuniverse, tservices }             from '/evolux.universe';
import Repository                           from "./lib/repository.mjs";
import BoundedContextBuilder                from "./lib/boundedcontextbuilder.mjs";

/*
 * basic commands
 */
export { default as Command }               from './lib/command/command.mjs';
export { default as CreateCommand }         from './lib/command/createcommand.mjs';
export { default as ModifyCommand }         from './lib/command/modifycommand.mjs';
export { default as DeleteCommand }         from './lib/command/deletecommand.mjs';
export { default as ActionCommand }         from './lib/command/actioncommand.mjs';

/*
 * bounded context
 */
export { default as BoundedContext }        from './lib/boundedcontext.mjs';
export { default as Aggregate }             from './lib/aggregate.mjs';
export default BoundedContextBuilder;

/*
 * tru4d service
 */
export const service = {
    install() {
        myuniverse().logger.debug('** tru4d install()');
        tservices().tru4d = new Repository();
    },

    uninstall() {
        myuniverse().logger.debug('** tru4d uninstall()');
        delete tservices().tru4d;
    },

    resolve() {
        myuniverse().logger.debug('** tru4d resolve()');
        // nothing to do
    },

    start() {
        myuniverse().logger.debug('** tru4d start()');
        // tservices().tru4d;
    },

    stop() {
        myuniverse().logger.debug('** tru4d stop()');
        // tservices().tru4d;
    },

    update() {
        myuniverse().logger.debug('** tru4d update()');
    }
};
