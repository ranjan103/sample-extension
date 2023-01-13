const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const { constants } = require("../constant");
const { window } = new JSDOM();

async function scrapeYelp()  {
  const location = document.getElementById('location').value;
  // Record start time for performance analysis
  const start = window.performance.now();

  // Launch a new browser instance
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();
  let pageCounter = 1;

  // Initialize array to store extracted data
  let restaurants = [];

  // Scrape data while pageCounter is less than or equal to the max number of pages
  while (pageCounter <= constants.max_page_count) {
    // Construct the URL for searching for Italian restaurants in the given location
    let url = constants.url
      .replace("${location}", location)
      .replace("${pageCounter}", pageCounter);

    // Navigate to the URL
    await page.goto(url, { waitUntil: "load", timeout: 0 });

    // Extract the text content of elements that match the CSS selector
    const newRestaurants = await page.$$eval(".css-1agk4wl", (elements) =>
      elements.map((el) => el.innerText)
    );
    restaurants = [...restaurants, ...newRestaurants];

    for (const restaurant of newRestaurants) {
      fs.appendFile(
        "./../result.csv",
        `${restaurant.replace(/^[0-9]+/, "").replace(". ", "").replace(",", "\n")}\n`,
        function (err) {
          if (err) {console.log(err); throw err;}
        }
      );
    }
    pageCounter++;
  }

  // Close the browser
  await browser.close();

  // Record end time for performance analysis
  const end = window.performance.now();
  console.log(`Execution time: ${end - start} ms`);

  // Return the extracted data
  return restaurants;
};

module.exports = { scrapeYelp };
