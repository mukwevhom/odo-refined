import puppeteer from 'puppeteer';

const scraper = async (link_url) => {
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

        result = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".measure-this"))
                .map(product => ({
                    brand: product.querySelector("a div h2:first-of-type") ? product.querySelector("div h2:first-of-type").textContent : "",
                    name: product.querySelector("a div h2:last-of-type") ? product.querySelector("div h2:last-of-type").textContent : "",
                    retail: product.querySelector(':scope div[role=group]:has(> h2[aria-label])') ? Number(product.querySelector(':scope div[role=group]:has(> h2[aria-label]) h2:last-of-type').textContent.replace("R","").replace(/(\r\n|\n|\r)/gm,"")) : "",
                    price: product.querySelector(':scope div[role=group]:has(> h2[aria-label])') ?  Number(product.querySelector(`:scope div[role=group]:has(> h2[aria-label]) h2:${product.textContent.includes('From') ? 'nth-of-type(2)' : 'first-of-type'}`).textContent.replace("R","").replace(/(\r\n|\n|\r)/gm,"")) : "R0",
                    savings: product.querySelector('.savings-badge') ? product.querySelector('.savings-badge span:last-of-type').textContent.includes("R") ? Number(product.querySelector('.savings-badge span:last-of-type').textContent.replace("R","")) : product.querySelector('.savings-badge span:last-of-type').textContent : 0,
                    image: product.querySelector('.image') ? product.querySelector(".image").src : "",
                    url: product.querySelector('a')?.getAttribute('href') ?  product.querySelector('a')?.getAttribute('href') : "",
                    soldout: product.querySelector('.soldOutWrapper') ? true : false
                }));
        });

        await page.close();
        await browser.close();

        return result;
};

export { scraper };
