const express = require('express');
const scraper = require('./scraper');
const cron = require("node-cron");
const algoliasearch = require('algoliasearch');
const sass = require('node-sass');
const numeral = require('numeral');
const dotenv = require('dotenv');
dotenv.config();

const client = algoliasearch(process.env.APP_ID, process.env.ADMIN_API_KEY);
let index = client.initIndex(process.env.INDEX_NAME);

const app = express();

app.use('/cdn',express.static('public'));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.locals.page_title = "OdO Refine | Daily Deals";
    res.cookie('_indexName', process.env.DAILY_INDEX_NAME);

    res.render('index');
});

app.get('/clearance', (req, res) => {
    res.locals.page_title = "OdO Refine | Clearance Deals";
    res.cookie('_indexName', process.env.CLEARANCE_INDEX_NAME);

    res.render('clearance');
});

app.get('/index-daily', (req, res) => {
    index = client.initIndex(process.env.DAILY_INDEX_NAME);

    let linkInfo = new Promise((resolve, reject) => {
        scraper.scraper("https://www.onedayonly.co.za/")
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });

    linkInfo.then(response => {
        index.clearObjects()
            .then(() => {

                index.saveObjects(response.reverse(), { autoGenerateObjectIDIfNotExist: true })
                    .then(() => {
                        res.sendStatus(200);
                    }).catch(err => {
                        res.status(500).send(err);
                    });

            }).catch(err => {
                res.status(500).send(err);
            });
        // res.status(200).type('json').send(response);
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get('/index-clearance', (req, res) => {
    index = client.initIndex(process.env.CLEARANCE_INDEX_NAME);

    let linkInfo = new Promise((resolve, reject) => {
        scraper.scraper("https://www.onedayonly.co.za/shop/bargain-bin.html")
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });

    linkInfo.then(response => {
        index.clearObjects()
            .then(() => {

                index.saveObjects(response.reverse(), { autoGenerateObjectIDIfNotExist: true })
                    .then(() => {
                        res.sendStatus(200);
                    }).catch(err => {
                        res.status(500).send(err);
                    });

            }).catch(err => {
                res.status(500).send(err);
            });
        // res.status(200).type('json').send(response);
    }).catch(err => {
        res.status(500).send(err);
    });
});

/* cron.schedule("* * * * *", function() {
    console.log("running a task every minute");
}); */

app.listen(process.env.PORT,() => console.log(`OdO Refined listening on port ${process.env.PORT}!`));