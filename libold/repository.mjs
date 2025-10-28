/**
 * The repository is the central element. Contains only Control entities no business entities
 *
 * - registry for
 *      - meta (bounded) contexts
 *      - (bounded) contexts (instances)
 * - distributes events
 *      - based on commands
 * - provides actors e.g. to update/build snapshots
 *      - there can by multiple actors for one event
 *      - separate aspects e.g. uddate snapshot, recalc statistic, notify external system
 *
 * - Transactions
 *      - todo: can be nested in tree form
 *
 * Access:
 *  universe.dddd    ... this, true4D repository
 *      - meta       ... meta bounded contexts
 *      - ctx        ... bounded context instances
 *
 * todo:
 * - use stored meta contexts (in matter)
 * - move gun listener to 'BoundedContext'
 * - move storage to 'BoundedContext'
 * - key pair for each context instance
 *
 * Commands will be wrapped in Events when they got synced
 *
 * The repository
 *
 * @author: Bernhard Lukassen
 */

import { EventEmitter}                      from "/evolux.util/lib/eventemitter.mjs";
import { Reporter }                         from "/evolux.supervise";
import { RepoMirror, parts, forEach }       from "/evolux.util";
import { ErrNoPersistenceProvider }         from "./errors.mjs";

// import Command                              from "./command/command.mjs";
import KarteBCHandler                       from "./query/kartebchandler.mjs";
import KarteMBCHandler                      from "./query/kartembchandler.mjs";

import { tservices, timeout, doAsync }      from "/evolux.universe";

    export default class Repository extends RepoMirror(Reporter(EventEmitter), 'dddd') {

    constructor() {
        super();
        this.metactx        = new Map();
        this.ctx            = new Map();
        this.paused         = false;

        this.metaqueue      = {};
        this.ctxqueue       = {};
    }

    /*
     * Information
     */

    get metaboundedcontexts() {

    }

    get boundedcontexts() {

    }

    // todo: query API for bounded contexts
    //  - commands: current/pending/done/error

    // todo: admin API for bounded contexts
    //  - remove command: current/pending

    /*
     * Definition
     */

    /*
     * Meta Context
     */

    hasMeta(id) {
        return this.metactx.has(id);
    }

    meta(id) {
        return this.metactx.get(id);
    }

    onMeta(id, fn) {
        if (this.hasMeta(id)) {
            return fn(this.meta(id));
        } else {
            let queue = this.metaqueue[id];
            if (!queue) {
                queue = [];
                this.metaqueue[id] = queue;
            }
            queue.push({ id, fn });
        }
    }

    useMeta(id, metactx) {
        const exists = this.hasContext(id);
        this.metactx.set(id, metactx);
        this._addToMirror(`meta.${id}`, metactx);   // shortcut for convenience
        this.emit(exists ? 'update' : 'put', { id, metactx, type: 'meta' });

        this._procMetaQueue(id, metactx);

        return this;
    }

    async _procMetaQueue(metaid, meta) {
        await doAsync();
        let queue = this.metaqueue[metaid];
        if (queue) {
            await forEach(queue, async ({id, fn}) => {
                if (id === metaid) await fn(meta);
            });
        }
    }

    /*
     * Bounded Context (Instance)
     *
     * A bounded context instance occupies its own root node in the Gun graph
     */

    hasContext(id) {
        return this.ctx.has(id);
    }

    context(id) {
        return this.ctx.get(id);
    }

    onCtx(id, fn) {
        if (this.hasContext(id)) {
            return fn(this.context(id));
        } else {
            let queue = this.ctxqueue[id];
            if (!queue) {
                queue = [];
                this.ctxqueue[id] = queue;
            }
            queue.push({ id, fn });
        }
    }

    useContext(id, ctx) {
        const exists = this.hasContext(id);
        this.ctx.set(id, ctx);
        this._addToMirror(`ctx.${id}`, ctx);   // shortcut for convenience
        this.emit(exists ? 'update' : 'put', { id, ctx, type: 'context' });

        this._procCtxQueue(id, ctx);

        return this;
    }

    async _procCtxQueue(ctxid, ctx) {
        await doAsync();
        let queue = this.ctxqueue[ctxid];
        if (queue) {
            await forEach(queue, async ({id, fn}) => {
                if (id === ctxid) await fn(ctx);
            });
        }
    }

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
     * KARTE
     */

    supportKARTE() {
        const KARTE = universe.KARTE;
        KARTE.use(new KarteBCHandler());
        KARTE.use(new KarteMBCHandler());
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
