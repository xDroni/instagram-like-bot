const puppeteer = require('puppeteer-core');

const BASE_URL = 'https://instagram.com/accounts/login/';
const TAG_URL = (tag) => `https://www.instagram.com/explore/tags/${tag}/`;

const instagram = {
    browser: null,
    page: null,

    initialize: async () => {
        instagram.browser = await puppeteer.launch({
            headless: false, //useful for testing or 2 factor auth
            executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        });

        instagram.page = await instagram.browser.newPage();
    },

    login: async (login, password) => {

        await instagram.page.goto(BASE_URL,  { waitUntil: 'networkidle2' });

        /* Set language to English */
        let selectElem = await instagram.page.$('span > select');
        await selectElem.click();
        await selectElem.type('english');
        await instagram.page.keyboard.press('Enter');
        console.log('Language set to English');

        /* Writing the username and password */
        await instagram.page.waitFor('input[name="username"]');
        await instagram.page.type('input[name="username"]', login, { delay: 50 });
        await instagram.page.type('input[name="password"]', password, { delay: 50 });
        await instagram.page.keyboard.press('Enter');
        console.log('Logging in...');

        /* Waiting until my account selector is found */
        await instagram.page.waitFor(`a[href="/${login}/"] > svg`);

        console.log('Logged in successfully');
    },

    likeTagsProcess: async (tags = []) => {

        for(let [index, tag] of tags.entries()) {
            /* Go to the tag page */
            await instagram.page.goto(TAG_URL(tag), { waitUntil: 'networkidle2' });
            await instagram.page.waitFor(1000);

            /** @type {Array} */
            let posts = await instagram.page.$$('article > div:nth-child(3) img');

            for(let i = 0; i < 3; i++) {
                let post = posts[i];

                /* Click on the post */
                await post.click();

                /* Wait for the popup to appear */
                await instagram.page.waitFor('div[role="dialog"]');
                await instagram.page.waitFor(1000);

                /* Click on the like button */
                let isLikable = await instagram.page.$('span[aria-label="Like"]');

                if(isLikable) {
                    await instagram.page.click('span[aria-label="Like"]');
                    console.log(`Liked ${i+1 === 1 ? i+1+'st' : i+1 === 2 ? i+1+'nd' : i+1+'th' } most recent post from tag ${tag}`);
                } else {
                    console.error('Image not likable, maybe liked earlier?');
                }

                await instagram.page.waitFor(3000);

                /* Close the image */
                let closeButton = await instagram.page.$x('//button[contains(text(), "Close")]');
                await closeButton[0].click();

                await instagram.page.waitFor(1000);
            }

            /* Wait 1 minute before going to the next tag */
            if(index < tags.length -1) {
                await instagram.page.waitFor(15000);
            }
        }

        instagram.browser.close();
    }
};

module.exports = instagram;