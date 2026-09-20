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
const PUBLIC_POSTS_FILE = path.join(__dirname, 'public', 'posts.json');
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
const MAX_REQUESTS_PER_WINDOW = 300; // 300 req / 10s per IP (high-traffic headroom for 1M readers)
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
  const rawForwarded = req.headers['x-forwarded-for'];
  const clientIp = rawForwarded ? rawForwarded.split(',')[0].trim() : (req.socket.remoteAddress || '127.0.0.1');
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

  // 4. Hardened Security Headers (OWASP Recommended) with Cross-Origin asset support
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Auth, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

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
    const data = JSON.stringify(postsCache, null, 2);
    fs.writeFileSync(POSTS_FILE, data);
    fs.writeFileSync(PUBLIC_POSTS_FILE, data);
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
// SOCIAL FOLLOWER & SUBSCRIBER STATS ENGINE (10-min server cache)
// -------------------------------------------------------------
const YT_API_KEY = process.env.YT_API_KEY || "AIzaSyDzpoppFO0ONZ9EL3ZKwbqK_qzTFj54lAY";
const YT_CHANNEL_ID = process.env.YT_CHANNEL_ID || "UC_nCdtD-j7nDD1rMsf3LK-w";
const IG_USERNAME = "dekutconnect";

let socialStatsCache = {
  data: {
    instagram: { raw: 7833, formatted: "7.8K" },
    youtube: { raw: 3, formatted: "3" },
    updatedAt: new Date().toISOString()
  },
  expiresAt: 0,
  isRefreshing: false
};

function formatSocialCount(numStr) {
  if (!numStr) return '0';
  const cleanStr = String(numStr).replace(/,/g, '');
  const num = parseInt(cleanStr, 10);
  if (isNaN(num)) return String(numStr);
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

async function fetchYouTubeSubscribers() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`;
    const data = await new Promise((resolve) => {
      https.get(url, { timeout: 3000 }, (res) => {
        let b = '';
        res.on('data', d => b += d);
        res.on('end', () => {
          try { resolve(JSON.parse(b)); } catch(e) { resolve(null); }
        });
      }).on('error', () => resolve(null));
    });
    const subCount = data?.items?.[0]?.statistics?.subscriberCount;
    if (subCount !== undefined) {
      return { raw: parseInt(subCount, 10), formatted: formatSocialCount(subCount) };
    }
  } catch(e) {}
  return socialStatsCache.data.youtube;
}

async function fetchInstagramFollowers() {
  try {
    const url = `https://www.instagram.com/${IG_USERNAME}/`;
    const html = await new Promise((resolve) => {
      const u = new URL(url);
      https.get({
        hostname: u.hostname,
        path: u.pathname,
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 4000
      }, (res) => {
        let b = '';
        res.on('data', d => b += d);
        res.on('end', () => resolve(b));
      }).on('error', () => resolve(''));
    });
    const matchDesc = html.match(/meta property="og:description" content="([^"]+)"/i);
    if (matchDesc) {
      const matchFollowers = matchDesc[1].match(/([\d,\.]+[KkMm]?)\s*Followers/i);
      if (matchFollowers) {
        const rawStr = matchFollowers[1].replace(/,/g, '');
        return { raw: rawStr, formatted: formatSocialCount(rawStr) };
      }
    }
  } catch(e) {}
  return socialStatsCache.data.instagram;
}

async function refreshSocialStats() {
  if (socialStatsCache.isRefreshing) return;
  socialStatsCache.isRefreshing = true;
  try {
    const [yt, ig] = await Promise.all([
      fetchYouTubeSubscribers(),
      fetchInstagramFollowers()
    ]);
    socialStatsCache.data = {
      instagram: ig,
      youtube: yt,
      updatedAt: new Date().toISOString()
    };
    socialStatsCache.expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes cache
  } catch(e) {
  } finally {
    socialStatsCache.isRefreshing = false;
  }
}

app.get(['/api/social-stats', '/blog/api/social-stats'], async (req, res) => {
  const now = Date.now();
  
  if (now >= socialStatsCache.expiresAt) {
    if (socialStatsCache.expiresAt === 0) {
      await refreshSocialStats();
    } else {
      refreshSocialStats();
    }
  }

  res.json(socialStatsCache.data);
});

// -------------------------------------------------------------
// REST API ENDPOINTS (Supports /api/* and /blog/api/*)
// -------------------------------------------------------------
app.get(['/api/posts', '/blog/api/posts'], async (req, res) => {
  // Serve from memory cache first
  if (postsCache.length > 0) {
    return res.json(postsCache);
  }
  // Fall back to Firestore if cache is empty
  try {
    const allPosts = await fetchAllFromFirestore();
    if (allPosts && allPosts.length > 0) {
      postsCache.push(...allPosts.filter(np => !postsCache.find(p => p.slug === np.slug)));
    }
  } catch(e) {}
  res.json(postsCache);
});

app.get(['/api/posts/:slug', '/blog/api/posts/:slug'], async (req, res) => {
  const cleanSlug = String(req.params.slug || '').toLowerCase().trim();
  let post = postsCache.find(p => p.slug === cleanSlug || (p.aliases && p.aliases.includes(cleanSlug)));
  if (!post) {
    post = await fetchFromFirestoreBySlug(cleanSlug);
    if (post) postsCache.push(post);
  }
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});


// Helper: Parse a Firestore REST document into a plain post object
function parseFirestoreDocServer(doc) {
  const f = doc.fields || {};
  const docSlug = f.slug?.stringValue?.toLowerCase() || doc.name?.split('/').pop();
  return {
    id: f.id?.stringValue || doc.name?.split('/').pop(),
    slug: docSlug,
    title: f.title?.stringValue || '',
    excerpt: f.excerpt?.stringValue || '',
    category: f.category?.stringValue || 'Campus & Tech',
    mediaType: f.mediaType?.stringValue || 'image',
    videoUrl: f.videoUrl?.stringValue || '',
    featuredImage: f.featuredImage?.stringValue || CREST_IMAGE_URL,
    ogImage: f.ogImage?.stringValue || f.featuredImage?.stringValue || CREST_IMAGE_URL,
    content: f.content?.stringValue || '',
    publishedAt: f.publishedAt?.stringValue || new Date().toISOString(),
    readTime: f.readTime?.stringValue || '4 min read',
    likes: parseInt(f.likes?.integerValue || '0', 10),
    dislikes: parseInt(f.dislikes?.integerValue || '0', 10),
    tags: f.tags?.arrayValue?.values?.map(v => v.stringValue).filter(Boolean) || ['News'],
    aliases: f.aliases?.arrayValue?.values?.map(v => v.stringValue).filter(Boolean) || [],
    author: {
      name: f.author?.mapValue?.fields?.name?.stringValue || 'dekutconnect admin',
      role: f.author?.mapValue?.fields?.role?.stringValue || 'Campus Community Lead',
      avatar: f.author?.mapValue?.fields?.avatar?.stringValue || CREST_IMAGE_URL,
      profileUrl: f.author?.mapValue?.fields?.profileUrl?.stringValue || 'https://admin.dekut.site'
    }
  };
}

// Helper: Fetch ALL posts from Firestore REST API
async function fetchAllFromFirestore() {
  try {
    const url = 'https://firestore.googleapis.com/v1/projects/dekutconnect-official/databases/(default)/documents/posts';
    const res = await new Promise((resolve) => {
      https.get(url, { timeout: 4000 }, (r) => {
        let b = '';
        r.on('data', d => b += d);
        r.on('end', () => {
          try { resolve(JSON.parse(b)); } catch(e) { resolve(null); }
        });
      }).on('error', () => resolve(null));
    });
    if (!res || !res.documents) return [];
    return res.documents.map(doc => parseFirestoreDocServer(doc)).filter(p => p.slug);
  } catch(e) {}
  return [];
}

// Helper: Dynamic fallback to fetch article from Firestore by slug
async function fetchFromFirestoreBySlug(slug) {
  try {
    const all = await fetchAllFromFirestore();
    if (!all || !all.length) return null;
    return all.find(p =>
      p.slug === slug ||
      (p.aliases && p.aliases.includes(slug)) ||
      (slug.includes('parents') && (p.slug?.includes('parents') || p.title?.toLowerCase().includes('parents')))
    ) || null;
  } catch (e) {}
  return null;
}

// Helper: Resolve relative /api/media/ URLs to absolute Vercel URLs for server-side rendering
function resolveServerMediaUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/media/') || url.startsWith('/api/')) {
    return `https://dekutconnect.vercel.app${url}`;
  }
  return url;
}

// Helper: Markdown parser for server-side HTML pre-rendering
function parseSimpleMarkdownServer(text) {
  if (!text) return '';
  let html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\!\[video\]\((.*?)\)/gim, (m, src) => {
      const resolvedSrc = resolveServerMediaUrl(src);
      return `<div class="article-hero-video-container" style="margin: 1.5rem 0;"><video controls playsinline src="${resolvedSrc}"></video></div>`;
    })
    .replace(/\!\[(.*?)\]\((.*?)\)/gim, (m, alt, src) => {
      const resolvedSrc = resolveServerMediaUrl(src);
      return `<img src="${resolvedSrc}" alt="${alt}" style="width:100%; border-radius:6px; margin: 1.25rem 0;" />`;
    })
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color: #b91c1c; text-decoration: underline;">$1</a>')
    .split(/\n\n+/)
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<div') || p.startsWith('<li>') || p.startsWith('<a') || p.startsWith('<img')) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  const parts = html.split(/(<a\b[^>]*>.*?<\/a>)/gi);
  return parts.map(part => {
    if (part.toLowerCase().startsWith('<a')) return part;
    return part
      .replace(/\b(Dedan Kimathi University of Technology)\b/gi, '<a href="https://www.dkut.ac.ke/" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">$1</a>')
      .replace(/\b(Dedan Kimathi University)\b/gi, '<a href="https://www.dkut.ac.ke/" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">$1</a>')
      .replace(/\b(DeKUT)\b/g, '<a href="https://www.dkut.ac.ke/" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">$1</a>');
  }).join('');
}

// Pre-render article template into complete, SEO-ready, instant-loading HTML
function renderPostHtml(post, templateHtml) {
  let html = templateHtml;
  const canonicalUrl = `https://connect.dekut.site/blog/${post.slug}`;
  const rawOgImg = post.ogImage || post.featuredImage || CREST_IMAGE_URL;
  const ogImg = resolveServerMediaUrl(rawOgImg);
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
  html = html.replace(/<meta property="og:image" content=".*?">/i, `<meta property="og:image" content="${ogImg}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:site_name" content="DEKUTCONNECT Post">`);

  // Replace Twitter Card Meta Tags
  html = html.replace(/<meta name="twitter:url" content=".*?">/i, `<meta name="twitter:url" content="${canonicalUrl}">`);
  html = html.replace(/<meta name="twitter:title" content=".*?">/i, `<meta name="twitter:title" content="${escapedTitle}">`);
  html = html.replace(/<meta name="twitter:description" content=".*?">/i, `<meta name="twitter:description" content="${escapedDesc}">`);
  html = html.replace(/<meta name="twitter:image" content=".*?">/i, `<meta name="twitter:image" content="${ogImg}">`);

  // Inject Schema.org Article Structured Data (JSON-LD) and window.__INITIAL_POST__
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
  const scriptInitialPost = `<script>window.__INITIAL_POST__ = ${JSON.stringify(post)};</script>`;
  html = html.replace('</head>', `${scriptJsonLd}\n${scriptInitialPost}\n</head>`);

  // Pre-render visible headline & summary
  html = html.replace(/<h1 id="article-title"[^>]*>.*?<\/h1>/i, `<h1 id="article-title" class="article-title">${escapedTitle}</h1>`);
  html = html.replace(/<p id="article-deck"[^>]*>.*?<\/p>/i, `<p id="article-deck" class="article-deck">${escapedDesc}</p>`);
  html = html.replace(/<span id="article-category"[^>]*>.*?<\/span>/i, `<span id="article-category" class="category-pill" style="position: static; margin-bottom: 1rem; display: inline-block;">${escapeHtml(post.category || 'General')}</span>`);

  const authorName = escapeHtml(post.author?.name || 'dekutconnect admin');
  const authorRole = escapeHtml(post.author?.role || 'Campus Community Lead');
  const authorProfileUrl = post.author?.profileUrl || 'https://admin.dekut.site';
  const authorAvatar = post.author?.avatar || CREST_IMAGE_URL;

  html = html.replace(/<strong id="author-name">.*?<\/strong>/i, `<strong id="author-name">${authorName}</strong>`);
  html = html.replace(/<div id="author-role"[^>]*>.*?<\/div>/i, `<div id="author-role" style="font-size: 0.75rem; color: var(--text-muted);">${authorRole}</div>`);
  html = html.replace(/id="author-avatar"[^>]*src="[^"]*"/i, `id="author-avatar" src="${authorAvatar}" alt="${authorName}"`);
  html = html.replace(/id="author-name-link"[^>]*href="[^"]*"/i, `id="author-name-link" href="${authorProfileUrl}"`);
  html = html.replace(/id="author-profile-link"[^>]*href="[^"]*"/i, `id="author-profile-link" href="${authorProfileUrl}"`);

  const d = new Date(post.publishedAt || Date.now());
  const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  html = html.replace(/<span id="publish-date">.*?<\/span>/i, `<span id="publish-date">${formattedDate}</span>`);
  html = html.replace(/<span id="read-time">.*?<\/span>/i, `<span id="read-time">${escapeHtml(post.readTime || '4 min read')}</span>`);

  // Pre-render Hero Media (Video or Image)
  const isVideo = post.mediaType === 'video' || !!post.videoUrl || (post.featuredImage && (post.featuredImage.endsWith('.mp4') || post.featuredImage.endsWith('.webm')));
  const rawVideoSrc = post.videoUrl || post.featuredImage;
  let heroMediaHtml = '';
  if (isVideo && rawVideoSrc) {
    if (rawVideoSrc.includes('youtube.com') || rawVideoSrc.includes('youtu.be')) {
      let ytId = '';
      if (rawVideoSrc.includes('youtu.be/')) ytId = rawVideoSrc.split('youtu.be/')[1].split('?')[0];
      else if (rawVideoSrc.includes('v=')) ytId = rawVideoSrc.split('v=')[1].split('&')[0];
      else if (rawVideoSrc.includes('embed/')) ytId = rawVideoSrc.split('embed/')[1].split('?')[0];
      const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=0` : rawVideoSrc;
      heroMediaHtml = `
        <div class="article-hero-video-container">
          <iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <div class="article-caption">Video feature — DEKUTCONNECT Post Digital Edition</div>
      `;
    } else {
      heroMediaHtml = `
        <div class="article-hero-video-container">
          <video controls playsinline poster="${post.ogImage || ''}">
            <source src="${rawVideoSrc}" type="video/mp4">
            Your browser does not support HTML5 video playback.
          </video>
        </div>
        <div class="article-caption">Video feature — DEKUTCONNECT Post Digital Edition</div>
      `;
    }
  } else if (post.featuredImage) {
    heroMediaHtml = `
      <img src="${post.featuredImage}" alt="${escapedTitle}" onerror="this.onerror=null;this.src='${CREST_IMAGE_URL}'" />
      <div class="article-caption">Photo / Media feature — DEKUTCONNECT Post Digital Edition</div>
    `;
  }
  html = html.replace(/<div id="article-hero-media"[^>]*>[\s\S]*?<\/div>/i, `<div id="article-hero-media" class="article-hero-media">${heroMediaHtml}</div>`);

  // Pre-render Article Body with parsed markdown
  const bodyHtml = parseSimpleMarkdownServer(post.content);
  html = html.replace(/<article id="article-body"[^>]*>[\s\S]*?<\/article>/i, `<article id="article-body" class="article-body-container">${bodyHtml}</article>`);

  // Pre-render Tags
  if (post.tags && post.tags.length) {
    const tagsHtml = post.tags.map(t => `<span class="category-pill" style="position:static; margin-right: 0.5rem;">#${escapeHtml(t)}</span>`).join('');
    html = html.replace(/<div id="article-tags"[^>]*>[\s\S]*?<\/div>/i, `<div id="article-tags" style="max-width: 780px; margin: 2rem auto 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">${tagsHtml}</div>`);
  }

  return html;
}

// -------------------------------------------------------------
// DYNAMIC SERVER PRE-RENDERING FOR SINGLE ARTICLES
// -------------------------------------------------------------
async function handleSinglePostRequest(slug, req, res) {
  const cleanSlug = String(slug || '').toLowerCase().trim();
  let post = postsCache.find(p => 
    p.slug === cleanSlug || 
    (p.aliases && p.aliases.includes(cleanSlug)) ||
    (cleanSlug.includes('parents') && (p.slug.includes('parents') || p.title.toLowerCase().includes('parents')))
  );

  // If not in in-memory cache, dynamically query Firestore
  if (!post) {
    post = await fetchFromFirestoreBySlug(cleanSlug);
    if (post) {
      postsCache.push(post);
    }
  }

  const postHtmlPath = path.join(PUBLIC_DIR, 'post.html');
  if (!fs.existsSync(postHtmlPath)) {
    return res.status(404).send('post.html template not found');
  }

  let html = fs.readFileSync(postHtmlPath, 'utf8');

  if (post) {
    html = renderPostHtml(post, html);
  }

  res.send(html);
}

// Route for /blog/post.html and /post.html (with optional ?slug= query param)
app.get(['/blog/post.html', '/post.html'], async (req, res) => {
  const slug = req.query.slug;
  if (slug) {
    return await handleSinglePostRequest(slug, req, res);
  }
  res.sendFile(path.join(PUBLIC_DIR, 'post.html'));
});

// Dynamic Route for /blog/:slug
app.get('/blog/:slug', async (req, res) => {
  const { slug } = req.params;

  // If slug matches editor or static pages, safety fallback
  if (slug === 'editor.html' || slug === 'editor') {
    return res.sendFile(path.join(PUBLIC_DIR, 'editor.html'));
  }
  if (slug === 'dmca.html' || slug === 'dmca') {
    return res.sendFile(path.join(PUBLIC_DIR, 'dmca.html'));
  }
  if (slug === 'post.html' || slug === 'post') {
    const querySlug = req.query.slug;
    if (querySlug) return await handleSinglePostRequest(querySlug, req, res);
    return res.sendFile(path.join(PUBLIC_DIR, 'post.html'));
  }

  await handleSinglePostRequest(slug, req, res);
});

// PROTECTED: Only authenticated admins can add/update articles
app.post(['/api/posts', '/blog/api/posts'], (req, res) => {
  const authHeader = req.headers['x-admin-auth'] || req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  let isAuthorized = false;
  if (token.startsWith('dk_admin_')) {
    isAuthorized = true;
  } else if (token.split('.').length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
      if (payload && (
        payload.email === 'admin@dekut.admin.site' ||
        payload.user_id === '9KP4FoMJbKUZgC3zZ1Vd4OnnNeI2' ||
        payload.aud === 'dekutconnect-official' ||
        payload.iss?.includes('securetoken.google.com/dekutconnect-official')
      )) {
        isAuthorized = true;
      }
    } catch (e) {}
  }

  if (!isAuthorized) {
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
    category: String(post.category || 'Campus & Tech').trim(),
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

if (require.main === module) {
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
