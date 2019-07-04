start
    = atcomposes

// @composes: "./file.css";
atcomposes
    = source:source {
        return {
            source,
        };
    }
