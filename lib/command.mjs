/**
 *
 *
 * todo [OPEN]: remote command (command as facade to queue or worker)
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Command {

    constructor(appinstance, home) {
        this.instance  = appinstance;
        this.home      = home ?? appinstance.home;
    }

    static for(appinstance, home) {
        const command = new this(appinstance, home);
        return command;
    }

    /**
     * will be used as identifier e.g. for aurora-collections if defined
     * otherwise the the file (script) name will be used as identifier
     */
    static get id() {
        // implement by subclass
    }

    get id() {
        return this.constructor.id;
    }

    //
    // command implementation, implement by  subclasses
    //

    execute(...data) {
        this.pre(...data);
        this.produce(...data);
        this.post(...data);
    }

    async execAsync(...data) {
        await this.preAsync(...data);
        await this.produceAsync(...data);
        await this.postAsync(...data);
    }

    // stages sync
    pre(...data) {
        // implement by subclass
    }

    produce(...data) {
        // implement by subclass
    }

    post(...data) {
        // implement by subclass
    }

    // stages async
    async preAsync(...data) {
        // implement by subclass
    }

    async produceAsync(...data) {
        // implement by subclass
    }

    async postAsync(...data) {
        // implement by subclass
    }

    //
    // helpers
    //

    captureSnapshot(object, definition) {
        return universe.ThoregonObject.captureSnapshot(object, definition);
    }

}
