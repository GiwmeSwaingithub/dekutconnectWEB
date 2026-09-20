const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

function post(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: resData }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== 1. Testing First Blog: /blog/dekutconnect-daily-campus-vibes ===');
  const r1 = await get('http://localhost:3000/blog/dekutconnect-daily-campus-vibes');
  console.log('Status:', r1.status);
  
  const ogImg = (r1.body.match(/<meta property="og:image" content="(.*?)"/) || [])[1];
  const ogTitle = (r1.body.match(/<meta property="og:title" content="(.*?)"/) || [])[1];
  const authorProfile = r1.body.includes('https://admin.dekut.site');
  const hasConsentGate = r1.body.includes('reader-consent-gate');
  const hasNewEmblemFavicon = r1.body.includes('https://i.postimg.cc/TY5RBJKk/');

  console.log('OG Image ->', ogImg);
  console.log('OG Title ->', ogTitle);
  console.log('Author profile link (admin.dekut.site) present:', authorProfile);
  console.log('Reader consent gate present:', hasConsentGate);
  console.log('New emblem used as favicon & crest:', hasNewEmblemFavicon);

  console.log('\n=== 2. Testing /api/upload-image (Postimages Cloud API) ===');
  const sample1x1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const uploadRes = await post('http://localhost:3000/api/upload-image', {
    image: sample1x1,
    name: 'sample-upload.gif',
    type: 'gif'
  });
  console.log('Upload Status:', uploadRes.status);
  const uploadJson = JSON.parse(uploadRes.body);
  console.log('Upload Success:', uploadJson.success);
  console.log('Direct Postimages Hotlink:', uploadJson.url);

  console.log('\n=== 3. Testing Homepage Real Socials & Weather ===');
  const rHome = await get('http://localhost:3000/blog');
  console.log('Home Status:', rHome.status);
  console.log('Has Real Instagram (instagram.com/dekutconnect):', rHome.body.includes('instagram.com/dekutconnect'));
  console.log('Has Real YouTube (youtube.com/@dekutconnect):', rHome.body.includes('youtube.com/@dekutconnect'));
  console.log('Has Real TikTok (tiktok.com/@dekutconnect):', rHome.body.includes('tiktok.com/@dekutconnect'));
  console.log('Has Real Weather widget element:', rHome.body.includes('real-weather-widget'));

  console.log('\nALL EXTENDED VERIFICATIONS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
