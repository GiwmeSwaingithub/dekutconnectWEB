/**
 * DEKUTCONNECT Post - Homepage & Blog Index Controller
 * Handles article listing, category filtering, search, breaking ticker,
 * real geolocation weather API, and high-scale cached rendering.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const loaderOverlay = document.getElementById('loader-overlay');
  const maxLoaderTimeout = setTimeout(() => {
    if (loaderOverlay) loaderOverlay.classList.add('hidden');
  }, 1000);

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
    featuredContainer.innerHTML = `
      <article class="featured-story">
        <a href="/blog/${featured.slug}">
          <div class="featured-img-wrap">
            <span class="category-pill">${escapeHtml(featured.category)}</span>
            <img src="${featured.featuredImage}" alt="${escapeHtml(featured.title)}" loading="eager" />
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
              <div style="font-size: 0.75rem; color: var(--text-muted);">${featured.readTime || '4 min read'}</div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // 3. Sub-Stories Grid
  const remaining = posts.slice(1);
  const subStoriesContainer = document.getElementById('sub-stories-grid');
  if (subStoriesContainer) {
    if (remaining.length === 0) {
      subStoriesContainer.innerHTML = '';
      return;
    }

    subStoriesContainer.innerHTML = remaining.map(p => {
      const authorProfile = p.author?.profileUrl || 'https://admin.dekut.site';
      return `
        <article class="story-card" data-category="${p.category}" data-title="${escapeHtml(p.title.toLowerCase())}">
          <a href="/blog/${p.slug}">
            <img class="story-card-img" src="${p.featuredImage}" alt="${escapeHtml(p.title)}" loading="lazy" />
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
                  <img class="author-avatar" style="width: 24px; height: 24px; border: 1px solid #cbd5e1;" src="${p.author?.avatar || 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg'}" alt="" />
                </a>
                <a href="${authorProfile}" target="_blank" style="color: inherit;">
                  <span>${escapeHtml(p.author?.name || 'dekutconnect admin')}</span>
                </a>
              </div>
              <span>${p.readTime || '3 min'}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }
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
