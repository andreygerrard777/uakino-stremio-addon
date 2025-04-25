
const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
    id: "org.uakino.addon",
    version: "1.0.0",
    name: "UAKINO Addon",
    description: "UAKINO Addon for Stremio",
    resources: ["catalog", "stream"],
    types: ["movie"],
    catalogs: [
        {
            type: "movie",
            id: "uakino_catalog",
            name: "UAKINO Movies"
        }
    ],
    idPrefixes: ["uakino"]
};

const builder = new addonBuilder(manifest);

// Простий приклад каталогу з одним фільмом
builder.defineCatalogHandler(({ type, id }) => {
    if (type === "movie" && id === "uakino_catalog") {
        return Promise.resolve({
            metas: [{
                id: "uakino:movie1",
                name: "The Matrix",
                type: "movie",
                poster: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg",
                description: "A computer hacker learns about the true nature of his reality."
            }]
        });
    }
    return Promise.resolve({ metas: [] });
});

// Проста видача потоку для фільму
builder.defineStreamHandler(({ type, id }) => {
    if (type === "movie" && id === "uakino:movie1") {
        return Promise.resolve({
            streams: [{
                title: "1080p",
                url: "https://archive.org/download/TheMatrix1999_201905/TheMatrix1999.mp4"
            }]
        });
    }
    return Promise.resolve({ streams: [] });
});

module.exports = builder.getInterface();
