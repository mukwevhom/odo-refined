const express = require('express');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');

const router = express.Router();

let sitemap;

router.use(function (req, res, next) {
    next()
})

router.get('/', (req, res) => {
    res.locals.page_title = "OdO Refined | Daily Deals";
    res.cookie('_indexName', process.env.DAILY_INDEX_NAME);

    res.render('index');
});

router.get('/clearance', (req, res) => {
    res.locals.page_title = "OdO Refined | Clearance Deals";
    res.cookie('_indexName', process.env.CLEARANCE_INDEX_NAME);

    res.render('clearance');
});

router.get('/about', (req, res) => {
    res.locals.page_title = "OdO Refined | About";

    res.render('about');
});

router.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
    
    // if we have a cached entry send it
    if (sitemap) {
        res.send(sitemap);
        return;
    }

    try {
        const smStream = new SitemapStream({ hostname: 'https://odo-refined.onrender.com/' });
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

module.exports = router;
