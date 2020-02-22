const express = require('express');
const scraper = require('./scraper');

const app = express();

app.get('/', (req, res) => {
    let linkInfo = new Promise((resolve, reject) => {
        scraper.scraper()
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });

    linkInfo.then(response => {
        res.status(200).type('json').send(response);
    }).catch(err => res.status(500).send(err));
    
});

app.listen(process.env.PORT || 3000);