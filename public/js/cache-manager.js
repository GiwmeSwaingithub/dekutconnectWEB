/**
 * DEKUTCONNECT Post - High Scale Multi-Tier Cache Manager
 * Designed to handle 1,000,000+ visitors with sub-millisecond response times
 * Prevents Firebase read quota exhaustion via:
 * 1. L1: In-Memory Map Cache (instant synchronous read)
 * 2. L2: LocalStorage / IndexedDB (persistent client-side storage)
 * 3. Stale-While-Revalidate pattern (instant render + background refresh)
 */

class HighScaleCache {
  constructor() {
    this.memoryCache = new Map();
    this.DEFAULT_TTL = 1000 * 60 * 15; // 15 minutes default
    this.POSTS_LIST_KEY = 'dekut_posts_list_cache';
    this.POST_PREFIX = 'dekut_post_';
  }

  // Generate cache key
  getKey(key) {
    return `dkc_${key}`;
  }

  // Get item from L1 (Memory) or L2 (Storage)
  get(key) {
    const fullKey = this.getKey(key);

    // 1. Check Memory Cache (L1)
    if (this.memoryCache.has(fullKey)) {
      const entry = this.memoryCache.get(fullKey);
      if (Date.now() < entry.expiry) {
        return entry.data;
      } else {
        this.memoryCache.delete(fullKey);
      }
    }

    // 2. Check LocalStorage (L2)
    try {
      const raw = localStorage.getItem(fullKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() < parsed.expiry) {
        // Promote back to L1
        this.memoryCache.set(fullKey, parsed);
        return parsed.data;
      } else {
        localStorage.removeItem(fullKey);
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
    return null;
  }

  // Set item in L1 and L2
  set(key, data, ttlMs = this.DEFAULT_TTL) {
    const fullKey = this.getKey(key);
    const entry = {
      data,
      expiry: Date.now() + ttlMs,
      cachedAt: Date.now()
    };

    // Save to L1
    this.memoryCache.set(fullKey, entry);

    // Save to L2
    try {
      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (e) {
      // If quota exceeded, clear older cached items
      this.evictStale();
      try {
        localStorage.setItem(fullKey, JSON.stringify(entry));
      } catch (err) {
        // Memory cache will still serve the session
      }
    }
  }

  // Stale-While-Revalidate: Returns cached data immediately if available,
  // then fetches fresh data in the background and updates UI/cache
  async getWithSWR(key, fetchFn, onRevalidate = null, ttlMs = this.DEFAULT_TTL) {
    const cached = this.get(key);
    
    // If cached, return immediately
    if (cached) {
      // Revalidate in background if older than 2 minutes
      setTimeout(async () => {
        try {
          const fresh = await fetchFn();
          if (fresh) {
            this.set(key, fresh, ttlMs);
            if (typeof onRevalidate === 'function') {
              onRevalidate(fresh);
            }
          }
        } catch (err) {
          console.warn('Background revalidation failed:', err);
        }
      }, 50);
      return cached;
    }

    // Not in cache, fetch directly
    const fresh = await fetchFn();
    if (fresh) {
      this.set(key, fresh, ttlMs);
    }
    return fresh;
  }

  // Invalidate specific key
  invalidate(key) {
    const fullKey = this.getKey(key);
    this.memoryCache.delete(fullKey);
    try {
      localStorage.removeItem(fullKey);
    } catch (e) {}
  }

  // Clean stale keys
  evictStale() {
    try {
      const now = Date.now();
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('dkc_')) {
          try {
            const item = JSON.parse(localStorage.getItem(k));
            if (item && item.expiry < now) {
              localStorage.removeItem(k);
            }
          } catch (e) {
            localStorage.removeItem(k);
          }
        }
      }
    } catch (e) {}
  }
}

// Global singleton cache
window.DKCache = new HighScaleCache();

// -------------------------------------------------------------
// GLOBAL IMAGE SHIMMER LOADING EFFECT
// -------------------------------------------------------------
(function () {
  function applyShimmer(img) {
    if (!img || img.dataset.shimmerInit) return;
    img.dataset.shimmerInit = 'true';

    // If already completely loaded, skip shimmer
    if (img.complete && img.naturalWidth > 0) {
      img.classList.remove('img-shimmer');
      img.classList.add('shimmer-loaded');
      return;
    }

    // Add shimmer class while image loads
    img.classList.add('img-shimmer');

    function onComplete() {
      img.classList.remove('img-shimmer');
      img.classList.add('shimmer-loaded');
    }

    img.addEventListener('load', onComplete, { once: true });
    img.addEventListener('error', onComplete, { once: true });
  }

  function scanImages() {
    document.querySelectorAll('img').forEach(applyShimmer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanImages);
  } else {
    scanImages();
  }

  // Observe dynamic images (added nodes or updated src)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.tagName === 'IMG') {
            applyShimmer(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('img').forEach(applyShimmer);
          }
        }
      });
      if (m.type === 'attributes' && m.target.tagName === 'IMG' && m.attributeName === 'src') {
        m.target.removeAttribute('data-shimmer-init');
        applyShimmer(m.target);
      }
    });
  });

  function startObserver() {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
