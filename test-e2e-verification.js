require('dotenv').config();
const https = require('https');
const fs = require('fs');

async function runVerification() {
  console.log('=== STEP 1: Admin Firebase Authentication ===');
  const loginRes = await new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'admin@dekut.admin.site',
      password: '0711660741@Aa',
      returnSecureToken: true
    });
    const req = https.request('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB7pfbXBZTPfQYkwJhZx7-p2S9-9flhdE8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b)));
    });
    req.write(postData);
    req.end();
  });

  if (!loginRes.idToken) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes));
  }
  const token = loginRes.idToken;
  console.log('Admin authenticated successfully! UID:', loginRes.localId);

  console.log('\n=== STEP 2: Upload Sample Video to Cloudflare R2 (axtra) ===');
  const sampleVideoData = Buffer.from('TEST_VIDEO_STREAM_MP4_PAYLOAD_' + Date.now()).toString('base64');
  const videoUploadRes = await new Promise((resolve) => {
    const postData = JSON.stringify({
      fileData: sampleVideoData,
      fileName: 'dekut_engineering_showcase_' + Date.now() + '.mp4',
      mimeType: 'video/mp4',
      isVideo: true
    });
    const req = https.request('https://dekutconnect.vercel.app/api/upload-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b) }));
    });
    req.write(postData);
    req.end();
  });

  console.log('Video Upload Status:', videoUploadRes.status, 'Data:', videoUploadRes.data);
  const videoUrl = videoUploadRes.data.url;
  const fullVideoUrl = videoUrl.startsWith('http') ? videoUrl : 'https://dekutconnect.vercel.app' + videoUrl;

  console.log('\n=== STEP 3: Create Video Article in Firebase Firestore ===');
  const videoArticle = {
    id: 'dekut-engineering-and-tech-hub-launch',
    slug: 'dekut-engineering-and-tech-hub-launch',
    title: 'DeKUT Launches State-of-the-Art Engineering and Technology Innovation Hub',
    excerpt: 'Dedan Kimathi University of Technology has unveiled a new engineering research and design facility equipped with high-performance prototyping labs.',
    category: 'Innovation & Tech',
    mediaType: 'video',
    videoUrl: fullVideoUrl,
    featuredImage: fullVideoUrl,
    ogImage: 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg',
    author: {
      name: 'dekutconnect admin',
      role: 'Campus Community Lead',
      avatar: 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg',
      profileUrl: 'https://admin.dekut.site'
    },
    publishedAt: new Date().toISOString(),
    readTime: '3 min read',
    tags: ['DeKUT', 'Engineering', 'Innovation', 'Campus Tour', 'Technology'],
    likes: 12,
    dislikes: 0,
    content: 'Dedan Kimathi University of Technology ([DeKUT](https://www.dkut.ac.ke/)) has officially commissioned a new multi-million shilling Engineering and Technology Innovation Hub on the main campus in Nyeri.\n\n## Cutting-Edge Research Facilities\n\nThe new facility features advanced computer-aided design suites, additive manufacturing equipment, and robotics testbenches accessible to undergraduate and postgraduate researchers.\n\n<video controls playsinline style="width:100%; border-radius:8px; margin: 1rem 0;">\n  <source src="' + fullVideoUrl + '" type="video/mp4">\n  Your browser does not support HTML5 video playback.\n</video>\n\n> "This innovation hub demonstrates [Dedan Kimathi University of Technology](https://www.dkut.ac.ke/)\'s dedication to producing world-class engineers equipped with practical industry skills," said the university leadership during the opening ceremony.'
  };

  function toFirestoreValue(val) {
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'number') return { integerValue: String(val) };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
    if (typeof val === 'object' && val !== null) {
      const fields = {};
      for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
      return { mapValue: { fields } };
    }
    return { nullValue: null };
  }

  const videoFields = {};
  for (const [k, v] of Object.entries(videoArticle)) videoFields[k] = toFirestoreValue(v);

  const writeVideoRes = await new Promise(resolve => {
    const req = https.request('https://firestore.googleapis.com/v1/projects/dekutconnect-official/databases/(default)/documents/posts?documentId=' + videoArticle.id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(JSON.stringify({ fields: videoFields }))
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.write(JSON.stringify({ fields: videoFields }));
    req.end();
  });
  console.log('Video Article Saved to Firestore:', writeVideoRes.status);

  console.log('\n=== STEP 4: Upload Sample Image via Postimages/R2 ===');
  const sample1x1Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const imageUploadRes = await new Promise((resolve) => {
    const postData = JSON.stringify({
      fileData: sample1x1Png,
      fileName: 'dekut_tech_expo_' + Date.now() + '.png',
      mimeType: 'image/png',
      isVideo: false
    });
    const req = https.request('https://dekutconnect.vercel.app/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b) }));
    });
    req.write(postData);
    req.end();
  });

  console.log('Image Upload Status:', imageUploadRes.status, 'Data:', imageUploadRes.data);
  const imageUrl = imageUploadRes.data.url;
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : 'https://dekutconnect.vercel.app' + imageUrl;

  console.log('\n=== STEP 5: Create Image Article in Firebase Firestore ===');
  const imageArticle = {
    id: 'dekut-annual-science-and-tech-expo-2026',
    slug: 'dekut-annual-science-and-tech-expo-2026',
    title: 'DeKUT Students Showcase AI and Renewable Energy Projects at Annual Tech Expo',
    excerpt: 'Over 50 student engineering teams presented prototypes ranging from solar-powered agricultural irrigation systems to autonomous drone delivery platforms.',
    category: 'Campus & Tech',
    mediaType: 'image',
    featuredImage: fullImageUrl,
    ogImage: fullImageUrl,
    author: {
      name: 'dekutconnect admin',
      role: 'Campus Community Lead',
      avatar: 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg',
      profileUrl: 'https://admin.dekut.site'
    },
    publishedAt: new Date().toISOString(),
    readTime: '4 min read',
    tags: ['DeKUT', 'AI', 'Robotics', 'Tech Expo', 'Renewable Energy'],
    likes: 18,
    dislikes: 1,
    content: 'The 2026 Annual Science, Technology, and Innovation Expo at [Dedan Kimathi University of Technology](https://www.dkut.ac.ke/) concluded yesterday with outstanding student exhibitions in artificial intelligence, mechatronics, and green energy solutions.\n\n## Groundbreaking Student Inventions\n\nStudents from the School of Engineering displayed functional prototypes designed to solve real-world community challenges in Kenya and East Africa.\n\n![DeKUT Student Robotics Team](' + fullImageUrl + ')\n\nKey highlights included:\n- A precision agriculture drone equipped with multispectral imaging sensors\n- An IoT-enabled water quality monitoring network for rural water points\n- A machine-learning defect detector for high-speed industrial manufacturing\n\n> "Our goal is to nurture problem solvers who develop market-ready technological solutions," remarked the Dean of Engineering at [DeKUT](https://www.dkut.ac.ke/).'
  };

  const imageFields = {};
  for (const [k, v] of Object.entries(imageArticle)) imageFields[k] = toFirestoreValue(v);

  const writeImageRes = await new Promise(resolve => {
    const req = https.request('https://firestore.googleapis.com/v1/projects/dekutconnect-official/databases/(default)/documents/posts?documentId=' + imageArticle.id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(JSON.stringify({ fields: imageFields }))
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.write(JSON.stringify({ fields: imageFields }));
    req.end();
  });
  console.log('Image Article Saved to Firestore:', writeImageRes.status);

  console.log('\n=== STEP 6: Query Firestore to Verify All Articles Registered ===');
  const verifyRes = await new Promise(resolve => {
    https.get('https://firestore.googleapis.com/v1/projects/dekutconnect-official/databases/(default)/documents/posts', res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b)));
    });
  });

  const docs = verifyRes.documents || [];
  console.log('Total Documents in Firestore:', docs.length);
  docs.forEach((d, idx) => {
    const f = d.fields;
    console.log(`  [${idx + 1}] Title: ${f.title?.stringValue}`);
    console.log(`      Slug: ${f.slug?.stringValue}`);
    console.log(`      Category: ${f.category?.stringValue}`);
    console.log(`      Media: ${f.featuredImage?.stringValue?.substring(0, 70)}...`);
  });

  // Also sync the articles to posts.json locally
  const currentPosts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));
  const newPosts = [imageArticle, videoArticle];
  newPosts.forEach(np => {
    const idx = currentPosts.findIndex(p => p.slug === np.slug);
    if (idx >= 0) currentPosts[idx] = np;
    else currentPosts.unshift(np);
  });
  fs.writeFileSync('posts.json', JSON.stringify(currentPosts, null, 2));
  fs.writeFileSync('public/posts.json', JSON.stringify(currentPosts, null, 2));
  fs.writeFileSync('blog/posts.json', JSON.stringify(currentPosts, null, 2));
  console.log('\nSynced all articles to posts.json in root, public, and blog!');
}

runVerification().catch(console.error);
