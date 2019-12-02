const puppeteer = require('puppeteer');
var mongojs = require('../configDB/db');
db = mongojs.connect;
var convert = require('../lib/convert');


exports.getSelfFacebook = function (callback) {


    (async () => {
        try {
            var browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();
            page.setViewport({ width: 1280, height: 1800 });
            // await page.setRequestInterception(true);
            // page.on('request', (request) => {
            //     if (request.resourceType() === 'image') {
            //         request.abort();
            //     } else {
            //         request.continue();
            //     }
            // });


            // ล็อกอิน

            var random = convert.randomNumber(5);
            await page.waitFor(2000 * random);
            await page.goto("https://www.facebook.com")
            await page.waitForSelector('#email');
            await page.type('#email', 'tthampat3@gmail.com', { delay: 10 });
            await page.type('#pass', 'Tham97531', { delay: 10 });
            await page.click('#loginbutton');
            await page.waitFor(2000);

            await scrolled(page);
            await page.waitFor(4000);
            
            await clickone(page);
            await page.waitFor(2000);

            await scrolled(page);
            await page.waitFor(2000);

        
            // var urlpost = "";
            // for (var index = rowx; index < data.length; index++) {
            //     // var row = data[index];

            //     await page.goto("https://www.facebook.com" + urlpost)

                await clickimg(page);
                await page.waitFor(3000);

            //     // await scrolledcomment(page);
            //     // await page.waitFor(1000);

                await clickimgclose(page);
                await page.waitFor(2000);
                
            //     // page.close();
            // }// ปิด for



            // var blockPage = await page.$("div._3ixn")
            // var blockScrolled = await page.$("div._n9")

            // if (blockPage) {
            //     await page.evaluate((sel) => {
            //         document.querySelector(sel).remove();
            //     }, "div._3ixn")
            // }//endif

            // if (blockScrolled) {
            //     await page.evaluate((sel) => {
            //         document.querySelector(sel).remove();
            //     }, "div._n9")  
            // }//endif

            // await page.waitFor(1000);

            
            await clickmain(page);
            await page.waitFor(2000);

            await scrolled(page)
            await page.waitFor(1000);
            
            callback(null,"test callback");


        } catch (err) {
            console.error("PP ERR : " + err);
            index++;
            // await this.getSinglePostFromScheduling(data, index)
        }//ปิด catch ใหญ่

 
    })();




    async function clickmain(page) {

        const aTags = await page.$('a._19eb')
        if ((aTags) && typeof aTags !== 'undefined' && aTags !== null) {
            await aTags.click('a._19eb')
            await page.waitFor(1000);
            // await clickone(page)
        } else {
            console.log("No Btn More Comment clickmain");
        }
    }
        
    async function clickimg(page) {

        const aTags = await page.$('a.coverWrap')
        if ((aTags) && typeof aTags !== 'undefined' && aTags !== null) {
            await aTags.click('a.coverWrap')
            await page.waitFor(1000);
            // await clickone(page)
        } else {
            console.log("No Btn More Comment clickimg");
        }
    }
        
    async function clickimgclose(page) {

        const aTags = await page.$('a._xlt._418x')
        if ((aTags) && typeof aTags !== 'undefined' && aTags !== null) {
            await aTags.click('a._xlt._418x')
            await page.waitFor(1000);
            // await clickone(page)
        } else {
            console.log("No Btn More Comment clickimg");
        }
    }
        
    async function clickone(page) {

        const aTags = await page.$('a._2s25._606w')
        if ((aTags) && typeof aTags !== 'undefined' && aTags !== null) {
            await aTags.click('a._2s25._606w')
            await page.waitFor(1000);
            // await clickone(page)
        } else {
            console.log("No Btn More Comment Anymore");
        }
    }

    async function scrolledcomment(page) {
        
    }

    async function scrolled(page) {
        try {
            let previousHeight;
            var ii = 1;
            while (ii < 50) {
                previousHeight = await page.evaluate('document.body.scrollHeight');
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
                await page.waitFor(10);
                ii++;
            }
        } catch (e) { }
    }

    
    
    
    
    
    
}   //CLOSE SELECT CAMPAIGN





 