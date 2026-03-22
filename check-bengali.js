import https from 'https';
https.get('https://bible-api.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(data.toLowerCase().includes('bengali') ? 'Bengali found' : 'Bengali not found');
    const matches = data.match(/<td>(.*?)<\/td>/g);
    if(matches) console.log(matches.join('\n'));
  });
});
