const puppeteer = require('puppeteer');
const numeral = require('numeral');

const scraper = async(link_url) => {
    let result;

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();

    await page.goto(link_url);
    await page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js'});
    await page.waitForTimeout(10000);

    result = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".gallery-item:not([target='_blank'])"))
            .map(product => ({
                brand: product.querySelector("div h2:first-of-type") ? product.querySelector("div h2:first-of-type").textContent : "",
                name: product.querySelector("div h2:last-of-type") ? product.querySelector("div h2:last-of-type").textContent : "",
                retail: product.querySelector(':scope > div:last-of-type') ? numeral(product.querySelector(':scope > div:last-of-type h2:last-of-type').textContent.replace("R","").replace(/(\r\n|\n|\r)/gm,"")).value() : "",
                price: product.querySelector(':scope > div:last-of-type') ?  numeral(product.querySelector(`:scope > div:last-of-type h2:${product.textContent.includes('From') ? 'nth-of-type(2)' : 'first-of-type'}`).textContent.replace("R","").replace(/(\r\n|\n|\r)/gm,"")).value() : "R0",
                savings: product.querySelector('.savings-badge') ? product.querySelector('.savings-badge span:last-of-type').textContent.includes("R") ? numeral(product.querySelector('.savings-badge span:last-of-type').textContent.replace("R","")).value() : product.querySelector('.savings-badge span:last-of-type').textContent : 0,
                image: product.querySelector('.image.product-image') ? getComputedStyle(product.querySelector(".image.product-image")).backgroundImage.split('"')[1] : "",
                url: product.getAttribute('href') ?  product.getAttribute('href') : "",
                soldout: product.querySelector('.soldOutWrapper') ? true : false
            }));
    });

    await page.close();
    await browser.close();

    return result;
};

module.exports.scraper = scraper;