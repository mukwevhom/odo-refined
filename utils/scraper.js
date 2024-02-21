const puppeteer = require('puppeteer');
const numeral = require('numeral');

const scraper = async (link_url) => {
    try {
        let result;

        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();

        await page.goto(link_url, { waitUntil: 'networkidle2' });
        await page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js'});

       /* const elements = await page.$$('.measure-this');
        let results = [];

        for(let element of elements) {
            const brand = await element.$eval('a div h2:first-of-type', node => node.textContent);
            const name = await element.$eval('a div h2:last-of-type', node => node.textContent);
            const retail = await element.$eval(':scope div[role=group]:has(> h2[aria-label]) h2:last-of-type', node => Number(node.textContent.replace("R","").replace(/(\r\n|\n|\r|,)/gm,"")));
            const price = await element.$eval(':scope div[role=group]:has(> h2[aria-label]) h2.highlightOnHover:first-of-type', node => Number(node.textContent.replace("R","").replace(/(\r\n|\n|\r|,)/gm,"")));
            const savings = await element.$eval('.savings-badge span:last-of-type', node => node.textContent);
            const image = await element.$eval('.image', node => node.src);
            const url = await element.$eval('a', node => node.href);

            results.push({brand, name, retail,price, savings, image, url});
        } */

        result = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".measure-this"))
                .map(product => ({
                    brand: product.querySelector("a div h2:first-of-type") ? product.querySelector("div h2:first-of-type").textContent : "",
                    name: product.querySelector("a div h2:last-of-type") ? product.querySelector("div h2:last-of-type").textContent : "",
                    retail: product.querySelector(':scope div[role=group]:has(> h2[aria-label])') ? numeral(product.querySelector(':scope div[role=group]:has(> h2[aria-label]) h2:last-of-type').textContent.replace("R","").replace(/(\r\n|\n|\r)/gm,"")).value() : "",
                    price: product.querySelector(':scope div[role=group]:has(> h2[aria-label])') ?  numeral(product.querySelector(`:scope div[role=group]:has(> h2[aria-label]) h2:${product.textContent.includes('From') ? 'nth-of-type(2)' : 'first-of-type'}`).textContent.replace("R","").replace(/(\r\n|\n|\r)/gm,"")).value() : "R0",
                    savings: product.querySelector('.savings-badge') ? product.querySelector('.savings-badge span:last-of-type').textContent.includes("R") ? numeral(product.querySelector('.savings-badge span:last-of-type').textContent.replace("R","")).value() : product.querySelector('.savings-badge span:last-of-type').textContent : 0,
                    image: product.querySelector('.image') ? product.querySelector(".image").src : "",
                    url: product.querySelector('a')?.getAttribute('href') ?  product.querySelector('a')?.getAttribute('href') : "",
                    soldout: product.querySelector('.soldOutWrapper') ? true : false
                }));
        });

        await page.close();
        await browser.close();

        return result;
    } catch (err) {
        throw err;
    }
};

module.exports.scraper = scraper;
