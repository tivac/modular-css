"use strict";

// Nothing ever seems to actually call this, but resolve-from needs
// it to exist I guess...
module.exports = {
    _resolveFileName : (tgt, { id, filename, paths }) => () => tgt,
};
