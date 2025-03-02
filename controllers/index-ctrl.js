import { algoliasearch } from 'algoliasearch';
import { scraper } from '../utils/scraper.js';

const client = algoliasearch(process.env.APP_ID, process.env.ADMIN_API_KEY);

const indexDaily = async (req, res, next) => {
    try {
        let linkInfo = await scraper("https://www.onedayonly.co.za/")

        if (linkInfo) {
            await client.clearObjects({ indexName: process.env.DAILY_INDEX_NAME })

            await client.saveObjects({ indexName: process.env.DAILY_INDEX_NAME, objects: linkInfo.toReversed()}, {autoGenerateObjectIDIfNotExist: true })

            res.sendStatus(200)
        } else {
            res.status(500).send("Something went wrong");
        }
    } catch (err) {
        next(err);
    }
}

const indexClearance = async (req, res, next) => {
    try {
        let linkInfo = await scraper("https://www.onedayonly.co.za/clearance-sale")

        if (linkInfo) {
            await client.clearObjects({ indexName: process.env.CLEARANCE_INDEX_NAME })

            await client.saveObjects({ indexName: process.env.CLEARANCE_INDEX_NAME, objects: linkInfo.toReversed()}, { autoGenerateObjectIDIfNotExist: true })

            res.sendStatus(200)
        } else {
            res.status(500).send("Something went wrong");
        }
    } catch (err) {
        next(err);
    };
}

export {
    indexDaily,
    indexClearance
}
