/**
 * DEKUTCONNECT Post - Homepage & Blog Index Controller
 * Handles article listing, category filtering, search, breaking ticker,
 * real geolocation weather API, and high-scale cached rendering.
 */

const CREST_IMAGE_URL = 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg';

function resolveMediaUrl(url) {
  if (!url) return CREST_IMAGE_URL;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/media/')) {
    if (window.location.hostname === 'connect.dekut.site') {
      return 'https://dekutconnect.vercel.app' + url;
    }
    return url;
  }
  if (url.startsWith('/assets/')) {
    if (window.location.hostname === 'connect.dekut.site') {
      return '/blog' + url;
    }
  }
  return url;
}

document.addEventListener('DOMContentLoaded', async () => {
  const loaderOverlay = document.getElementById('loader-overlay');
  const maxLoaderTimeout = setTimeout(() => {
    if (loaderOverlay) loaderOverlay.classList.add('hidden');
  }, 800);

  try {
    const posts = await window.DKDB.getAllPosts();
    renderBlogIndex(posts);
  } catch (err) {
    console.error('Error initializing blog index:', err);
  } finally {
    clearTimeout(maxLoaderTimeout);
    if (loaderOverlay) {
      loaderOverlay.classList.add('hidden');
    }
  }

  setupCategoryFilters();
  setupSearch();
  setupNewsletter();
  updateCurrentDate();
  fetchRealWeatherForUser();
});

// Update human-readable newspaper date
function updateCurrentDate() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

// REAL WEATHER API FOR USER'S LOCATION
async function fetchRealWeatherForUser() {
  const weatherEl = document.getElementById('real-weather-widget');
  if (!weatherEl) return;

  const WMO_CODES = {
    0: 'CLEAR',
    1: 'MAINLY CLEAR',
    2: 'PARTLY CLOUDY',
    3: 'OVERCAST',
    45: 'FOGGY',
    48: 'FROST FOG',
    51: 'LIGHT DRIZZLE',
    53: 'MODERATE DRIZZLE',
    55: 'DENSE DRIZZLE',
    61: 'SLIGHT RAIN',
    63: 'MODERATE RAIN',
    65: 'HEAVY RAIN',
    71: 'LIGHT SNOW',
    80: 'RAIN SHOWERS',
    81: 'MODERATE SHOWERS',
    82: 'VIOLENT SHOWERS',
    95: 'THUNDERSTORM'
  };

  try {
    // Default to Nyeri, Kenya (DeKUT) coordinates
    let lat = -0.4167;
    let lon = 36.9500;
    let city = 'NYERI';

    // Try detecting user's real location via IP Geolocation
    try {
      const ipRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          lat = ipData.latitude;
          lon = ipData.longitude;
          city = ipData.city || ipData.region || 'LOCAL';
        }
      }
    } catch (e) {
      // IP lookup fallback
    }

    // Call Open-Meteo real weather API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const weatherRes = await fetch(weatherUrl, { signal: AbortSignal.timeout(4000) });
    
    if (weatherRes.ok) {
      const weatherData = await weatherRes.json();
      const current = weatherData.current_weather;
      if (current) {
        const temp = Math.round(current.temperature);
        const condition = WMO_CODES[current.weathercode] || 'MILD';
        weatherEl.textContent = `WEATHER: ${city.toUpperCase()} ${temp}°C • ${condition}`;
        return;
      }
    }
  } catch (err) {
    console.warn('Real weather API note:', err.message);
  }

  // Fallback
  weatherEl.textContent = 'WEATHER: NYERI 21°C • CLEAR';
}

// Render complete blog layout
function renderBlogIndex(posts) {
  if (!posts || posts.length === 0) {
    const mainGrid = document.getElementById('editorial-main-grid');
    if (mainGrid) {
      mainGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 0.75rem;">No Stories Published Yet</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Be the first to publish an article to the DEKUTCONNECT Post.</p>
          <a href="/editor.html" class="btn-new-post">Publish New Post</a>
        </div>
      `;
    }
    return;
  }

  // 1. Breaking News Ticker
  const breakingEl = document.getElementById('breaking-headline');
  if (breakingEl && posts[0]) {
    breakingEl.innerHTML = `<a href="/blog/${posts[0].slug}" style="color: inherit;">${escapeHtml(posts[0].title)}</a>`;
  }

  // 2. Featured Lead Story
  const featured = posts[0];
  const featuredContainer = document.getElementById('featured-story-container');
  if (featuredContainer && featured) {
    const authorProfile = featured.author?.profileUrl || 'https://admin.dekut.site';
    const isVideo = featured.mediaType === 'video' || !!featured.videoUrl;
    featuredContainer.innerHTML = `
      <article class="featured-story">
        <a href="/blog/${featured.slug}">
          <div class="featured-img-wrap">
            <span class="category-pill">${escapeHtml(featured.category)}</span>
            <img src="${resolveMediaUrl(featured.featuredImage)}" alt="${escapeHtml(featured.title)}" onerror="this.onerror=null;this.src='${CREST_IMAGE_URL}'" loading="eager" />
            ${isVideo ? `
              <div class="video-play-overlay">
                <div class="video-play-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                </div>
              </div>
              <span class="video-type-tag">VIDEO</span>
            ` : ''}
          </div>
        </a>
        <div class="featured-content">
          <h2 class="featured-title">
            <a href="/blog/${featured.slug}">${escapeHtml(featured.title)}</a>
          </h2>
          <p class="featured-excerpt">${makeDekutClickable(escapeHtml(featured.excerpt))}</p>
          <div class="post-meta-row">
            <div class="author-info">
              <a href="${authorProfile}" target="_blank" title="View Admin Profile (${authorProfile})">
                <img class="author-avatar" src="${featured.author?.avatar || 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg'}" alt="${featured.author?.name}" style="border: 1px solid #cbd5e1;" />
              </a>
              <div>
                <a href="${authorProfile}" target="_blank" style="color: inherit; text-decoration: underline;">
                  <strong>${escapeHtml(featured.author?.name || 'dekutconnect admin')}</strong>
                </a>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(featured.author?.role || 'Campus Community Lead')}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div>${new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${featured.readTime || '4 MIN READ'}</div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // 3. Section 1: In Case You Missed It Carousel (Image 1 Layout)
  renderInCaseYouMissedIt(posts);

  // 4. Section 2: More to Read For Free Grid (Image 2 Layout)
  renderMoreToRead(posts);

  // 5. Sub-Stories Grid (Remaining dispatches)
  const remaining = posts.slice(7);
  const subStoriesContainer = document.getElementById('sub-stories-grid');
  if (subStoriesContainer) {
    if (remaining.length === 0) {
      subStoriesContainer.innerHTML = '<p style="color: #64748b; font-size: 0.9rem; grid-column: 1/-1;">Explore all stories in the sections above.</p>';
      return;
    }

    subStoriesContainer.innerHTML = remaining.map(p => {
      const authorProfile = p.author?.profileUrl || 'https://admin.dekut.site';
      const isVideo = p.mediaType === 'video' || !!p.videoUrl;
      return `
        <article class="story-card" data-category="${p.category}" data-title="${escapeHtml(p.title.toLowerCase())}">
          <a href="/blog/${p.slug}" style="position: relative; display: block;">
            <img class="story-card-img" src="${resolveMediaUrl(p.featuredImage)}" alt="${escapeHtml(p.title)}" onerror="this.onerror=null;this.src='${CREST_IMAGE_URL}'" loading="lazy" />
            ${isVideo ? `
              <div class="video-play-overlay">
                <div class="video-play-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                </div>
              </div>
            ` : ''}
          </a>
          <div class="story-card-body">
            <span class="category-pill" style="position:static; align-self:flex-start; margin-bottom: 0.5rem;">${escapeHtml(p.category)}</span>
            <h3 class="story-card-title">
              <a href="/blog/${p.slug}">${escapeHtml(p.title)}</a>
            </h3>
            <p class="story-card-excerpt">${makeDekutClickable(escapeHtml(p.excerpt))}</p>
            <div class="post-meta-row">
              <div class="author-info">
                <a href="${authorProfile}" target="_blank">
                  <img class="author-avatar" style="width: 24px; height: 24px; border: 1px solid #cbd5e1;" src="${p.author?.avatar || CREST_IMAGE_URL}" alt="" onerror="this.onerror=null;this.src='${CREST_IMAGE_URL}'" />
                </a>
                <a href="${authorProfile}" target="_blank" style="color: inherit;">
                  <span>${escapeHtml(p.author?.name || 'dekutconnect admin')}</span>
                </a>
              </div>
              <span>${p.readTime || '3 MIN READ'}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }
}

// Render "In Case You Missed It" 3-column carousel section
function renderInCaseYouMissedIt(posts) {
  const container = document.getElementById('missed-it-carousel');
  const nextBtn = document.getElementById('missed-it-next-btn');
  if (!container) return;

  // Use articles 1 to 4 for carousel
  const missedPosts = posts.slice(1, 5);
  if (missedPosts.length === 0) return;

  container.innerHTML = missedPosts.map(p => {
    const isVideo = p.mediaType === 'video' || !!p.videoUrl;
    const metaText = p.sourceTag || p.readTime || '4 MIN READ';
    return `
      <a class="missed-card" href="/blog/${p.slug}">
        <div class="missed-card-media">
          <img src="${resolveMediaUrl(p.featuredImage)}" alt="${escapeHtml(p.title)}" onerror="this.onerror=null;this.src='${CREST_IMAGE_URL}'" loading="lazy" />
          ${isVideo ? `
            <div class="video-play-overlay">
              <div class="video-play-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
              </div>
            </div>
          ` : ''}
        </div>
        <h4 class="missed-card-title">${escapeHtml(p.title)}</h4>
        <div class="missed-card-meta">${escapeHtml(metaText)}</div>
      </a>
    `;
  }).join('');

  if (nextBtn) {
    nextBtn.onclick = () => {
      const scrollAmount = container.clientWidth * 0.75;
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };
  }
}

// Render "More to read for free" 2-column grid section
function renderMoreToRead(posts) {
  const container = document.getElementById('more-to-read-grid');
  if (!container) return;

  // Use articles 5 to 9 for grid
  const morePosts = posts.slice(4, 8);
  if (morePosts.length === 0) return;

  container.innerHTML = morePosts.map(p => {
    const isVideo = p.mediaType === 'video' || !!p.videoUrl;
    const categoryTag = p.sourceTag || (p.category ? p.category.toUpperCase() : '');
    return `
      <a class="more-card" href="/blog/${p.slug}">
        <div class="more-card-content">
          ${categoryTag ? `<span class="more-card-category">${escapeHtml(categoryTag)}</span>` : ''}
          <h4 class="more-card-title">${escapeHtml(p.title)}</h4>
          <div class="more-card-meta">${escapeHtml(p.readTime || '3 MIN READ')}</div>
        </div>
        <div class="more-card-thumb">
          <img src="${resolveMediaUrl(p.featuredImage)}" alt="${escapeHtml(p.title)}" onerror="this.onerror=null;this.src='${CREST_IMAGE_URL}'" loading="lazy" />
          ${isVideo ? `
            <div class="video-play-overlay">
              <div class="video-play-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
              </div>
            </div>
          ` : ''}
        </div>
      </a>
    `;
  }).join('');
}

function setupCategoryFilters() {
  const filterLinks = document.querySelectorAll('.nav-links a[data-category]');
  filterLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      filterLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const selectedCat = link.getAttribute('data-category');
      const allPosts = await window.DKDB.getAllPosts();

      if (selectedCat === 'All') {
        renderBlogIndex(allPosts);
      } else {
        const filtered = allPosts.filter(p => p.category.toLowerCase() === selectedCat.toLowerCase());
        renderBlogIndex(filtered);
      }
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('search-posts-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase().trim();
    const allPosts = await window.DKDB.getAllPosts();

    if (!query) {
      renderBlogIndex(allPosts);
      return;
    }

    const filtered = allPosts.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.excerpt.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
    );

    renderBlogIndex(filtered);
  });
}

function setupNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();

    if (!email) return;

    try {
      const res = await window.LegalSuite.handleNewsletterSignup(email, 'sidebar');
      alert(`🎉 Welcome to DEKUTCONNECT Post!\n\n${res.message}`);
      emailInput.value = '';
    } catch (err) {
      // User canceled or failed verification
    }
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function makeDekutClickable(text) {
  if (!text) return '';
  const parts = text.split(/(<a\b[^>]*>.*?<\/a>)/gi);
  return parts.map(part => {
    if (part.toLowerCase().startsWith('<a')) return part;
    return part
      .replace(/\b(Dedan Kimathi University of Technology)\b/gi, '<a href="https://www.dkut.ac.ke/" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">$1</a>')
      .replace(/\b(Dedan Kimathi University)\b/gi, '<a href="https://www.dkut.ac.ke/" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">$1</a>')
      .replace(/\b(DeKUT)\b/g, '<a href="https://www.dkut.ac.ke/" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">$1</a>');
  }).join('');
}
