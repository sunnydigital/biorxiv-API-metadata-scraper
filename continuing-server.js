const axios = require('axios');
const JSON = require('json5'); // For JSON serialization with indentation
const Rollbar = require('rollbar')
const rollbar = new Rollbar({
  accessToken: 'ac7359bdcf51421b9738b02013f1b18b',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

function getLastAvailableDate() {
  /**
   * Function to automatically obtain the last available date of the data and return it
   * @return {Date} The last available date of the data
   */

  const fs = require('fs'); // Import the filesystem module

  const maxYear = Math.max(...fs.readdirSync('./full-dict').map(Number)); // Get last year
  const maxMonth = Math.max(...fs.readdirSync(`./full-dict/${maxYear}`).map(Number)); // Get last month
  const lastDate = fs.readdirSync(`./full-dict/${maxYear}/${maxMonth}`).slice(-1)[0].slice(0, -5); // Get last date from the file

  const [year, month, day] = lastDate.split('-').map(Number); // Assuming the date format is YYYY-MM-DD, split the string to get year, month, and day

  return new Date(year, month - 1, day); // Return a Date object (months are 0-indexed)
}

function updateReturnDict(articles, curDate) {
/*
    * Processes articles for a specific date, checking for existing DOIs and adding/updating license keys.
    * @param {Object} articles - The article data with a "collection" property.
    * @param {string} curDate - The current date as a string.
    */

curDate = String(curDate);
articles = articles.collection;

for (const article of articles) {
    // Update license counts (default to 0 if license key doesn't exist)
    return_dict.license[article.license] = (return_dict.license[article.license] || 0) + 1;

    // Add/update article content for the DOI
    return_dict.content[article.doi] = {
    date: article.date,
    license: article.license,
    jatsxml: article.jatsxml,
    };
}
}

function updateFullDictByDate(articles, curDate) {
/*
    * Updates a dictionary by adding a list of DOIs for a specific date as the value.
    * @param {Object} articles - The article data with a "collection" property.
    * @param {string} curDate - The current date as a string in YYYY-mm-dd format.
    */

curDate = String(curDate);
articles = articles.collection;

full_dict_by_date[curDate] = articles.map(item => ({
    doi: item.doi,
    license: item.license,
}));
}

const path = require('path');

function getDatedSubfolders(date) {
  /*
   * Creates subfolders for the day, month, and year of the given date.
   * @param {Date} date - The date object.
   * @returns {string} The full path to the created folder representing the current date.
   */

  const month = date.getMonth() + 1; // Months are 0-indexed in JS
  const year = date.getFullYear();

  const mainFolder = path.join(__dirname, 'full-dict');

  const yearFolder = path.join(mainFolder, String(year));
  try {
    fs.mkdirSync(yearFolder, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error; // Re-throw non-existence errors
    }
  }

  const monthFolder = path.join(yearFolder, String(month));
  try {
    fs.mkdirSync(monthFolder, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error; // Re-throw non-existence errors
    }
  }

  return monthFolder;
}

function splitDates(dates, numSplits = 1) {
    /*
     * Splits a list of dates into sub-lists with an optional number of splits.
     * @param {Date[]} dates - An array of date objects.
     * @param {number} [numSplits=1] - The desired number of sub-lists (default: 1).
     * @returns {Date[][] | Date[]} An array of sub-lists or individual dates.
     */
  
    if (numSplits < 1) {
      throw new Error('Number of splits must be a positive integer.');
    }
  
    if (numSplits > dates.length) {
      return dates; // Return individual dates if splits exceed list length
    }
  
    const sliceSize = Math.ceil(dates.length / numSplits); // Calculate slice size for equal distribution
    return Array.from({ length: numSplits }, (_, i) => dates.slice(i * sliceSize, (i + 1) * sliceSize));
  }

  const path = require('path');
  const fs = require('fs');
  
  function getSplitFolder(splitNum) {
    /*
     * Creates a folder for the given split number, ensuring parent directories exist.
     * @param {number} splitNum - The split number for the folder name.
     * @returns {string} The full path to the created or existing split folder.
     */
  
    const mainFolder = path.join(__dirname, 'output_dicts');
  
    try {
      fs.mkdirSync(mainFolder, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error; // Re-throw non-existence errors
      }
    }
  
    const splitFolder = path.join(mainFolder, String(splitNum));
    try {
      fs.mkdirSync(splitFolder, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error; // Re-throw non-existence errors
      }
    }
  
    return splitFolder;
  }

  const fs = require('fs');
  const path = require('path');
  const https = require('https'); // Assuming requests use HTTPS, adjust for HTTP if needed
  const { parse } = require('date-fns'); // For date parsing and manipulation
  
  function processBioRxiv(
    startDate = new Date(2013, 0, 1), // Default start date (Jan 1, 2013)
    endDate = new Date(), // Default end date (today)
    loadDicts = false,
    delay = 5,
    ...kwargs
  ) {
    /*
     * Processes BioRxiv data for a date range, handles loading/saving dictionaries, and sleeps between requests.
     * @param {Date} [startDate=new Date(2013, 0, 1)] - Beginning date (YYYY-MM-DD).
     * @param {Date} [endDate=new Date()] - End date (YYYY-MM-DD).
     * @param {boolean} [loadDicts=false] - Whether to load pre-existing dictionaries.
     * @param {number} [delay=5] - Delay (seconds) between API requests.
     * @returns {void}
     */
  
    // Global variables (adjusted for Node.js scope)
    let fullDictByDate = {};
    let returnDict = {
      license: {},
      content: {},
    };
  
    // Get split folder (assuming SELECTED_NUMBER is defined elsewhere)
    const splitFolder = getSplitFolder(SELECTED_NUMBER);
  
    // Load dictionaries if specified
    if (loadDicts) {
      try {
        fullDictByDate = JSON.parse(
          fs.readFileSync(path.join(splitFolder, 'full_dict_by_date.json'), 'utf8')
        );
        returnDict = JSON.parse(
          fs.readFileSync(path.join(splitFolder, 'return_dict.json'), 'utf8')
        );
  
        // Update start date if not the first date
        if (Object.keys(fullDictByDate).length > 0) {
          startDate = new Date(
            Object.keys(fullDictByDate).sort().pop()
          );
          startDate.setDate(startDate.getDate() + 1); // Add 1 day
        }
      } catch (error) {
        console.error('Error loading dictionaries:', error);
      }
    }
  
    // Generate list of dates
    const dates = [];
    for (let i = 0; i <= (endDate - startDate) / (1000 * 60 * 60 * 24); i++) {
      dates.push(new Date(startDate.getTime() + i * (1000 * 60 * 60 * 24)));
    }
  
    for (const curDate of dates) {
      let flag = true;
      let numSkip = 0;
  
      while (flag) {
        const curDateDir = getDatedSubfolders(curDate);
  
        const url = `https://api.biorxiv.org/details/biorxiv/<span class="math-inline">\{curDate\.toISOString\(\)\.slice\(0, 10\)\}/</span>{curDate.toISOString().slice(0, 10)}/${numSkip}`;
  
        https.get(url, (response) => {
          if (response.statusCode !== 200) {
            console.error('Error fetching data:', response.statusCode);
            return;
          }
  
          response.on('data', (chunk) => {
            data += chunk;
          });
  
          response.on('end', () => {
            try {
              const articles = JSON.parse(data);
  
              if (articles['messages'][0]['status'] !== 'ok') {
                flag = false;
                return;
              }
  
              updateFullDictByDate(articles, curDate);
              updateReturnDict(articles, curDate);
  
              // Save full_dict_by_date.json
              fs.writeFileSync(
                path.join(splitFolder, 'full_dict_by_date.json'),
                JSON.stringify(fullDictByDate, null, 2)
              );
  
              // Save return_dict.json
              fs.writeFileSync(
                path.join(splitFolder, 'return_dict.json'),
                JSON.stringify(returnDict, null, 2)
              );
  
              // Save daily articles as JSON
              fs.writeFileSync(
                path.join(curDateDir, curDate.toISOString().slice(0, 10) + '.json'),
                JSON.stringify(articles['collection'], null, 2)
              );
  
              console.log('='.repeat(50));
              console.log('Processed date:', curDate, 'with', articles['collection'].length, 'articles');
              console.log(`Sleeping for ${delay} second(s)... Zzz...`);
              console.log('='.repeat(50));
  
              setTimeout(() => {
                numSkip += 100;
                flag = true; // Reset flag for next iteration
              }, delay * 1000); // Delay in milliseconds
            } catch (error) {
              console.error('Error processing data:', error);
            }
          });
        }).on('error', (error) => {
          console.error('Error making request:', error);
        });
  
        let data = ''; // Buffer for incoming data from the response
      }
    }
  }
  
// Constant for the number of splits
const DO_NOT_CHANGE_FLAG = 10;

