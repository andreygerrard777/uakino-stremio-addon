const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
  id: "uakino",
  version: "1.0.0",
  name: "UAKINO Addon",
  description: "UAKINO Addon for Stremio",
  types: ["movie"],
  catalogs: [
    {
      type: "movie",
      id: "uakino_catalog",
      name: "UAKINO Movies",
      extra: [{ name: "search" }]
    }
  ],
  resources: ["catalog"],
  idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(args => {
  return Promise.resolve({ metas: [] }); // Поки пуста видача
});

const addonInterface = builder.getInterface();

serveHTTP(addonInterface, { port: process.env.PORT || 10000 });