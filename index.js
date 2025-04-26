const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

const manifest = {
  id: 'org.uakino.stremio',
  version: '1.0.0',
  name: 'Uakino Add-on',
  description: 'Stremio add-on for uakino.me',
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'series'],
  catalogs: [
    { type: 'movie', id: 'uakino_movies', name: 'Uakino Movies' },
    { type: 'series', id: 'uakino_series', name: 'Uakino Series' }
  ],
  idPrefixes: ['uakino:']
};

const builder = new addonBuilder(manifest);

// Fetch catalog items from uakino.me
builder.defineCatalogHandler(async ({ type }) => {
  const url = 'https://uakino.me/';
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const metas = [];

  $('.movie-list .movie-item').each((i, el) => {
    const title = $(el).find('.caption').text().trim();
    const link = $(el).find('a').attr('href');
    const poster = $(el).find('img').attr('src');
    const metaId = `uakino:${encodeURIComponent(link)}`;
    metas.push({ id: metaId, name: title, poster, type });
  });

  return { metas, cacheMaxAge: 3600 };
});

// Fetch metadata for a given item
builder.defineMetaHandler(async ({ type, id }) => {
  const link = decodeURIComponent(id.replace('uakino:', ''));
  const response = await axios.get(`https://uakino.me${link}`);
  const $ = cheerio.load(response.data);

  const name = $('.movie-title').text().trim();
  const poster = $('.movie-cover img').attr('src');
  const description = $('.description').text().trim();

  return { meta: { id, type, name, poster, description } };
});

// Fetch streams for a given item
builder.defineStreamHandler(async ({ id }) => {
  const link = decodeURIComponent(id.replace('uakino:', ''));
  const response = await axios.get(`https://uakino.me${link}`);
  const $ = cheerio.load(response.data);

  const streams = [];
  $('iframe').each((i, el) => {
    const src = $(el).attr('src');
    streams.push({
      title: `Stream ${i + 1}`,
      url: src,
      externalUrl: src,
      isNative: false
    });
  });

  return { streams };
});

// Serve the add-on
serveHTTP(builder.getInterface(), { port: 7000 });

console.log('Uakino Stremio add-on running on port 7000');
