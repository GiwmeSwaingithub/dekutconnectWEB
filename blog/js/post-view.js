/**
 * DEKUTCONNECT Post - Single Post Page Controller
 * Handles article rendering, Instagram embeds, Reader Consent Gate,
 * Li-Deheng Rating Component, and Social Sharing
 */

var CREST_IMAGE_URL = window.CREST_IMAGE_URL || 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg';

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

async function initPostView() {
  const loaderOverlay = document.getElementById('loader-overlay');
  if (loaderOverlay) {
    loaderOverlay.classList.add('hidden');
    loaderOverlay.style.display = 'none';
  }

  // 0. Instant SSR Hydration if server pre-rendered the article
  if (window.__INITIAL_POST__) {
    try {
      renderPost(window.__INITIAL_POST__);
    } catch (e) {
      console.warn('Hydration note:', e.message);
    }
  }

  // Parse slug from ?slug= query param or directly from path (/blog/movie or /blog/movie.html)
  const params = new URLSearchParams(window.location.search);
  let slug = params.get('slug');
  if (!slug) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length >= 1) {
      const lastPart = parts[parts.length - 1].replace(/\.html$/, '');
      if (lastPart && lastPart !== 'blog' && lastPart !== 'index' && lastPart !== 'post' && lastPart !== 'editor' && lastPart !== 'dmca') {
        slug = lastPart;
      }
    }
  }

  const targetSlug = slug || 'parents-portal-for-monitoring-students-academic-performance-and-more';

  // If already rendered via SSR matching targetSlug, skip re-fetching
  if (window.__INITIAL_POST__ && (window.__INITIAL_POST__.slug === targetSlug || (targetSlug.includes('parents') && window.__INITIAL_POST__.slug.includes('parents')))) {
    return;
  }

  try {
    const post = await window.DKDB.getPostBySlug(targetSlug);

    if (!post) {
      showError('Article Not Found', `The requested article "${targetSlug}" could not be located.`);
    } else {
      renderPost(post);
    }
  } catch (err) {
    console.error('Error loading article:', err);
    showError('Unable to Load Article', err.message || 'Please refresh or return to the front page.');
  } finally {
    if (loaderOverlay) {
      loaderOverlay.classList.add('hidden');
      loaderOverlay.style.display = 'none';
    }
  }
}

let _postViewInitialized = false;
function safeInitPostView() {
  if (_postViewInitialized) return;
  _postViewInitialized = true;
  initPostView();
}

window.initPostView = initPostView;

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  safeInitPostView();
} else {
  document.addEventListener('DOMContentLoaded', safeInitPostView);
  window.addEventListener('load', safeInitPostView);
}

function renderPost(post) {
  document.title = `${post.title} — DEKUTCONNECT Post`;

  const categoryEl = document.getElementById('article-category');
  if (categoryEl) categoryEl.textContent = post.category || 'General';

  const titleEl = document.getElementById('article-title');
  if (titleEl) titleEl.textContent = post.title;

  const deckEl = document.getElementById('article-deck');
  if (deckEl) deckEl.textContent = post.excerpt || '';

  const authorNameEl = document.getElementById('author-name');
  if (authorNameEl) authorNameEl.textContent = post.author?.name || 'dekutconnect admin';

  const authorRoleEl = document.getElementById('author-role');
  if (authorRoleEl) authorRoleEl.textContent = post.author?.role || 'Campus Community Lead';

  const authorProfileUrl = post.author?.profileUrl || 'https://admin.dekut.site';

  const authorNameLink = document.getElementById('author-name-link');
  if (authorNameLink) authorNameLink.href = authorProfileUrl;

  const authorProfileLink = document.getElementById('author-profile-link');
  if (authorProfileLink) authorProfileLink.href = authorProfileUrl;

  const authorAvatarEl = document.getElementById('author-avatar');
  if (authorAvatarEl) {
    authorAvatarEl.src = post.author?.avatar || CREST_IMAGE_URL;
    authorAvatarEl.alt = post.author?.name || 'dekutconnect admin';
  }

  const dateEl = document.getElementById('publish-date');
  if (dateEl) {
    const d = new Date(post.publishedAt || Date.now());
    dateEl.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const readTimeEl = document.getElementById('read-time');
  if (readTimeEl) readTimeEl.textContent = post.readTime || '4 min read';

  // Featured Media (Photo or Video Feature)
  const heroMediaEl = document.getElementById('article-hero-media');
  if (heroMediaEl) {
    const isVideo = post.mediaType === 'video' || !!post.videoUrl || (post.featuredImage && (post.featuredImage.endsWith('.mp4') || post.featuredImage.endsWith('.webm')));
    const rawVideoSrc = post.videoUrl || post.featuredImage;
    const videoSrc = resolveMediaUrl(rawVideoSrc);
    const resolvedHeroImg = resolveMediaUrl(post.featuredImage);

    if (isVideo && videoSrc) {
      if (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be')) {
        let ytId = '';
        if (videoSrc.includes('youtu.be/')) ytId = videoSrc.split('youtu.be/')[1].split('?')[0];
        else if (videoSrc.includes('v=')) ytId = videoSrc.split('v=')[1].split('&')[0];
        else if (videoSrc.includes('embed/')) ytId = videoSrc.split('embed/')[1].split('?')[0];
        const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=0` : videoSrc;

        heroMediaEl.innerHTML = `
          <div class="article-hero-video-container">
            <iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
          <div class="article-caption">Video feature — DEKUTCONNECT Post Digital Edition</div>
        `;
      } else {
        heroMediaEl.innerHTML = `
          <div class="article-hero-video-container">
            <video controls playsinline poster="${resolvedHeroImg || ''}">
              <source src="${videoSrc}" type="video/mp4">
              Your browser does not support HTML5 video playback.
            </video>
          </div>
          <div class="article-caption">Video feature — DEKUTCONNECT Post Digital Edition</div>
        `;
      }
    } else if (post.featuredImage) {
      heroMediaEl.innerHTML = `
        <img src="${resolvedHeroImg}" alt="${escapeHtml(post.title)}" onerror="this.onerror=null;this.src='${CREST_IMAGE_URL}'" />
        <div class="article-caption">Photo / Media feature — DEKUTCONNECT Post Digital Edition</div>
      `;
    }
  }

  // Article Body
  const bodyEl = document.getElementById('article-body');
  if (bodyEl) {
    let parsedContent = window.IGEmbed ? window.IGEmbed.processContent(post.content) : (post.content || '');
    parsedContent = parseSimpleMarkdown(parsedContent);
    bodyEl.innerHTML = parsedContent;
    window.IGEmbed?.loadScript?.();
  }

  // Tags
  const tagsContainer = document.getElementById('article-tags');
  if (tagsContainer && post.tags && post.tags.length) {
    tagsContainer.innerHTML = post.tags.map(t => `<span class="category-pill" style="position:static; margin-right: 0.5rem;">#${escapeHtml(t)}</span>`).join('');
  }

  // Setup Uiverse.io Li-Deheng Rating Component
  try { setupRatingComponent(post); } catch (e) {}

  // Setup Social Sharing
  try { setupShareButtons(post); } catch (e) {}

  // Load Related Stories
  try { loadRelatedStories(post); } catch (e) {}
}

function setupRatingComponent(post) {
  const container = document.getElementById('post-rating-container');
  if (!container) return;

  const likeCheckbox = document.getElementById('like-checkbox');
  const dislikeCheckbox = document.getElementById('dislike-checkbox');
  const likeCount = document.querySelector('.like-text-content');
  const dislikeCount = document.querySelector('.dislike-text-content');
  const closeBtn = container.querySelector('.btn-close');

  if (likeCount) likeCount.textContent = post.likes || 0;
  if (dislikeCount) dislikeCount.textContent = post.dislikes || 0;

  const existingVote = window.DKDB.getUserRating(post.slug);
  if (existingVote === 'like' && likeCheckbox) likeCheckbox.checked = true;
  if (existingVote === 'dislike' && dislikeCheckbox) dislikeCheckbox.checked = true;

  if (likeCheckbox) {
    likeCheckbox.addEventListener('change', async () => {
      window.LegalSuite.requestAgeVerification(async (verified) => {
        if (!verified) {
          likeCheckbox.checked = false;
          return;
        }

        if (dislikeCheckbox && dislikeCheckbox.checked) {
          dislikeCheckbox.checked = false;
        }

        const res = await window.DKDB.ratePost(post.slug, 'like');
        if (res) {
          if (likeCount) likeCount.textContent = res.likes;
          if (dislikeCount) dislikeCount.textContent = res.dislikes;
          likeCheckbox.checked = (res.userVote === 'like');
        }
      });
    });
  }

  if (dislikeCheckbox) {
    dislikeCheckbox.addEventListener('change', async () => {
      window.LegalSuite.requestAgeVerification(async (verified) => {
        if (!verified) {
          dislikeCheckbox.checked = false;
          return;
        }

        if (likeCheckbox && likeCheckbox.checked) {
          likeCheckbox.checked = false;
        }

        const res = await window.DKDB.ratePost(post.slug, 'dislike');
        if (res) {
          if (likeCount) likeCount.textContent = res.likes;
          if (dislikeCount) dislikeCount.textContent = res.dislikes;
          dislikeCheckbox.checked = (res.userVote === 'dislike');
        }
      });
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      container.style.display = 'none';
    });
  }
}

function setupShareButtons(post) {
  const shareUrl = window.location.origin ? `${window.location.origin}/blog/${post.slug}` : `https://connect.dekut.site/blog/${post.slug}`;
  const shareTitle = `${post.title} — DEKUTCONNECT Post`;

  const btnWhatsapp = document.getElementById('share-whatsapp');
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + '\n' + shareUrl)}`, '_blank');
    });
  }

  const btnX = document.getElementById('share-x');
  if (btnX) {
    btnX.addEventListener('click', () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
  }

  const btnFb = document.getElementById('share-facebook');
  if (btnFb) {
    btnFb.addEventListener('click', () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });
  }

  const btnLinkedIn = document.getElementById('share-linkedin');
  if (btnLinkedIn) {
    btnLinkedIn.addEventListener('click', () => {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
  }

  const btnCopy = document.getElementById('share-copy');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        const origText = btnCopy.innerHTML;
        btnCopy.innerHTML = `✓ Copied Link`;
        setTimeout(() => { btnCopy.innerHTML = origText; }, 2000);
      });
    });
  }
}

function parseSimpleMarkdown(text) {
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
      const resolvedSrc = resolveMediaUrl(src);
      return `<div class="article-hero-video-container" style="margin: 1.5rem 0;"><video controls playsinline src="${resolvedSrc}"></video></div>`;
    })
    .replace(/\!\[(.*?)\]\((.*?)\)/gim, (m, alt, src) => {
      const resolvedSrc = resolveMediaUrl(src);
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

  return makeDekutClickable(html);
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

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function loadRelatedStories(currentPost) {
  const container = document.getElementById('related-stories-grid');
  if (!container) return;

  const allPosts = await window.DKDB.getAllPosts();
  const related = allPosts.filter(p => p.slug !== currentPost.slug).slice(0, 3);

  if (related.length === 0) return;

  container.innerHTML = related.map(p => {
    const authorProfile = p.author?.profileUrl || 'https://admin.dekut.site';
    return `
      <article class="story-card">
        <a href="/blog/${p.slug}">
          <img class="story-card-img" src="${p.featuredImage}" alt="${escapeHtml(p.title)}" loading="lazy" />
        </a>
        <div class="story-card-body">
          <span class="category-pill" style="position:static; align-self:flex-start; margin-bottom: 0.5rem;">${escapeHtml(p.category)}</span>
          <h4 class="story-card-title">
            <a href="/blog/${p.slug}">${escapeHtml(p.title)}</a>
          </h4>
          <p class="story-card-excerpt">${escapeHtml(p.excerpt)}</p>
          <div class="post-meta-row">
            <a href="${authorProfile}" target="_blank" style="color: inherit;">
              <span>${p.author?.name || 'dekutconnect admin'}</span>
            </a>
            <span>${p.readTime || '3 min'}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function showError(title, msg) {
  const titleEl = document.getElementById('article-title');
  if (titleEl) titleEl.textContent = title;

  const deckEl = document.getElementById('article-deck');
  if (deckEl) deckEl.textContent = msg;

  const heroMediaEl = document.getElementById('article-hero-media');
  if (heroMediaEl) heroMediaEl.innerHTML = '';

  const bodyEl = document.getElementById('article-body');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: #b91c1c; margin-bottom: 1rem;">${escapeHtml(title)}</h3>
        <p style="color: #64748b; margin-bottom: 2rem;">${escapeHtml(msg)}</p>
        <a href="/blog" class="btn-new-post" style="padding: 0.6rem 1.2rem;">Return to DEKUTCONNECT Front Page</a>
      </div>
    `;
  }
}
