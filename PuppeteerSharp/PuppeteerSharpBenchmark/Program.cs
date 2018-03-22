using PuppeteerSharp;
using System;
using System.IO;
using System.Threading.Tasks;

namespace PuppeteerSharpBenchmark
{
    class Program
    {
        static void Main(string[] args)
        {
            MainAsync().GetAwaiter().GetResult();
        }

        private static async Task MainAsync()
        {
            await Downloader.CreateDefault().DownloadRevisionAsync(Downloader.DefaultRevision);
            var options = new LaunchOptions
            {
                Headless = true
            };


            var filesToCreate = 10;
            var url = "file:///C:/source/personal/PdfGeneratorsBenchmark/Site/Site.htm";
            var outputFile = Path.Combine(Directory.GetCurrentDirectory(), "output.pdf");

            using (var browser = await Puppeteer.LaunchAsync(options, Downloader.DefaultRevision))
            {
                for (var index = 0; index < filesToCreate; index++)
                {
                    Console.WriteLine("Iteration " + index);

                    using (var page = await browser.NewPageAsync())
                    {
                        await page.GoToAsync(url);
                        await page.PdfAsync(outputFile);
                    }
                }
            }
        }
    }
}
