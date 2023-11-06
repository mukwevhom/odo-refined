const algoliasearch = require('algoliasearch');
const scraper = require('../utils/scraper');

const client = algoliasearch(process.env.APP_ID, process.env.ADMIN_API_KEY);

const indexDaily = async (req, res) => {
    try {
        let index = client.initIndex(process.env.DAILY_INDEX_NAME);

        let linkInfo = await scraper.scraper("https://www.onedayonly.co.za/")

        if (linkInfo) {
            await index.clearObjects()

            await index.saveObjects(linkInfo.reverse(), { autoGenerateObjectIDIfNotExist: true })

            res.sendStatus(200)
        } else {
            res.status(500).send("Something went wrong");
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

const indexClearance = async (req, res) => {
    try {
        let index = client.initIndex(process.env.CLEARANCE_INDEX_NAME);

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
