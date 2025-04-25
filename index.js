
const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
    id: "org.uakino.test",
    version: "1.0.0",
    name: "UAKINO Test Addon",
    description: "Test addon with hardcoded catalog",
    catalogs: [
        {
            type: "movie",
            id: "uakino",
            name: "UAKINO Test Movies"
        }
    ],
    resources: ["catalog", "stream"],
    types: ["movie"],
    idPrefixes: ["uakino"]
};

const builder = new addonBuilder(manifest);

const sampleMetas = [
    {
        id: "uakino:matrix",
        type: "movie",
        name: "The Matrix",
        poster: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg",
        description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers."
    },
    {
        id: "uakino:inception",
        type: "movie",
        name: "Inception",
        poster: "https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea."
    },
    {
        id: "uakino:interstellar",
        type: "movie",
        name: "Interstellar",
        poster: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    }
];

builder.defineCatalogHandler(({ type, id, extra }) => {
    if (type === "movie" && id === "uakino") {
        return Promise.resolve({ metas: sampleMetas });
    }
    return Promise.resolve({ metas: [] });
});

builder.defineStreamHandler(({ type, id }) => {
    const streams = [
        {
            title: "1080p",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
    ];
    return Promise.resolve({ streams });
});

module.exports = builder.getInterface();
