const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");
const http = require("http");

// === Глобальний перехоплювач помилок ===
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, '💥 reason:', reason);
});

const manifest = {
  id: "org.uakino.addon",
  version: "1.0.1",
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
    console.log("📦 defineCatalogHandler called for:", type, id);
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
    console.log("🧠 defineMetaHandler called for:", id);
    return {
      meta: {
        id,
        type: id.includes("movie") ? "movie" : "series",
        name: id.split(":")[1],
        description: "UAKINO контент",
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
    console.log("📺 defineStreamHandler called for:", id);
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

const PORT = process.env.PORT || 7000;
const iface = builder.getInterface();

http.createServer((req, res) => {
  console.log("🌐 HTTP Request received");
  if (typeof iface.get === "function") {
    iface.get(req, res);
  } else {
    console.error("❌ iface.get is not a function");
    res.writeHead(500);
    res.end("Server error: interface not available");
  }
}).listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Addon running on port " + PORT);
});