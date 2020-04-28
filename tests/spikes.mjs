/**
 *
 *
 * @author: Bernhard Lukassen
 */
import { CreateCommand } from "/thoregon.tru4D";

class Test {

    constructor({
        id,
        name
    } = {}) {
        Object.assign(this, { id, name });
    }

}

class CreateTest extends CreateCommand {

}



// ************************************************************************************************************

/*
(async () => {
    try {
        const cc = new CreateCommand();
        await cc.commit();
    } catch (e) {
        console.error(e.trace());
    }
})();
*/
