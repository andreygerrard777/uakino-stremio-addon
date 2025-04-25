
const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
    id: "org.uakino.addon",
    version: "1.0.0",
    name: "UAKINO Addon",
    description: "UAKINO Addon for Stremio",
    types: ["movie"],
    catalogs: [
        {
            type: "movie",
            id: "uakino_catalog"
        }
    ],
    resources: ["catalog"],
    idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(({ type, id }) => {
    if (type === "movie" && id === "uakino_catalog") {
        return Promise.resolve({
            metas: [
                {
                    id: "tt1234567",
                    type: "movie",
                    name: "UAKINO Test Movie",
                    poster: "https://www.example.com/poster.jpg"
                }
            ]
        });
    } else {
        return Promise.reject("No handler for " + JSON.stringify({ type, id }));
    }
});

const express = require("express");
const app = express();

app.get("/manifest.json", (req, res) => {
    res.send(builder.getInterface().getManifest());
});

app.get("/catalog/:type/:id/:extra?.json", (req, res) => {
    builder.getInterface().get("/catalog/:type/:id/:extra?.json", req)
        .then(resp => res.send(resp))
        .catch(err => {
            console.error(err);
            res.status(500).send({ error: "Handler error" });
        });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log("Addon is running on port " + PORT);
});
