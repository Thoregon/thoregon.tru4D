/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { EventEmitter }                from "/evolux.pubsub";
import { Reporter }                    from "/evolux.supervise";
import { RepoMirror, parts, forEach }  from "/evolux.util";
import { tservices, timeout, doAsync } from "/evolux.universe";

import { ErrNoPersistenceProvider }    from "../lib/errors.mjs";

export default class T4D extends Reporter(EventEmitter) {


    /*
     * Service
     */

    install() {
        this.logger.debug('** tru4d install()');
        tservices().tru4d = this;
    }

    uninstall() {
        this.logger.debug('** tru4d uninstall()');
        delete tservices().tru4d;
    }

    resolve() {
        this.logger.debug('** tru4d resolve()');
    }

    async start() {
        this.logger.debug('** tru4d start()');
        const components            = tservices().components;

        // todo: add convention/configuration for dependencies/optional features
        if (components) {
            // check if 'matter' gets installed and use it
            components.observe({
                                   observes:   'matter',
                                   forget:     true,           // do just once, forget after execution
                                   installed:  () => this.connect()
                               });

            // check if 'identity' gets installed and use it
            components.observe({
                                   observes:   'identity',
                                   forget:     true,           // do just once, forget after execution
                                   installed:  async () => await this.withIdentity()
                               });

            // check if 'KARTE' gets installed and hook into
            components.observe({
                                   observes:   'KARTE',
                                   forget:     true,           // do just once, forget after execution
                                   installed:  () => this.supportKARTE()
                               });
        }
    }

    stop() {
        this.logger.debug('** tru4d stop()');
        this.disconnect();
    }

    update() {
        this.logger.debug('** tru4d update()');
    }

    /*
     * Event processing
     */

    /*
     * Lifecycle
     */

    // todo: move to BoundedContext
    async connect() {
        const u = universe;
        if (this._persistence) return;
        this._persistence = u.matter;

        this.emit('ready', { tru4d: this });
    }

    disconnect() {
        delete this._persistence;
        this.emit('exit', { tru4d: this });
    }

    get isConnected() {
        return !!this._persistence;
    }

    get persistence() {
        if (!this.isConnected) throw ErrNoPersistenceProvider();
        return this._persistence;
    }

    /*
     * Identity‚
     */

    /**
     * do the setup to work with identites
     */
    async withIdentity() {
        let controller = universe.Identity;

        // work with users
        controller.on('auth',   async (event) => await this.signon(event.payload));
        controller.on('leave',  async (event) => await this.signoff(event.payload));
    }

    async signon(idenity) {
        if (!this.ctx) return;
        this.identity = idenity;
        let ctx = [...this.ctx.values()];
        await forEach(ctx, async (context) => await context.signon(idenity));
    }

    async signoff(idenity) {
        if (!this.ctx) return;
        this.identity = idenity;
        let ctx = [...this.ctx.values()];
        await forEach(ctx, async (context) => await context.signoff(idenity));
    }

    /*
     * KARTE
     */

    supportKARTE() {}

    /*
     * Processing
     */

    pause() {
        this.paused = true;
        this.emit('pause', { true4d: this });
    }

    resume() {
        this.paused = false;
        this.emit('resume', { true4d: this });
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'True4D ready',
            exit:           'True4D exit',
            put:            'Context added',
            drop:           'Context dropped',
            update:         'Context updated',
            pause:          'Pause processing',
            resume:         'Resume processing'
        };
    }
}
