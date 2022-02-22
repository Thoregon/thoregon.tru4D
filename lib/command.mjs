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

    constructor(...data) {
        Object.assign(this, { data });
    }

    /**
     * will be used as identifier e.g. for aurora-collections if defined
     * otherwise the the file (script) name will be used as identifier
     */
    static get id() {
        // implement by subclass
    }

    async commit() {
        let action = this.getAction();
        let result = await action.exec();
        return this.from ? this.from(result) : result;
    }

}
