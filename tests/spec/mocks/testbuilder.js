/**
 * Test Builder
 *
 * @author: blukassen
 */

const Builder = require('thoregon.tru4D/lib/builder');

class TestBuilder extends Builder {


    /**
     * create new instance
     * @param {Object} options - options for the eTrace
     * @return {Object} entity
     * @private
     */
    _newEntity(options) {
        return {};
    }

}

module.exports = TestBuilder;
