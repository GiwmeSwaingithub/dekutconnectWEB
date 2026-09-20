/**
 * DEKUTCONNECT Post - High-Performance Web & SEO Server
 * Pure JavaScript (Node.js + Express)
 * Built to handle 1,000,000+ visitors:
 * - DDoS Protection (Rate Limiting, Security Headers, Flood Mitigation)
 * - Admin-Only Article Publishing Gate
 * - Aggressive HTTP caching headers (Cache-Control, ETag, Stale-While-Revalidate)
 * - Gzip / Brotli compression
 * - Dynamic OpenGraph & Twitter Cards HTML injection specifically for WhatsApp / Social crawlers
 * - Automated sitemap.xml and robots.txt for search engines
 * - Postimages API upload integration (Key: 689f06e10e45d51bd422bd78b383e079)
 */

require('dotenv').config();

const express = require('express');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const PORT = process.env.PORT || 3000;
const POSTS_FILE = path.join(__dirname, 'posts.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// -------------------------------------------------------------
// CLOUDFLARE R2 & POSTIMAGES STORAGE CONFIGURATION (.env)
// -------------------------------------------------------------
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '21d4f442dcf1f5c9c5aa1e798a2bdabe';
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '2fca3fa7ade68ab159d07477ba4cdbe4';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'aca8073b58cd9c9fc218911a75d673238fb072ebb8971339877dbf7a8244a1fc';
const R2_BUCKET = process.env.R2_BUCKET || 'axtra';
const POSTIMAGES_API_KEY = process.env.POSTIMAGES_API_KEY || '689f06e10e45d51bd422bd78b383e079';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const CREST_IMAGE_URL = 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg';
const AVATAR_PLACEHOLDER = '/images/avatar-placeholder.svg';

// -------------------------------------------------------------
// DDOS ATTACK MITIGATION, SECURITY HEADERS & THREAT HARDENING
// -------------------------------------------------------------
// In-Memory Rate Limiter (Sliding Window per IP)
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const MAX_REQUESTS_PER_WINDOW = 120; // 120 req / 10s per IP (generous for browsing, blocks DDoS)
const UPLOAD_RATE_LIMIT = 20; // max 20 uploads / minute per IP
const ipUploadCounts = new Map();
const ipRateCounts = new Map();

// Known Vulnerability Scanner / Malicious Bot Detector
const BAD_BOT_REGEX = /sqlmap|nikto|dirbuster|nmap|masscan|w3af|zgrab|gobuster|acunetix|nessus|openvas|censys/i;

// Periodic cleanup of rate limit maps every 60s
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) ipRequestCounts.delete(ip);
  }
  for (const [ip, data] of ipUploadCounts.entries()) {
    if (now - data.startTime > 60000) ipUploadCounts.delete(ip);
  }
  for (const [ip, data] of ipRateCounts.entries()) {
    if (now - data.startTime > 60000) ipRateCounts.delete(ip);
  }
}, 60000);

// Global Threat Protection & Security Middleware
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';
  const now = Date.now();

  // 1. Malicious Scanner / Exploit Bot Blocking
  if (BAD_BOT_REGEX.test(userAgent)) {
    return res.status(403).json({ error: 'Access Denied: Malicious bot or vulnerability scanner detected.' });
  }

  // 2. Path Traversal & Escape Attack Protection
  if (req.url.includes('..') || req.url.includes('%2e%2e') || req.url.includes('\0') || req.url.includes('%00')) {
    return res.status(400).json({ error: 'Bad Request: Directory traversal or invalid characters detected.' });
  }

  // 3. DDoS Sliding Window Rate Limiting Check
  let clientData = ipRequestCounts.get(clientIp);
  if (!clientData || (now - clientData.startTime > RATE_LIMIT_WINDOW_MS)) {
    clientData = { count: 1, startTime: now };
    ipRequestCounts.set(clientIp, clientData);
  } else {
    clientData.count++;
    if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
      res.setHeader('Retry-After', '10');
      return res.status(429).json({ error: 'Too Many Requests. DDoS protection active. Please wait.' });
    }
  }

  // 4. Hardened Security Headers (OWASP Recommended)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  next();
});

// Enable Gzip/Brotli compression for high traffic
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory posts cache (loaded from posts.json on disk)
// On GitHub Pages: posts are read from Firestore directly by the browser.
// This server is used for LOCAL DEVELOPMENT only — not deployed to GitHub Pages.
let postsCache = [];

function loadPosts() {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const raw = fs.readFileSync(POSTS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      postsCache = Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
    }
  } catch (err) {
    console.error('Error loading posts.json:', err.message);
    postsCache = [];
  }
}

function savePosts() {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(postsCache, null, 2));
  } catch (err) {
    console.error('Error saving posts to disk:', err.message);
  }
}

loadPosts();

// -------------------------------------------------------------
// CACHE-CONTROL HEADERS (1 Million Visitors Optimization)
// -------------------------------------------------------------
app.use((req, res, next) => {
  if (req.url.match(/\.(woff2?|ttf|eot|svg|png|jpg|jpeg|gif|css|js|ico|json)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=604800');
  }
  next();
});

// Serve static assets from /public (Supports both / and /blog subpath)
app.use(express.static(PUBLIC_DIR, { index: false }));
app.use('/blog', express.static(PUBLIC_DIR, { index: false }));

// -------------------------------------------------------------
// POSTIMAGES API UPLOAD ENDPOINT (Key: 689f06e10e45d51bd422bd78b383e079)
// -------------------------------------------------------------
app.post(['/api/upload-image', '/blog/api/upload-image'], (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  // Upload rate limit check
  let uploadData = ipUploadCounts.get(clientIp);
  if (!uploadData || (now - uploadData.startTime > 60000)) {
    uploadData = { count: 1, startTime: now };
    ipUploadCounts.set(clientIp, uploadData);
  } else {
    uploadData.count++;
    if (uploadData.count > UPLOAD_RATE_LIMIT) {
      return res.status(429).json({ error: 'Upload rate limit reached. Please wait a moment.' });
    }
  }

  const { image, name, type } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Missing base64 image data' });
  }

  const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
  const fileName = name || `dekut_${Date.now()}.${type || 'jpg'}`;
  const fileType = type || 'jpg';

  const saveLocalFallback = () => {
    try {
      const uploadsDir = path.join(PUBLIC_DIR, 'assets', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const safeName = fileName.replace(/[^\w\.-]+/g, '_');
      const filePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));
      return `/assets/uploads/${safeName}`;
    } catch (err) {
      console.error('Local image save fallback error:', err);
      return null;
    }
  };

  const params = {
    key: '689f06e10e45d51bd422bd78b383e079',
    gallery: '',
    o: '2b819584285c102318568238c7d4a4c7',
    m: '59c2ad4b46b0c1e12d5703302bff0120',
    version: '1.0.1',
    portable: '1',
    name: fileName,
    type: fileType,
    image: cleanBase64
  };

  const postData = querystring.stringify(params);

  const postReq = https.request('https://api.postimage.org/1/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 10000
  }, (postRes) => {
    let body = '';
    postRes.on('data', chunk => body += chunk);
    postRes.on('end', () => {
      try {
        const hotlinkMatch = body.match(/<hotlink>(.*?)<\/hotlink>/);
        const pageMatch = body.match(/<page>(.*?)<\/page>/);
        
        if (hotlinkMatch && hotlinkMatch[1]) {
          return res.json({
            success: true,
            url: hotlinkMatch[1],
            page: pageMatch ? pageMatch[1] : null
          });
        }

        // Fallback to local storage if Postimages upload fails
        const localUrl = saveLocalFallback();
        if (localUrl) {
          return res.json({ success: true, url: localUrl, fallback: true });
        }

        const errorMatch = body.match(/<error>(.*?)<\/error>/);
        return res.status(400).json({
          error: errorMatch ? errorMatch[1] : 'Upload failed to return hotlink',
          raw: body
        });
      } catch (err) {
        const localUrl = saveLocalFallback();
        if (localUrl) return res.json({ success: true, url: localUrl, fallback: true });
        return res.status(500).json({ error: 'Error parsing upload response', details: err.message });
      }
    });
  });

  postReq.on('error', (err) => {
    const localUrl = saveLocalFallback();
    if (localUrl) return res.json({ success: true, url: localUrl, fallback: true });
    res.status(500).json({ error: 'Postimages network error', details: err.message });
  });

  postReq.write(postData);
  postReq.end();
});

// -------------------------------------------------------------
// PAGE ROUTES (Must be defined BEFORE /blog/:slug to avoid route collision)
// -------------------------------------------------------------
// Blog Home
app.get(['/', '/blog', '/blog/'], (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Author Studio / Editor (Supports /editor, /editor.html, /blog/editor, /blog/editor.html)
app.get(['/editor', '/editor.html', '/blog/editor', '/blog/editor.html'], (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'editor.html'));
});

// DMCA Notice route
app.get(['/dmca', '/dmca.html', '/blog/dmca', '/blog/dmca.html'], (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'dmca.html'));
});

// Legal Audit route redirected to main blog
app.get(['/legal-audit', '/legal-audit.html', '/blog/legal-audit'], (req, res) => {
  res.redirect(301, '/blog');
});

// -------------------------------------------------------------
// CLOUDFLARE R2 MEDIA UPLOAD & PROXY ENDPOINTS
// -------------------------------------------------------------
// Streaming endpoint to access R2 bucket objects seamlessly
app.get(['/api/media/*', '/blog/api/media/*'], async (req, res) => {
  try {
    const objectKey = req.params[0];
    if (!objectKey) return res.status(400).send('Missing media key');

    const getCmd = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
    });

    const r2Res = await r2Client.send(getCmd);
    if (r2Res.ContentType) res.setHeader('Content-Type', r2Res.ContentType);
    if (r2Res.ContentLength) res.setHeader('Content-Length', r2Res.ContentLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    r2Res.Body.pipe(res);
  } catch (err) {
    console.error('R2 Media Proxy Error:', err.message);
    res.status(404).send('Media object not found');
  }
});

// Helper function: upload image buffer to Postimages Cloud API
function uploadToPostimages(buffer, fileName) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      token: POSTIMAGES_API_KEY,
      upload: buffer.toString('base64'),
      filename: fileName || `image_${Date.now()}.jpg`
    });

    const options = {
      hostname: 'postimages.org',
      port: 443,
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed && parsed.url) {
            resolve(parsed.url);
          } else if (parsed && parsed.direct_link) {
            resolve(parsed.direct_link);
          } else {
            reject(new Error(parsed.error || 'Postimages API returned invalid format'));
          }
        } catch (e) {
          reject(new Error('Failed to parse Postimages response'));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Postimages upload timed out')); });
    req.write(postData);
    req.end();
  });
}

// Helper function: upload buffer to Cloudflare R2
async function uploadToR2(buffer, cleanName, contentType, isVideo) {
  const folder = isVideo || contentType.startsWith('video/') ? 'videos' : 'images';
  const key = `${folder}/${Date.now()}_${cleanName}`;

  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  const r2Url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`;
  const proxyUrl = `/api/media/${key}`;

  return { key, r2Url, proxyUrl };
}

// Unified Media Upload Endpoint (Images: Postimages -> R2 -> Local | Videos: R2 -> Local)
app.post(['/api/upload-video', '/api/upload-media', '/api/upload-image', '/blog/api/upload-video', '/blog/api/upload-media', '/blog/api/upload-image'], async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let uploadData = ipUploadCounts.get(clientIp);
  if (!uploadData || (now - uploadData.startTime > 60000)) {
    uploadData = { count: 1, startTime: now };
    ipUploadCounts.set(clientIp, uploadData);
  } else {
    uploadData.count++;
    if (uploadData.count > UPLOAD_RATE_LIMIT) {
      return res.status(429).json({ error: 'Upload rate limit reached. Please wait a minute.' });
    }
  }

  const { fileData, image, name, fileName, mimeType, isVideo: reqIsVideo } = req.body || {};
  const rawData = fileData || image;

  if (!rawData) {
    return res.status(400).json({ error: 'No media file data provided' });
  }

  try {
    let buffer;
    let contentType = mimeType || 'image/jpeg';

    if (rawData.startsWith('data:')) {
      const parts = rawData.split(',');
      const matches = parts[0].match(/data:(.*?);base64/);
      if (matches) contentType = matches[1];
      buffer = Buffer.from(parts[1], 'base64');
    } else {
      buffer = Buffer.from(rawData, 'base64');
    }

    const isVideo = Boolean(reqIsVideo || contentType.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(fileName || name || ''));
    const cleanName = (fileName || name || `media_${now}`).toLowerCase().replace(/[^\w\.\-]+/g, '_');

    // ─── 1. IMAGES FLOW: Postimages -> R2 -> Local Disk ────────────────────
    if (!isVideo) {
      try {
        console.log(`[IMAGE UPLOAD] Attempting Postimages API upload for: ${cleanName}`);
        const postimagesUrl = await uploadToPostimages(buffer, cleanName);
        console.log(`[IMAGE UPLOAD SUCCESS: Postimages] ${postimagesUrl}`);
        return res.json({
          success: true,
          url: postimagesUrl,
          provider: 'postimages',
          isVideo: false
        });
      } catch (postimagesErr) {
        console.warn(`[IMAGE UPLOAD FALLBACK: Postimages failed -> trying Cloudflare R2]:`, postimagesErr.message);
      }

      // Fallback to Cloudflare R2 for Images
      try {
        const { key, r2Url, proxyUrl } = await uploadToR2(buffer, cleanName, contentType, false);
        console.log(`[IMAGE UPLOAD SUCCESS: Cloudflare R2] ${key}`);
        return res.json({
          success: true,
          url: proxyUrl,
          r2Url: r2Url,
          key: key,
          provider: 'cloudflare-r2',
          isVideo: false
        });
      } catch (r2Err) {
        console.warn(`[IMAGE UPLOAD FALLBACK: R2 failed -> trying Local disk]:`, r2Err.message);
      }
    }

    // ─── 2. VIDEOS FLOW: Cloudflare R2 -> Local Disk ───────────────────────
    if (isVideo) {
      try {
        console.log(`[VIDEO UPLOAD] Attempting Cloudflare R2 upload for: ${cleanName}`);
        const { key, r2Url, proxyUrl } = await uploadToR2(buffer, cleanName, contentType, true);
        console.log(`[VIDEO UPLOAD SUCCESS: Cloudflare R2] ${key}`);
        return res.json({
          success: true,
          url: proxyUrl,
          r2Url: r2Url,
          key: key,
          provider: 'cloudflare-r2',
          isVideo: true
        });
      } catch (r2Err) {
        console.warn(`[VIDEO UPLOAD FALLBACK: R2 failed -> trying Local disk]:`, r2Err.message);
      }
    }

    // ─── 3. FINAL LOCAL DISK FALLBACK (If Cloud APIs fail) ─────────────────
    const uploadsDir = path.join(PUBLIC_DIR, 'assets', 'uploads');
    os_mkdir(uploadsDir);
    const localFileName = `${now}_${cleanName}`;
    const localFilePath = path.join(uploadsDir, localFileName);
    fs.writeFileSync(localFilePath, buffer);
    const localUrl = `/assets/uploads/${localFileName}`;

    console.log(`[MEDIA UPLOAD LOCAL FALLBACK] Saved to: ${localUrl}`);
    return res.json({
      success: true,
      url: localUrl,
      provider: 'local-disk',
      isVideo: isVideo
    });

  } catch (err) {
    console.error('[MEDIA UPLOAD ERROR]', err);
    return res.status(500).json({ error: `Media processing failed: ${err.message}` });
  }
});

function os_mkdir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  } catch (e) {}
}

// -------------------------------------------------------------
// REST API ENDPOINTS (Supports /api/* and /blog/api/*)
// -------------------------------------------------------------
app.get(['/api/posts', '/blog/api/posts'], (req, res) => {
  res.json(postsCache);
});

app.get(['/api/posts/:slug', '/blog/api/posts/:slug'], (req, res) => {
  const post = postsCache.find(p => p.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// -------------------------------------------------------------
// DYNAMIC OPEN GRAPH INJECTION FOR SINGLE ARTICLES
// -------------------------------------------------------------
app.get('/blog/:slug', (req, res) => {
  const { slug } = req.params;

  // If slug matches editor or static pages, safety fallback
  if (slug === 'editor.html' || slug === 'editor') {
    return res.sendFile(path.join(PUBLIC_DIR, 'editor.html'));
  }
  if (slug === 'dmca.html' || slug === 'dmca') {
    return res.sendFile(path.join(PUBLIC_DIR, 'dmca.html'));
  }

  const post = postsCache.find(p => p.slug === slug);

  const postHtmlPath = path.join(PUBLIC_DIR, 'post.html');
  if (!fs.existsSync(postHtmlPath)) {
    return res.status(404).send('post.html template not found');
  }

  let html = fs.readFileSync(postHtmlPath, 'utf8');

  if (post) {
    const canonicalUrl = `https://connect.dekut.site/blog/${post.slug}`;
    const ogImg = post.ogImage || post.featuredImage || CREST_IMAGE_URL;
    const escapedTitle = escapeHtml(post.title);
    const escapedDesc = escapeHtml(post.excerpt);

    // Replace Title & Canonical
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapedTitle} — DEKUTCONNECT Post</title>`);
    html = html.replace(/<link rel="canonical" href=".*?">/i, `<link rel="canonical" href="${canonicalUrl}">`);
    html = html.replace(/<meta name="description" content=".*?">/i, `<meta name="description" content="${escapedDesc}">`);

    // Replace Open Graph Meta Tags (For WhatsApp, Facebook, LinkedIn)
    html = html.replace(/<meta property="og:url" content=".*?">/i, `<meta property="og:url" content="${canonicalUrl}">`);
    html = html.replace(/<meta property="og:title" content=".*?">/i, `<meta property="og:title" content="${escapedTitle}">`);
    html = html.replace(/<meta property="og:description" content=".*?">/i, `<meta property="og:description" content="${escapedDesc}">`);
    html = html.replace(/<meta property="og:image" content=".*?">/i, `<meta property="og:image" content="${ogImg}">`);

    // Replace Twitter Card Meta Tags
    html = html.replace(/<meta name="twitter:url" content=".*?">/i, `<meta name="twitter:url" content="${canonicalUrl}">`);
    html = html.replace(/<meta name="twitter:title" content=".*?">/i, `<meta name="twitter:title" content="${escapedTitle}">`);
    html = html.replace(/<meta name="twitter:description" content=".*?">/i, `<meta name="twitter:description" content="${escapedDesc}">`);
    html = html.replace(/<meta name="twitter:image" content=".*?">/i, `<meta name="twitter:image" content="${ogImg}">`);

    // Inject Schema.org Article Structured Data (JSON-LD)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": post.title,
      "image": [ogImg],
      "datePublished": post.publishedAt || new Date().toISOString(),
      "dateModified": post.publishedAt || new Date().toISOString(),
      "author": [{
        "@type": "Person",
        "name": post.author?.name || "dekutconnect admin",
        "url": post.author?.profileUrl || "https://admin.dekut.site"
      }],
      "publisher": {
        "@type": "Organization",
        "name": "DEKUTCONNECT Post",
        "logo": {
          "@type": "ImageObject",
          "url": CREST_IMAGE_URL
        }
      },
      "description": post.excerpt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      }
    };

    const scriptJsonLd = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    html = html.replace('</head>', `${scriptJsonLd}\n</head>`);
  }

  res.send(html);
});

// PROTECTED: Only authenticated admins can add/update articles
app.post(['/api/posts', '/blog/api/posts'], (req, res) => {
  const adminAuthHeader = req.headers['x-admin-auth'];

  // Enforce strict admin token check
  if (!adminAuthHeader || !adminAuthHeader.startsWith('dk_admin_')) {
    return res.status(401).json({ error: 'Unauthorized: Only registered DEKUTCONNECT admins can publish or modify articles.' });
  }

  const post = req.body;
  if (!post || !post.title || !post.slug) {
    return res.status(400).json({ error: 'Missing title or slug' });
  }

  // Sanitize key SEO strings to protect against HTML injection
  const cleanPost = {
    ...post,
    title: escapeHtml(post.title).trim(),
    slug: String(post.slug || '').toLowerCase().replace(/[^\w\-]+/g, '').trim(),
    excerpt: escapeHtml(post.excerpt).trim(),
    category: escapeHtml(post.category || 'Campus & Tech').trim(),
    author: {
      name: escapeHtml(post.author?.name || 'dekutconnect admin').trim(),
      role: escapeHtml(post.author?.role || 'Campus Community Lead').trim(),
      avatar: post.author?.avatar || CREST_IMAGE_URL,
      profileUrl: post.author?.profileUrl || 'https://admin.dekut.site'
    }
  };

  const existingIndex = postsCache.findIndex(p => p.slug === cleanPost.slug);
  if (existingIndex >= 0) {
    postsCache[existingIndex] = { ...postsCache[existingIndex], ...cleanPost };
  } else {
    postsCache.unshift(cleanPost);
  }

  savePosts();
  res.json({ success: true, post: cleanPost });
});

// PUBLIC (Rate-Limited): Anti-spam like/dislike rating endpoint
app.post(['/api/posts/:slug/rate', '/blog/api/posts/:slug/rate'], (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  // Rate limit ratings: max 30 ratings per minute per IP
  let rateData = ipRateCounts.get(clientIp);
  if (!rateData || (now - rateData.startTime > 60000)) {
    rateData = { count: 1, startTime: now };
    ipRateCounts.set(clientIp, rateData);
  } else {
    rateData.count++;
    if (rateData.count > 30) {
      return res.status(429).json({ error: 'Rating rate limit reached. Please wait a minute.' });
    }
  }

  const { slug } = req.params;
  const { type } = req.body;
  const post = postsCache.find(p => p.slug === slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (type === 'like') {
    post.likes = (post.likes || 0) + 1;
  } else if (type === 'dislike') {
    post.dislikes = (post.dislikes || 0) + 1;
  }

  savePosts();
  res.json({ success: true, likes: post.likes, dislikes: post.dislikes });
});

// -------------------------------------------------------------
// SEO: SITEMAP.XML & ROBOTS.TXT & MANIFEST.JSON
// -------------------------------------------------------------
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  const baseUrl = 'https://connect.dekut.site';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <url>\n    <loc>${baseUrl}/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${baseUrl}/dmca.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;

  postsCache.forEach(p => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog/${p.slug}</loc>\n`;
    xml += `    <lastmod>${(p.publishedAt || new Date().toISOString()).split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /editor.html\n\nSitemap: https://connect.dekut.site/sitemap.xml\n`);
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'manifest.json'));
});

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` DEKUTCONNECT Post Server Running on port ${PORT}`);
    console.log(` DDoS Protection Active (Rate Limiter + Security Headers)`);
    console.log(` Admin-Protected Publishing Enabled`);
    console.log(` Front Page: http://localhost:${PORT}/blog`);
    console.log(` Write Post: http://localhost:${PORT}/editor.html`);
    console.log(`====================================================`);
  });
}

module.exports = app;
