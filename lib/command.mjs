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
        // implement by subclass
    }

    async execAsync(...data) {
        // implement by subclass
    }

}
