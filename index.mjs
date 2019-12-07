/**
 *
 *
 * @author: blukassen
 */

import { myevolux }                     from '/evolux.universe';

import Repository                       from "./lib/repository.mjs";

export { default as Command }           from './lib/command/command.mjs';
export { default as CreateCommand }     from './lib/command/createcommand.mjs';
export { default as ModifyCommand }     from './lib/command/modifypropertycommand.mjs';
export { default as CreateCommand }     from './lib/command/createcommand.mjs';


export const service = {
    install() {
        console.log('** tru4d install()');
        myevolux().dddd = new Repository();
    },

    uninstall() {
        console.log('** tru4d uninstall()');
        delete myevolux().dddd;
    },

    resolve() {
        console.log('** tru4d resolve()');
        // nothing to do
    },

    start() {
        console.log('** tru4d start()');
        // myevolux().dddd;
    },

    stop() {
        console.log('** tru4d stop()');
        // myevolux().dddd;
    },

    update() {
        console.log('** tru4d update()');
        this.stop();
        this.uninstall();
        this.install();
    }
};
