"use strict";

// Nothing ever seems to actually call this, but resolve-from needs
// it to exist I guess...
module.exports = {
    // eslint-disable-next-line no-unused-vars
    _resolveFileName : (tgt, { id, filename, paths }) => () => tgt,
};
