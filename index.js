const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const builder = new addonBuilder({
    id: 'org.uakino.addon',
    version: '1.0.0',
    name: 'UAkino.me',
    description: 'Перегляд фільмів з UAkino.me в Stremio',
    resources: ['catalog', 'stream'],
    types: ['movie'],
    catalogs: [{ type: 'movie', id: 'uakino-catalog', name: 'UAkino.me', extra: [{ name: 'search' }] }],
});

builder.defineCatalogHandler(async ({ extra }) => {
    let searchUrl = 'https://uakino.me/filmy/';
    if (extra.search) {
        searchUrl += `?do=search&subaction=search&story=${encodeURIComponent(extra.search)}`;
    }

    const response = await fetch(searchUrl);
    const body = await response.text();
    const $ = cheerio.load(body);

    const results = [];
    $('.movie-item').each((i, el) => {
        const elem = $(el);
        const name = elem.find('.movie-title').text().trim();
        const idMatch = elem.find('a').attr('href').match(/\/(\d+)-/);
        const id = idMatch ? idMatch[1] : null;
        const poster = elem.find('img').attr('src');

        if (id) {
            results.push({
                id,
                type: 'movie',
                name,
                poster,
            });
        }
    });

    return { metas: results };
});

builder.defineStreamHandler(async ({ id }) => {
    const filmUrl = `https://uakino.me/${id}-film.html`;
    const response = await fetch(filmUrl);
    const body = await response.text();
    const $ = cheerio.load(body);

    const videoSrc = $('iframe').attr('src');

    return {
        streams: videoSrc ? [{ url: videoSrc }] : [],
    };
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
