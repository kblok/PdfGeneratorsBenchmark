const puppeteer = require("puppeteer");
const filesToCreate = 10;
const url = "file:///C:/source/personal/PdfGeneratorsBenchmark/Site/Site.htm";
const outputFile = __dirname + '/output.pdf';

( async () =>
{
    const browser = await puppeteer.launch({ headless: true });

    for(let index = 0; index < filesToCreate; index++)
    {
        console.log("Iteration " + index);
        let page = await browser.newPage();
        await page.goto(url);
        await page.pdf({
            path: outputFile,
            printBackground: true
        });
        await page.close();
    }

    await browser.close();
})();
