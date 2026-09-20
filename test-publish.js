const http = require('http');

function post(url, headers, data) {
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
        'Content-Length': Buffer.byteLength(postData),
        ...headers
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

async function testPublishing() {
  console.log('Testing Article Publishing POST /api/posts...');
  const res = await post('http://localhost:3000/api/posts', {
    'X-Admin-Auth': 'dk_admin_test_token_123'
  }, {
    title: 'Test Article Title',
    slug: 'test-article-title',
    excerpt: 'Test excerpt text',
    category: 'Campus & Tech',
    content: 'Full article body content'
  });

  console.log('Response Status:', res.status);
  console.log('Response Body:', res.body);
}

testPublishing().catch(console.error);
