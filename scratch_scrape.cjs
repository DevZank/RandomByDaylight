const fs = require('fs');
const https = require('https');

// We will query the English wiki to get a list of all perks, then Fandom's interlanguage links or NightLight
// Alternatively, let's use the DBD API from https://dbd.tricky.lol/api/perks?lang=pt
https.get('https://dbd.tricky.lol/api/perks?lang=pt', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const ptPerks = JSON.parse(data);
      fs.writeFileSync('pt_perks.json', JSON.stringify(ptPerks, null, 2));
      console.log('Saved pt_perks.json, keys: ' + Object.keys(ptPerks).length);
    } catch(e) {
      console.log('Failed to parse pt perks: ' + e);
      console.log(data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.log('Error: ' + e);
});

https.get('https://dbd.tricky.lol/api/perks?lang=en', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const enPerks = JSON.parse(data);
      fs.writeFileSync('en_perks.json', JSON.stringify(enPerks, null, 2));
      console.log('Saved en_perks.json, keys: ' + Object.keys(enPerks).length);
    } catch(e) {
      console.log('Failed to parse en perks: ' + e);
    }
  });
});
