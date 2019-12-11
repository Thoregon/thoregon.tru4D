/**
 *
 *
 * @author: blukassen
 */

import { myevolux }                     from '/evolux.universe';

import Repository                       from "./lib/repository.mjs";

export { default as Command }           from './lib/command/command.mjs';
export { default as CreateCommand }     from './lib/command/createcommand.mjs';
export { default as ModifyCommand }     from './lib/command/modifycommand.mjs';
export { default as DeleteCommand }     from './lib/command/deletecommand.mjs';


export const service = {
    install() {
        console.log('** tru4d install()');
        myevolux().tru4d = new Repository();
    },

    uninstall() {
        console.log('** tru4d uninstall()');
        delete myevolux().tru4d;
    },

    resolve() {
        console.log('** tru4d resolve()');
        // nothing to do
    },

    start() {
        console.log('** tru4d start()');
        // myevolux().tru4d;
    },

    stop() {
        console.log('** tru4d stop()');
        // myevolux().tru4d;
    },

    update() {
        console.log('** tru4d update()');
        this.stop();
        this.uninstall();
        this.install();
    }
};
