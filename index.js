const express = require('express');
const scraper = require('./scraper');
const cron = require("node-cron");
const algoliasearch = require('algoliasearch');
const fetch = require('node-fetch');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const dotenv = require('dotenv');
dotenv.config();

const client = algoliasearch(process.env.APP_ID, process.env.ADMIN_API_KEY);
let index = client.initIndex(process.env.INDEX_NAME);

const app = express();

let sitemap;

app.use('/cdn',express.static('public'));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.locals.page_title = "OdO Refined | Daily Deals";
    res.cookie('_indexName', process.env.DAILY_INDEX_NAME);

    res.render('index');
});

app.get('/clearance', (req, res) => {
    res.locals.page_title = "OdO Refined | Clearance Deals";
    res.cookie('_indexName', process.env.CLEARANCE_INDEX_NAME);

    res.render('clearance');
});

app.get('/about', (req, res) => {
    res.locals.page_title = "OdO Refined | About";

    res.render('about');
});

app.get('/sitemap.xml', function(req, res) {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
    
    // if we have a cached entry send it
    if (sitemap) {
        res.send(sitemap);
        return;
    }

    try {
        const smStream = new SitemapStream({ hostname: 'https://odo-refined.herokuapp.com/' });
        const pipeline = smStream.pipe(createGzip());
    
        smStream.write({ url: '/',  changefreq: 'daily', priority: 0.3 });
        smStream.write({ url: '/clearance',  changefreq: 'daily',  priority: 0.7 });
        smStream.write({ url: '/about',  changefreq: 'monthly',  priority: 0.7});
        smStream.end();
    
        // cache the response
        streamToPromise(pipeline).then(sm => sitemap = sm);
        // stream the response
        pipeline.pipe(res).on('error', (e) => {throw e;});
    } catch (e) {
        res.status(500).end();
    }
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

cron.schedule("2 * * * *", function() {
    console.log("Running");
    fetch(`${process.env.SITE_DOMAIN}/index-daily`)
        .then(response => {
            if(response.status === 200) {

                console.log("Daily Deals Indexing Complete");

                fetch(`${process.env.SITE_DOMAIN}/index-clearance`)
                    .then(response => {
                        if(response.status === 200) {
                            console.log("Clearance Deals Indexing Complete");
                        }
                    })
                    .catch(error => {
                        console.error("Clearance: ",error);
                    });
            }
        })
        .catch(error => {
            console.error("Daily: ",error);
        });
});

app.listen(process.env.PORT,() => console.log(`OdO Refined listening on port ${process.env.PORT}!`));