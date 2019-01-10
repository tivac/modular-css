const listen = (src, keys, fn, options = {}) => {
    if(!Array.isArray(keys)) {
        keys = [ keys ];
    }

    const { init = true } = options;

    if(init) {
        fn(src.get(), false);
    }

    return src.on("state", ({ changed, current, previous }) => {
        const fire = keys.some((key) => changed[key]);

        if(!fire) {
            return;
        }

        fn(current, previous);
    });
};

export default listen;
