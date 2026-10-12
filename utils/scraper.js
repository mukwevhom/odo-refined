import puppeteer from 'puppeteer';

const scraper = async (link_url) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    try {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(30_000);
        page.setDefaultTimeout(20_000);

        await page.goto(link_url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.measure-this');

        let previousCount = 0;
        let stablePasses = 0;
        for (let attempt = 0; attempt < 12 && stablePasses < 2; attempt += 1) {
            const productCount = await page.$$eval('.measure-this', products => products.length);
            stablePasses = productCount === previousCount ? stablePasses + 1 : 0;
            previousCount = productCount;

            if (stablePasses < 2) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return await page.evaluate(() => {
            const textOf = (element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
            const amountOf = (text) => {
                const amount = Number(text.replace(/[^\d.-]/g, ''));
                return Number.isFinite(amount) ? amount : 0;
            };

            return Array.from(document.querySelectorAll('.measure-this')).map(product => {
                const headings = Array.from(product.querySelectorAll(
                    ':scope div[role="group"]:has(> h2[aria-label]) > h2'
                ));
                const priceGroup = product.querySelector(
                    ':scope div[role="group"]:has(> h2[aria-label])'
                );
                const priceText = textOf(headings[product.textContent.includes('From') ? 1 : 0]);
                const retailText = textOf(headings.at(-1));
                const savingsText = textOf(
                    product.querySelector('.savings-badge span:last-of-type')
                );
                const image = product.querySelector('.image');
                const imageUrl = image?.currentSrc
                    || image?.getAttribute('src')
                    || image?.getAttribute('data-src')
                    || '';

                return {
                    brand: textOf(product.querySelector('a div h2:first-of-type')),
                    name: textOf(product.querySelector('a div h2:last-of-type')),
                    retail: priceGroup ? amountOf(retailText) : '',
                    price: priceGroup ? amountOf(priceText) : 0,
                    savings: savingsText.includes('%') ? savingsText : amountOf(savingsText),
                    image: imageUrl,
                    url: product.querySelector('a')?.getAttribute('href') ?? '',
                    soldout: Boolean(product.querySelector('.soldOutWrapper'))
                };
            });
        });
    } finally {
        await browser.close();
    }
};

export { scraper };
