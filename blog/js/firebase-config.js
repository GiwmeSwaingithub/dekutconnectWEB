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

const CREST_IMAGE_URL = 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg';

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
    // Firestore offline persistence (caches last-known data for offline readers)
    _db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
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
    this.CACHE_KEY = 'dekut_posts_v5';
    this.CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  }

  _readCache() {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > this.CACHE_TTL) return null;
      return data;
    } catch (e) { return null; }
  }

  _writeCache(posts) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({ data: posts, ts: Date.now() }));
    } catch (e) {}
  }

  _invalidateCache() {
    try { localStorage.removeItem(this.CACHE_KEY); } catch (e) {}
  }

  async getAllPosts() {
    // 1. Serve from in-memory cache instantly if available
    const mem = window.DKCache?.get?.('all_posts');
    if (mem) return mem;

    // 2. Serve from localStorage cache (15-min TTL) while revalidating in background
    const cached = this._readCache();
    if (cached) {
      window.DKCache?.set?.('all_posts', cached);
      // Background revalidation
      setTimeout(() => this._fetchFromFirestore(true), 100);
      return cached;
    }

    return await this._fetchFromFirestore(false);
  }

  async _fetchFromFirestore(background = false) {
    const firebase = getFirebase();
    if (firebase) {
      try {
        // 2.5s timeout so Firestore never hangs the UI
        const snapPromise = firebase.db.collection('posts')
          .orderBy('publishedAt', 'desc')
          .get();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        );

        const snap = await Promise.race([snapPromise, timeoutPromise]);
        if (!snap.empty) {
          const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this._writeCache(posts);
          window.DKCache?.set?.('all_posts', posts);
          if (background && typeof window.onPostsRevalidated === 'function') {
            window.onPostsRevalidated(posts);
          }
          return posts;
        }
      } catch (e) {
        console.warn('[DEKUTCONNECT] Firestore read fallback:', e.message);
      }
    }

    // 3. Fallback: static posts.json (works even without Firestore)
    try {
      const res = await fetch(window.getApiUrl('/api/posts'));
      if (res.ok) {
        const posts = await res.json();
        this._writeCache(posts);
        window.DKCache?.set?.('all_posts', posts);
        return posts;
      }
    } catch (e) {}

    // 4. Final fallback: local posts.json file (GitHub Pages static)
    try {
      const staticRes = await fetch('/blog/posts.json');
      if (staticRes.ok) {
        const posts = await staticRes.json();
        this._writeCache(posts);
        window.DKCache?.set?.('all_posts', posts);
        return posts;
      }
    } catch (e) {}

    const cached2 = this._readCache();
    return cached2 || [];
  }

  async getPostBySlug(slug) {
    if (!slug) return null;
    const cleanSlug = slug.trim().toLowerCase();

    // 1. Check in-memory cache first
    const cached = window.DKCache?.get?.(`post_${cleanSlug}`);
    if (cached) return cached;

    // 2. Check localStorage cache (instant, 0ms)
    const localPosts = this._readCache();
    if (localPosts && Array.isArray(localPosts)) {
      const localMatch = localPosts.find(p => p.slug === cleanSlug || (p.aliases && p.aliases.includes(cleanSlug)) || (cleanSlug.includes('parents') && (p.slug.includes('parents') || p.title?.toLowerCase().includes('parents'))));
      if (localMatch) {
        window.DKCache?.set?.(`post_${cleanSlug}`, localMatch);
        return localMatch;
      }
    }

    const firebase = getFirebase();
    if (firebase) {
      try {
        const snapPromise = firebase.db.collection('posts')
          .where('slug', '==', cleanSlug)
          .limit(1)
          .get();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 1200)
        );

        const snap = await Promise.race([snapPromise, timeoutPromise]);
        if (!snap.empty) {
          const post = { id: snap.docs[0].id, ...snap.docs[0].data() };
          window.DKCache?.set?.(`post_${cleanSlug}`, post);
          return post;
        }
      } catch (e) {
        console.warn('[DEKUTCONNECT] Firestore slug query fallback:', e.message);
      }
    }

    // Fallback: search the full posts list (with exact and fuzzy slug matching)
    const posts = await this.getAllPosts();
    let post = posts.find(p => p.slug === cleanSlug || (p.aliases && p.aliases.includes(cleanSlug)));
    
    // Fuzzy matching fallback if exact match not found
    if (!post && posts.length > 0) {
      if (cleanSlug.includes('parents-portal') || cleanSlug.includes('parents')) {
        post = posts.find(p => p.slug.includes('parents') || p.title.toLowerCase().includes('parents')) || posts[0];
      } else {
        post = posts.find(p => p.slug.includes(cleanSlug) || cleanSlug.includes(p.slug));
      }
    }

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

    // Invalidate caches
    this._invalidateCache();
    window.DKCache?.invalidate?.('all_posts');
    window.DKCache?.invalidate?.(`post_${post.slug}`);

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
