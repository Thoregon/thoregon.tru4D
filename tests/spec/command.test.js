/**
 * Test the Builder
 *
 * @author: blukassen
 */

import { CreateCommand } from "/thoregon.tru4D";

test("should not be full implemented", async () => {
    const cc = new CreateCommand();
    expect(await cc.commit()).toThrowError();
});

