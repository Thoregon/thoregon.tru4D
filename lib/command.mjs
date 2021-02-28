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

    constructor(data, { to, from, action }) {
        Object.assign(this, { to, from, action, data });
    }

    static with(data, { to, from, action }) {
        let cmd = new this(data, { to, from, action });
        return cmd;
    }

    async commit() {
        let action = this.getAction();
        let result = await action.exec();
        return this.from ? this.from(result) : result;
    }

    getAction() {
        if (!this.action) throw ErrNotAction()
        return this.action.forCommand(this.getData());
    }

    getData() {
        return this.to ? this.to(this.data) : this.data;
    }

}
