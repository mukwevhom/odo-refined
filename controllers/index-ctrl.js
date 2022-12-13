const algoliasearch = require('algoliasearch');
const scraper = require('../utils/scraper');

const client = algoliasearch(process.env.APP_ID, process.env.ADMIN_API_KEY);

let index = client.initIndex(process.env.INDEX_NAME);

const indexDaily = (req, res) => {
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
    }).catch(err => {
        res.status(500).send(err);
    });
}

const indexClearance = (req, res) => {
    index = client.initIndex(process.env.CLEARANCE_INDEX_NAME);

    let linkInfo = new Promise((resolve, reject) => {
        scraper.scraper("https://www.onedayonly.co.za/clearance-sale")
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
    }).catch(err => {
        res.status(500).send(err);
    });
}

module.exports = {
    indexDaily,
    indexClearance
}