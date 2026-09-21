const https = require('https');
const fs = require('fs');

const enPerks = require('./en_perks.json');
const enNames = Object.values(enPerks).map(p => p.name);

const perkDict = {};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function scrape() {
  try {
    console.log('Fetching language links for ' + enNames.length + ' perks...');
    const batchSize = 50;
    for (let i = 0; i < enNames.length; i += batchSize) {
      const batch = enNames.slice(i, i + batchSize);
      const titles = batch.map(encodeURIComponent).join('|');
      const apiUrl = `https://deadbydaylight.fandom.com/api.php?action=query&prop=langlinks&titles=${titles}&lllang=pt-br&format=json`;
      
      const data = await fetchJson(apiUrl);
      const pages = data.query.pages;
      
      for (const pageId in pages) {
        const page = pages[pageId];
        const enTitle = page.title;
        if (page.langlinks && page.langlinks.length > 0) {
          const ptTitle = page.langlinks[0]['*'];
          perkDict[enTitle] = ptTitle;
        }
      }
    }
    
    fs.writeFileSync('perk_mapping.json', JSON.stringify(perkDict, null, 2));
    console.log(`Saved mapping with ${Object.keys(perkDict).length} perks.`);
    
  } catch (e) {
    console.error('Error:', e);
  }
}

scrape();
