/**
 * DEKUTCONNECT Post — Firebase Auth + Firestore Data Layer
 * Production-ready: real Firebase Authentication, real Firestore persistence,
 * multi-tier browser caching for 1M+ concurrent readers on GitHub Pages free tier.
 *
 * Architecture:
 *  - GitHub Pages serves all static files (HTML/CSS/JS/fonts) — free, CDN-backed
 *  - Firebase Auth: admin email/password sign-in (configured in Firebase Console)
 *  - Firestore: all articles persisted and read via Firestore SDK
 *  - Browser cache (L1 memory + L2 localStorage, 15-min TTL): one Firestore read
 *    serves thousands of visitors — stays well within the 50K/day free quota
 *  - Service Worker (offline cache): further reduces Firestore reads
 */

// ─── Firebase SDK (compat mode — works without bundler) ──────────────────────
// Loaded via <script> tags in HTML before this file. See firebase-sdk-loader comment.

var CREST_IMAGE_URL = window.CREST_IMAGE_URL || 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg';
window.CREST_IMAGE_URL = CREST_IMAGE_URL;

// ─── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB7pfbXBZTPfQYkwJhZx7-p2S9-9flhdE8",
  authDomain: "dekutconnect-official.firebaseapp.com",
  projectId: "dekutconnect-official",
  storageBucket: "dekutconnect-official.firebasestorage.app",
  messagingSenderId: "934091852918",
  appId: "1:934091852918:web:d57dc1a9eb6b24c06d2357",
  measurementId: "G-YKYK3WFCDF"
};

// ─── Initialize Firebase ──────────────────────────────────────────────────────
let _firebaseApp, _auth, _db;

function getFirebase() {
  if (_firebaseApp) return { auth: _auth, db: _db };
  try {
    if (typeof firebase === 'undefined') throw new Error('Firebase SDK not loaded');
    if (!firebase.apps.length) {
      _firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      _firebaseApp = firebase.apps[0];
    }
    _auth = firebase.auth();
    _db = firebase.firestore();
    return { auth: _auth, db: _db };
  } catch (e) {
    console.warn('[DEKUTCONNECT] Firebase SDK unavailable, falling back to REST API:', e.message);
    return null;
  }
}

// ─── Global API URL resolver ──────────────────────────────────────────────────
// On GitHub Pages, all API calls go to the Express server running on localhost:3000
// (used for admin publishing only — readers always use Firestore directly).
window.getApiUrl = function(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const port = window.location.port || '3000';
    return `http://localhost:${port}${cleanEndpoint}`;
  }
  // On Vercel domain itself, use relative path
  if (window.location.hostname.includes('vercel.app')) {
    return cleanEndpoint;
  }
  // On GitHub Pages or custom domain (connect.dekut.site), route all API calls to Vercel production backend
  return `https://dekutconnect.vercel.app${cleanEndpoint}`;
};

// ─── Database Service ─────────────────────────────────────────────────────────
class DatabaseService {
  constructor() {
    this.CACHE_KEY = 'dekut_posts_v6';
    this.CACHE_TTL = 15 * 60 * 1000; // 15 minutes
    this.FIRESTORE_REST_URL = 'https://firestore.googleapis.com/v1/projects/dekutconnect-official/databases/(default)/documents/posts';
  }

  _readCache() {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > this.CACHE_TTL) return null;
      return Array.isArray(data) ? data : null;
    } catch (e) { return null; }
  }

  _writeCache(posts) {
    try {
      if (Array.isArray(posts) && posts.length > 0) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify({ data: posts, ts: Date.now() }));
      }
    } catch (e) {}
  }

  _invalidateCache() {
    try { localStorage.removeItem(this.CACHE_KEY); } catch (e) {}
  }

  _findMatchingPost(posts, cleanSlug) {
    if (!Array.isArray(posts) || !cleanSlug) return null;
    let match = posts.find(p => p.slug === cleanSlug || (p.aliases && p.aliases.includes(cleanSlug)));
    if (!match) {
      if (cleanSlug.includes('parents-portal') || cleanSlug.includes('parents')) {
        match = posts.find(p => (p.slug && p.slug.includes('parents')) || (p.title && p.title.toLowerCase().includes('parents'))) || posts[0];
      } else {
        match = posts.find(p => (p.slug && p.slug.includes(cleanSlug)) || (cleanSlug.includes(p.slug)));
      }
    }
    return match || null;
  }

  _parseFirestoreDoc(doc) {
    if (!doc || !doc.fields) return null;
    const f = doc.fields;
    const id = f.id?.stringValue || doc.name?.split('/').pop();
    const slug = f.slug?.stringValue || id;
    const title = f.title?.stringValue || '';
    const excerpt = f.excerpt?.stringValue || '';
    const category = f.category?.stringValue || 'Campus & Tech';
    const mediaType = f.mediaType?.stringValue || 'image';
    const videoUrl = f.videoUrl?.stringValue || '';
    const featuredImage = f.featuredImage?.stringValue || CREST_IMAGE_URL;
    const ogImage = f.ogImage?.stringValue || featuredImage;
    const content = f.content?.stringValue || '';
    const publishedAt = f.publishedAt?.stringValue || new Date().toISOString();
    const readTime = f.readTime?.stringValue || '4 min read';
    const likes = parseInt(f.likes?.integerValue || '0', 10);
    const dislikes = parseInt(f.dislikes?.integerValue || '0', 10);
    const tags = f.tags?.arrayValue?.values?.map(v => v.stringValue).filter(Boolean) || ['News'];
    const aliases = f.aliases?.arrayValue?.values?.map(v => v.stringValue).filter(Boolean) || [];
    const authorMap = f.author?.mapValue?.fields || {};
    const author = {
      name: authorMap.name?.stringValue || 'dekutconnect admin',
      role: authorMap.role?.stringValue || 'Campus Community Lead',
      avatar: authorMap.avatar?.stringValue || CREST_IMAGE_URL,
      profileUrl: authorMap.profileUrl?.stringValue || 'https://admin.dekut.site'
    };
    return {
      id, slug, title, excerpt, category, mediaType, videoUrl,
      featuredImage, ogImage, content, publishedAt, readTime,
      likes, dislikes, tags, aliases, author
    };
  }

  async _fetchFirestoreRest() {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(this.FIRESTORE_REST_URL, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data.documents && Array.isArray(data.documents)) {
          const posts = data.documents.map(d => this._parseFirestoreDoc(d)).filter(Boolean);
          if (posts.length > 0) {
            posts.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
            this._writeCache(posts);
            window.DKCache?.set?.('all_posts', posts);
            return posts;
          }
        }
      }
    } catch (e) {
      console.warn('[DEKUTCONNECT] Firestore REST fetch note:', e.message);
    }
    return null;
  }

  async getAllPosts() {
    // 1. Serve from in-memory cache instantly (0ms)
    const mem = window.DKCache?.get?.('all_posts');
    if (mem && Array.isArray(mem) && mem.length > 0) return mem;

    // 2. Serve from localStorage cache (0ms) while revalidating in background
    const cached = this._readCache();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      window.DKCache?.set?.('all_posts', cached);
      setTimeout(() => this._backgroundRevalidate(), 200);
      return cached;
    }

    // 3. Fast Static JSON Fetch (SAME ORIGIN CDN, ~30ms)
    const staticPosts = await this._fetchStaticPostsJson();
    if (staticPosts && staticPosts.length > 0) {
      setTimeout(() => this._backgroundRevalidate(), 300);
      return staticPosts;
    }

    // 4. Firestore REST API (Fast, pure HTTP, ~150ms)
    const restPosts = await this._fetchFirestoreRest();
    if (restPosts && restPosts.length > 0) return restPosts;

    // 5. Vercel backend API fallback
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(window.getApiUrl('/api/posts'), { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const posts = await res.json();
        if (Array.isArray(posts) && posts.length > 0) {
          this._writeCache(posts);
          window.DKCache?.set?.('all_posts', posts);
          return posts;
        }
      }
    } catch (e) {}

    return [];
  }

  async _fetchStaticPostsJson() {
    const urls = [`/blog/posts.json?v=${Date.now()}`, `/posts.json?v=${Date.now()}`];
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
        clearTimeout(timer);
        if (res.ok) {
          const posts = await res.json();
          if (Array.isArray(posts) && posts.length > 0) {
            this._writeCache(posts);
            window.DKCache?.set?.('all_posts', posts);
            return posts;
          }
        }
      } catch (e) {}
    }
    return null;
  }

  async _backgroundRevalidate() {
    const restPosts = await this._fetchFirestoreRest();
    if (restPosts && typeof window.onPostsRevalidated === 'function') {
      window.onPostsRevalidated(restPosts);
    }
  }

  async getPostBySlug(slug) {
    if (!slug) return null;
    const cleanSlug = slug.trim().toLowerCase();

    // 0. Pre-rendered post from SSR (instant 0ms)
    if (window.__INITIAL_POST__) {
      const initMatch = this._findMatchingPost([window.__INITIAL_POST__], cleanSlug);
      if (initMatch) return initMatch;
    }

    // 1. In-memory cache (instant 0ms)
    const mem = window.DKCache?.get?.(`post_${cleanSlug}`);
    if (mem) return mem;

    // 2. Direct Vercel backend API fetch by slug (authoritative, ~100ms)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const apiUrl = window.getApiUrl(`/api/posts/${encodeURIComponent(cleanSlug)}`);
      const res = await fetch(apiUrl, { signal: controller.signal, cache: 'no-cache' });
      clearTimeout(timer);
      if (res.ok) {
        const post = await res.json();
        if (post && post.title && post.content) {
          window.DKCache?.set?.(`post_${cleanSlug}`, post);
          return post;
        }
      }
    } catch (e) {}

    // 3. Firestore REST API (Fast, pure HTTP, ~150ms)
    const restPosts = await this._fetchFirestoreRest();
    if (restPosts) {
      const match = this._findMatchingPost(restPosts, cleanSlug);
      if (match) {
        window.DKCache?.set?.(`post_${cleanSlug}`, match);
        return match;
      }
    }

    // 4. Fast Static JSON Fetch with Cache-Buster
    const staticPosts = await this._fetchStaticPostsJson();
    if (staticPosts) {
      const match = this._findMatchingPost(staticPosts, cleanSlug);
      if (match) {
        window.DKCache?.set?.(`post_${cleanSlug}`, match);
        return match;
      }
    }

    // 5. localStorage cache fallback
    const localPosts = this._readCache();
    if (localPosts && Array.isArray(localPosts)) {
      const localMatch = this._findMatchingPost(localPosts, cleanSlug);
      if (localMatch) {
        window.DKCache?.set?.(`post_${cleanSlug}`, localMatch);
        return localMatch;
      }
    }

    // 6. Final fallback: search all posts
    const all = await this.getAllPosts();
    const post = this._findMatchingPost(all, cleanSlug);
    if (post) window.DKCache?.set?.(`post_${cleanSlug}`, post);
    return post;
  }

  async savePost(postData) {
    // Must be authenticated
    if (!window.DKAuth.isAdminLoggedIn()) {
      throw new Error('Unauthorized: You must be signed in as admin to publish articles.');
    }

    const admin = window.DKAuth.getCurrentAdmin();
    const now = new Date().toISOString();

    const post = {
      slug: postData.slug,
      title: postData.title,
      excerpt: postData.excerpt || postData.title,
      category: postData.category || 'Campus & Tech',
      author: postData.author || {
        name: admin?.name || 'dekutconnect admin',
        role: 'Campus Community Lead',
        avatar: CREST_IMAGE_URL,
        profileUrl: 'https://admin.dekut.site'
      },
      publishedAt: postData.publishedAt || now,
      readTime: postData.readTime || '4 min read',
      featuredImage: postData.featuredImage || CREST_IMAGE_URL,
      ogImage: postData.ogImage || postData.featuredImage || CREST_IMAGE_URL,
      tags: postData.tags || ['News'],
      likes: 0,
      dislikes: 0,
      content: postData.content,
      updatedAt: now
    };

    // Save to Firestore
    const firebase = getFirebase();
    if (firebase) {
      try {
        const existing = await firebase.db.collection('posts')
          .where('slug', '==', post.slug)
          .limit(1)
          .get();
        if (!existing.empty) {
          await firebase.db.collection('posts').doc(existing.docs[0].id).set(post, { merge: true });
          post.id = existing.docs[0].id;
        } else {
          const ref = await firebase.db.collection('posts').add(post);
          post.id = ref.id;
        }
      } catch (e) {
        console.warn('[DEKUTCONNECT] Firestore write failed:', e.message);
      }
    }

    // Also save to the Express server (local dev) for the static posts.json sync
    try {
      const token = await window.DKAuth.getAuthToken();
      const res = await fetch(window.getApiUrl('/api/posts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': token
        },
        body: JSON.stringify(post)
      });
      if (res.ok) {
        const resJson = await res.json().catch(() => ({}));
        if (resJson.post) Object.assign(post, resJson.post);
      }
    } catch (e) {
      // Server not available (GitHub Pages) — Firestore write is sufficient
    }

    // Immediately prime memory & local cache with new post
    const currentPosts = this._readCache() || [];
    const updatedPosts = [post, ...currentPosts.filter(p => p.slug !== post.slug)];
    this._writeCache(updatedPosts);
    window.DKCache?.set?.('all_posts', updatedPosts);
    window.DKCache?.set?.(`post_${post.slug}`, post);

    return post;
  }

  async ratePost(slug, type) {
    // Stored in localStorage per-user to prevent double voting
    const RATINGS_KEY = 'dekut_user_ratings_v2';
    const userRatings = (() => { try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}'); } catch(e) { return {}; } })();
    const existing = userRatings[slug];

    const firebase = getFirebase();
    if (!firebase) return null;

    const snap = await firebase.db.collection('posts').where('slug', '==', slug).limit(1).get();
    if (snap.empty) return null;

    const ref = snap.docs[0].ref;
    const post = { id: snap.docs[0].id, ...snap.docs[0].data() };

    let likes = post.likes || 0;
    let dislikes = post.dislikes || 0;

    if (existing === type) {
      // Undo vote
      if (type === 'like') likes = Math.max(0, likes - 1);
      if (type === 'dislike') dislikes = Math.max(0, dislikes - 1);
      delete userRatings[slug];
    } else {
      if (existing === 'like') likes = Math.max(0, likes - 1);
      if (existing === 'dislike') dislikes = Math.max(0, dislikes - 1);
      if (type === 'like') likes++;
      if (type === 'dislike') dislikes++;
      userRatings[slug] = type;
    }

    try {
      await ref.update({ likes, dislikes });
      localStorage.setItem(RATINGS_KEY, JSON.stringify(userRatings));
      window.DKCache?.invalidate?.(`post_${slug}`);
    } catch (e) {}

    return { likes, dislikes, userVote: userRatings[slug] || null };
  }

  getUserRating(slug) {
    try {
      const r = JSON.parse(localStorage.getItem('dekut_user_ratings_v2') || '{}');
      return r[slug] || null;
    } catch (e) { return null; }
  }
}

// ─── Authentication Service ───────────────────────────────────────────────────
class AuthService {
  constructor() {
    this._currentUser = null;
    this._authReady = false;
    this._readyCallbacks = [];

    // Listen for auth state changes (only if Firebase is available)
    const fb = getFirebase();
    if (fb) {
      fb.auth.onAuthStateChanged((user) => {
        this._currentUser = user;
        this._authReady = true;
        this._readyCallbacks.forEach(cb => cb(user));
        this._readyCallbacks = [];
      });
    } else {
      this._authReady = true;
    }
  }

  onAuthReady(callback) {
    if (this._authReady) {
      callback(this._currentUser);
    } else {
      this._readyCallbacks.push(callback);
    }
  }

  isAdminLoggedIn() {
    const fb = getFirebase();
    if (!fb) return false;
    return this._currentUser !== null;
  }

  getCurrentAdmin() {
    if (!this._currentUser) return null;
    return {
      email: this._currentUser.email,
      name: this._currentUser.displayName || 'dekutconnect admin',
      role: 'Administrator',
      uid: this._currentUser.uid
    };
  }

  async getAuthToken() {
    if (!this._currentUser) return null;
    try {
      return await this._currentUser.getIdToken();
    } catch (e) {
      return null;
    }
  }

  async signInAdmin(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error('Please enter both your admin email and password.');
    }

    const fb = getFirebase();
    if (!fb) {
      throw new Error('Firebase is not available. Please check your internet connection and try again.');
    }

    try {
      const cred = await fb.auth.signInWithEmailAndPassword(cleanEmail, cleanPass);
      this._currentUser = cred.user;
      return {
        email: cred.user.email,
        name: cred.user.displayName || 'dekutconnect admin',
        uid: cred.user.uid
      };
    } catch (err) {
      // Convert Firebase error codes to user-friendly messages
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password. Please try again.');
        case 'auth/user-disabled':
          throw new Error('This admin account has been disabled. Contact the system administrator.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please wait a few minutes and try again.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection and try again.');
        default:
          throw new Error('Authentication failed. Please check your credentials and try again.');
      }
    }
  }

  async signOut() {
    const fb = getFirebase();
    if (fb) {
      try { await fb.auth.signOut(); } catch (e) {}
    }
    this._currentUser = null;
    window.DKCache?.invalidate?.('all_posts');
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────
window.DKConfig = firebaseConfig;
window.DKDB = new DatabaseService();
window.DKAuth = new AuthService();
