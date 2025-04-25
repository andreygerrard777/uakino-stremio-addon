const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

const manifest = {
  id: "org.uakino.addon",
  version: "1.0.2",
  name: "UAKINO (unofficial)",
  description: "Україномовні фільми та серіали з uakino.me",
  types: ["movie", "series"],
  catalogs: [
    { type: "movie", id: "uakino-films", name: "UAKINO Фільми" },
    { type: "series", id: "uakino-series", name: "UAKINO Серіали" }
  ],
  resources: ["catalog", "stream", "meta"],
  idPrefixes: ["uakino"]
};

const builder = new addonBuilder(manifest);

async function fetchCatalog(url, type) {
  const metas = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $(".th-item").each((i, el) => {
      const link = $(el).find("a").attr("href");
      const name = $(el).find(".th-title").text().trim();
      const poster = $(el).find("img").attr("src");
      if (link && name && poster) {
        const idMatch = link.match(/\/(\d+)-/);
        const id = idMatch ? idMatch[1] : link;
        metas.push({
          id: `uakino:${id}`,
          type,
          name,
          poster: poster.startsWith("http") ? poster : `https://uakino.me${poster}`
        });
      }
    });
  } catch (e) {
    console.error("fetchCatalog error:", e);
  }
  return metas;
}

builder.defineCatalogHandler(async ({ type, id }) => {
  try {
    if (type === "movie" && id === "uakino-films") {
      const films = await fetchCatalog("https://uakino.me/films/page/1/", "movie");
      return { metas: films };
    }
    if (type === "series" && id === "uakino-series") {
      const series = await fetchCatalog("https://uakino.me/seriesss/page/1/", "series");
      return { metas: series };
    }
  } catch (e) {
    console.error("defineCatalogHandler error:", e);
  }
  return { metas: [] };
});

builder.defineMetaHandler(async ({ id }) => {
  try {
    return {
      meta: {
        id,
        type: id.includes("movie") ? "movie" : "series",
        name: "UAKINO Title",
        description: "Контент з uakino.me",
        poster: "https://uakino.me/favicon.ico"
      }
    };
  } catch (e) {
    console.error("defineMetaHandler error:", e);
    return { meta: {} };
  }
});

builder.defineStreamHandler(async ({ id }) => {
  try {
    const slug = id.replace("uakino:", "");
    return {
      streams: [
        {
          title: "Перегляд через uakino.me",
          externalUrl: `https://uakino.me/${slug}`
        }
      ]
    };
  } catch (e) {
    console.error("defineStreamHandler error:", e);
    return { streams: [] };
  }
});

module.exports = builder.getInterface();