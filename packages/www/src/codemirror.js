import loadcss from "lazyload-css";

const codemirror = async () => {
    const [ , , CodeMirror ] = await Promise.all([
        loadcss("https://unpkg.com/codemirror@5.42.2/lib/codemirror.css"),
        loadcss("https://unpkg.com/codemirror@5.42.2/theme/mdn-like.css"),
        import("codemirror"),
    ]);

    return CodeMirror.default;
};

export default codemirror;
