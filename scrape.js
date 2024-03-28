const http = require("http");
const host = 'localhost';
const port = 8000;

const axios = require('axios');
const cheerio = require('cheerio');

const fs = require('fs');
const csv = require('csv-parser');
const xml2js = require('xml2js');
const puppeteer = require('puppeteer');

const uniqueWebsites = new Set();
let robotsTxt1 = '';





const locationName = [];
const streetAddress = [];
const city = [];
const state = [];
const postalCode = [];
const phoneNumber = [];
const storeID = [];
const url1 = [];

const siteMap = 'https://lamadeleine.com/restaurant_locations-sitemap.xml'

async function fetchAndParseXml(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      // Fetch XML data from the URL
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const response = await axios.get(url);
      const xmlData = response.data;
  
      // Parse the XML content
      const parsedData = await xml2js.parseStringPromise(xmlData);
      const urls = parsedData.urlset.url;
      return urls;
      // Extract information from the parsed XML object (parsedData)
    //   const locations = parsedData.urlset.url.map(url => url.loc);
    //   return locations;
      // Display the extracted information
    //   console.log(locations);
    } catch (error) {
      console.error('Error fetching or parsing XML:', error);
      return [];
    }
  }


const fetchHTML = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Wait for the dynamic content to load (adjust wait time as needed)
    try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    
        // Check if the response status is 404 (Not Found)
        if (response && response.status() === 404) {
            console.error('Error: Page not found (404)');
            return '<html><body><h1>404 Not Found</h1></body></html>'; // Return simple HTML content
        }
        else{
            console.log(url)
            await page.waitForSelector('div.information__head', { timeout: 1000 }); // Adjust timeout as needed
        
            const htmlContent = await page.evaluate(() => document.body.outerHTML);
        
            const $ = cheerio.load(htmlContent);
        
            locationName.push($('div.information__head h1').text());
            streetAddress.push($('div.address__line__1').text().split(', ')[0]);
            city.push($('div.address__line__3').text().split(', ')[0].split(' ').pop());
            state.push($('div.address__line__3').text().split(', ')[1].split(' ')[0]);
            postalCode.push($('div.address__line__3').text().split(', ')[1].split(' ')[1]);
            phoneNumber.push($('div.telephone').text());
            storeID.push($('div.address__line__1').text());
            url1.push(url)
        

 
            
            return $;

        }
    
        // Wait for the specific element(s) to appear on the page within a timeout
    } catch (error) {
        
        return ''; // Return an empty string or handle the error as needed
    }
    finally {
        await browser.close();
    }
};



async function fetchLocAndHTML() {
    try {
      const locList = await fetchAndParseXml(siteMap);
      const testList =  [locList[0], locList[1]]; 
      for (const urlObj of locList) {
            if (urlObj == locList[7]){
                console.log(urlObj.loc)
                break;
            }
            robotsTxt1 = fetchHTML(urlObj.loc[0]);
            } 
            console.log(phoneNumber)
    } catch (error) {
      console.error('Error fetching loc and HTML:', error);
    }
}
async function fetchLocAndHTML() {
    try {
        const locList = await fetchAndParseXml(siteMap);
        const testList = [locList[0], locList[1]]; 

        for (const urlObj of locList) {
            await fetchHTML(urlObj.loc[0]); // Wait for each URL to be processed
        }


        let data = locationName.map((_, index) => ({
            locationName: locationName[index],
            streetAddress: streetAddress[index],
            city: city[index],
            state: state[index],
            postalCode: postalCode[index],
            phoneNumber: phoneNumber[index],
            storeID: storeID[index],
            url: url1[index]
        }));
         
        let csv = 'locationName,streeeAddress,sity,state,postalCode,phoneNumber,storeID,url\n';
        data.forEach(item => {
        csv += `${item.locationName},${item.streetAddress},${item.city},${item.state},${item.postalCode},${item.phoneNumber},${item.storeID},${item.url}\n`;
});

// Write CSV data to a file
    fs.writeFile('pull_data.csv', csv, err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Data written to store_data.csv');
        });
        fs.writeFile('pull_data_withUrl.csv', csv, err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Data written to store_data.csv');
        });
    } catch (error) {
        console.error('Error fetching loc and HTML:', error);
    }
}
    

fetchLocAndHTML()

fs.createReadStream('technicalAssessment-GoogleReviews.csv')
      .pipe(csv())
      .on('data', (data) => {
        const website = data['website']; // Assuming 'Website' is the column header
        if (website && !uniqueWebsites.has(website)) {
          uniqueWebsites.add(website);
        }
      });
const requestListener = function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(`<html>
    <body>
    <h1>This is HTML</h1>
    <pre><plaintext>${robotsTxt1}</pre>
    </body>
    </html>`);
};


const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

