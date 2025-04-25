
const express = require('express');
const { addonBuilder } = require('stremio-addon-sdk');

const manifest = {
    id: 'org.uakino.addon',
    version: '1.0.0',
    name: 'UAKino',
    description: 'UAKino Stremio Addon',
    resources: ['catalog', 'stream'],
    types: ['movie'],
    catalogs: [
        {
            type: 'movie',
            id: 'uakino_catalog',
            name: 'UAKino Movies'
        }
    ]
};

const builder = new addonBuilder(manifest);

// Обробник для запитів на потік відео
builder.defineStreamHandler(args => {
    return Promise.resolve({
        streams: [
            {
                title: 'Demo Video',
                url: 'https://www.w3schools.com/html/mov_bbb.mp4'
            }
        ]
    });
});

// Обробник для каталогу
builder.defineCatalogHandler(args => {
    return Promise.resolve({
        metas: [
            {
                id: 'movie1',
                type: 'movie',
                name: 'Big Buck Bunny',
                poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/qa6HCwP4Z15l3hpsASz3auugEW6.jpg'
            }
        ]
    });
});

// Експортуємо manifest.json та обробники через HTTP сервер
const app = express();
const port = process.env.PORT || 3000;

// JSON відповіді
app.get('/manifest.json', (req, res) => {
    res.send(builder.getInterface().getManifest());
});

app.get('/catalog/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    const result = await builder.getInterface().get('/catalog', { type, id });
    res.send(result);
});

app.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    const result = await builder.getInterface().get('/stream', { type, id });
    res.send(result);
});

app.listen(port, () => {
    console.log(`Addon is running on port ${port}`);
});
