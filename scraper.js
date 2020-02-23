const puppeteer = require('puppeteer');

const scraper = async(link_url) => {
    let result;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(link_url);
    await page.waitFor(1000);

    result = await page.evaluate(() => {
        return Array.from(document.getElementsByClassName("product_block"))
            .map(product => ({
                brand: product.querySelector('.titles .brand') ? product.querySelector('.titles .brand').textContent : "",
                name: product.querySelector('.titles .name') ? product.querySelector('.titles .name').textContent : "",
                retail: product.querySelector('.prices .line_one') ? product.querySelector('.prices .line_one').textContent.replace("Retail: ","").replace(/(\r\n|\n|\r)/gm,"") : "",
                price: product.querySelector('.prices .line_two') ? product.querySelector('.prices .line_two').textContent.replace(/(\r\n|\n|\r)/gm,"") : "R0",
                savings: product.querySelector('.savings .amount') ? product.querySelector('.savings .amount').textContent : 0,
                image: product.querySelector('img.image') ? product.querySelector('img.image').getAttribute('src') : "",
                url: product.querySelector('.new_product_block')?  product.querySelector('.new_product_block').getAttribute('href') : "",
                soldout: product.querySelector('.sold_out') ? true : false
            }));
    });

    browser.close();

    return result;
};

module.exports.scraper = scraper;