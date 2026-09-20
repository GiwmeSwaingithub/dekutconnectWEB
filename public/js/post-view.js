/**
 * DEKUTCONNECT Post - Single Post Page Controller
 * Handles article rendering, Instagram embeds, Reader Consent Gate,
 * Li-Deheng Rating Component, and Social Sharing
 */

const CREST_IMAGE_URL = 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg';

document.addEventListener('DOMContentLoaded', async () => {
  setupReaderConsent();

  const params = new URLSearchParams(window.location.search);
  let slug = params.get('slug');
  if (!slug) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'blog') {
      slug = parts[1];
    }
  }

  const loaderOverlay = document.getElementById('loader-overlay');
  
  if (!slug) {
    showError('Article Not Found', 'No article slug specified.');
    if (loaderOverlay) loaderOverlay.classList.add('hidden');
    return;
  }

  try {
    const post = await window.DKDB.getPostBySlug(slug);

    if (!post) {
      showError('Article Not Found', `The requested article "${slug}" does not exist.`);
      if (loaderOverlay) loaderOverlay.classList.add('hidden');
      return;
    }

    renderPost(post);
  } catch (err) {
    console.error('Error loading article:', err);
    showError('Error Loading Article', err.message);
  } finally {
    if (loaderOverlay) {
      setTimeout(() => loaderOverlay.classList.add('hidden'), 250);
    }
  }
});

// Mandatory Reader Consent Gate (Before User Reads)
function setupReaderConsent() {
  const gate = document.getElementById('reader-consent-gate');
  const agreeBtn = document.getElementById('btn-consent-agree');

  if (!gate) return;

  const hasConsented = localStorage.getItem('dekut_reader_consent') === 'true';
  if (hasConsented) {
    gate.classList.add('consented');
  } else {
    gate.classList.remove('consented');
  }

  if (agreeBtn) {
    agreeBtn.addEventListener('click', () => {
      localStorage.setItem('dekut_reader_consent', 'true');
      localStorage.setItem('dekut_coppa_verified', 'true');
      gate.classList.add('consented');
    });
  }
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

  // Featured Media
  const heroMediaEl = document.getElementById('article-hero-media');
  if (heroMediaEl && post.featuredImage) {
    heroMediaEl.innerHTML = `
      <img src="${post.featuredImage}" alt="${escapeHtml(post.title)}" />
      <div class="article-caption">Photo / Media feature — DEKUTCONNECT Post Digital Edition</div>
    `;
  }

  // Article Body
  const bodyEl = document.getElementById('article-body');
  if (bodyEl) {
    let parsedContent = window.IGEmbed.processContent(post.content);
    parsedContent = parseSimpleMarkdown(parsedContent);
    bodyEl.innerHTML = parsedContent;
    window.IGEmbed.loadScript();
  }

  // Tags
  const tagsContainer = document.getElementById('article-tags');
  if (tagsContainer && post.tags && post.tags.length) {
    tagsContainer.innerHTML = post.tags.map(t => `<span class="category-pill" style="position:static; margin-right: 0.5rem;">#${escapeHtml(t)}</span>`).join('');
  }

  // Setup Uiverse.io Li-Deheng Rating Component
  setupRatingComponent(post);

  // Setup Social Sharing
  setupShareButtons(post);

  // Load Related Stories
  loadRelatedStories(post);
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
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color: #b91c1c; text-decoration: underline;">$1</a>')
    .split(/\n\n+/)
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<div') || p.startsWith('<li>') || p.startsWith('<a')) {
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
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <h2 style="font-family: var(--font-serif); font-size: 2rem; color: #b91c1c; margin-bottom: 1rem;">${escapeHtml(title)}</h2>
        <p style="color: #64748b; margin-bottom: 2rem;">${escapeHtml(msg)}</p>
        <a href="/blog" class="btn-new-post" style="padding: 0.6rem 1.2rem;">Back to DEKUTCONNECT Post</a>
      </div>
    `;
  }
}
