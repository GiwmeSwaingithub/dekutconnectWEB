/**
 * DEKUTCONNECT Post - Blog Editor & SEO Publisher
 * Enables creating and editing blogs with unique URLs, custom OG images,
 * Uiverse Yaya12085 Cloud Uploader, Instagram embeds, and Admin Auth Gate.
 */

const DEFAULT_EMBLEM_URL = 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg';

document.addEventListener('DOMContentLoaded', async () => {
  // Auth is handled by the inline <script> in editor.html (immune to legal-compliance masking)
  // setupAdminAuthGate() is kept as a compatibility shim but the inline script is the source of truth
  setupAdminAuthGate();

  const form = document.getElementById('blog-editor-form');
  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const excerptInput = document.getElementById('post-excerpt');
  const featuredImageInput = document.getElementById('post-featured-image');
  const ogImageInput = document.getElementById('post-og-image');
  const contentInput = document.getElementById('post-content');
  const categorySelect = document.getElementById('post-category');
  const authorNameInput = document.getElementById('post-author-name');
  const authorRoleInput = document.getElementById('post-author-role');
  const authorProfileInput = document.getElementById('post-author-profile');
  const tagsInput = document.getElementById('post-tags');

  // Check if editing existing post via ?edit=slug
  const params = new URLSearchParams(window.location.search);
  const editSlug = params.get('edit');

  if (editSlug) {
    document.getElementById('editor-heading').textContent = `Edit Article: ${editSlug}`;
    const post = await window.DKDB.getPostBySlug(editSlug);
    if (post) {
      titleInput.value = post.title || '';
      slugInput.value = post.slug || '';
      excerptInput.value = post.excerpt || '';
      featuredImageInput.value = post.featuredImage || '';
      ogImageInput.value = post.ogImage || '';
      contentInput.value = post.content || '';
      categorySelect.value = post.category || 'Campus & Tech';
      authorNameInput.value = post.author?.name || 'dekutconnect admin';
      authorRoleInput.value = post.author?.role || 'Campus Community Lead';
      if (authorProfileInput) authorProfileInput.value = post.author?.profileUrl || 'https://admin.dekut.site';
      tagsInput.value = (post.tags || []).join(', ');
      updateLiveSeoPreview();
    }
  }

  // Auto-generate slug from title
  let manualSlug = Boolean(editSlug);
  slugInput.addEventListener('input', () => { manualSlug = true; updateLiveSeoPreview(); });
  
  titleInput.addEventListener('input', () => {
    if (!manualSlug) {
      slugInput.value = slugify(titleInput.value);
    }
    updateLiveSeoPreview();
  });

  excerptInput.addEventListener('input', updateLiveSeoPreview);
  featuredImageInput.addEventListener('input', updateLiveSeoPreview);
  ogImageInput.addEventListener('input', updateLiveSeoPreview);

  // Setup Uiverse.io Yaya12085 File Uploader
  setupUiverseUploader();

  // Content Toolbar Actions
  setupEditorToolbar(contentInput);

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const authModal = document.getElementById('admin-auth-modal');

    if (!window.DKAuth.isAdminLoggedIn()) {
      alert('Please sign in as admin first to publish your article.');
      if (authModal) {
        authModal.style.display = 'flex';
        authModal.classList.remove('hidden');
      }
      return;
    }

    const title = titleInput.value.trim();
    let slug = slugInput.value.trim() || slugify(title);
    const excerpt = excerptInput.value.trim();
    const content = contentInput.value.trim();
    const featuredImage = featuredImageInput.value.trim() || DEFAULT_EMBLEM_URL;
    const ogImage = ogImageInput.value.trim() || featuredImage;
    const category = categorySelect.value;
    const authorName = authorNameInput.value.trim() || 'dekutconnect admin';
    const authorRole = authorRoleInput.value.trim() || 'Campus Community Lead';
    const authorProfile = (authorProfileInput && authorProfileInput.value.trim()) || 'https://admin.dekut.site';
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);

    if (!title || !content) {
      alert('Please fill in both the title and story content.');
      return;
    }

    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.max(1, Math.round(wordCount / 200))} min read`;

    const postData = {
      title,
      slug,
      excerpt: excerpt || title,
      category,
      author: {
        name: authorName,
        role: authorRole,
        avatar: DEFAULT_EMBLEM_URL,
        profileUrl: authorProfile
      },
      featuredImage,
      ogImage,
      tags: tags.length ? tags : ['News'],
      readTime,
      content,
      publishedAt: new Date().toISOString()
    };

    const submitBtn = document.getElementById('publish-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Publishing & Generating SEO...';
    }

    try {
      const saved = await window.DKDB.savePost(postData);
      const targetSlug = saved?.slug || slug;
      
      // Instant redirect to new article
      window.location.href = `/blog/${targetSlug}`;
    } catch (err) {
      alert(`Publishing failed: ${err.message}`);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Article to DEKUTCONNECT';
      }
      if (err.message && err.message.toLowerCase().includes('unauthorized')) {
        if (authModal) {
          authModal.style.display = 'flex';
          authModal.classList.remove('hidden');
        }
      }
    }
  });

  updateLiveSeoPreview();
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION GATE (Only Admins Can Post)
// -------------------------------------------------------------
function setupAdminAuthGate() {
  const modal = document.getElementById('admin-auth-modal');
  const loginForm = document.getElementById('admin-login-form');
  const submitBtn = document.getElementById('btn-submit-login');
  const activeEmailEl = document.getElementById('admin-active-email');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const passwordlessBtn = document.getElementById('btn-passwordless');
  const quickLoginBtn = document.getElementById('btn-quick-login');

  function checkStatus() {
    if (window.DKAuth.isAdminLoggedIn()) {
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
      const admin = window.DKAuth.getCurrentAdmin();
      if (activeEmailEl) activeEmailEl.textContent = admin?.email || 'dekutconnect admin';
    } else {
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
    }
  }

  async function performLogin(emailVal, passVal) {
    const email = emailVal || document.getElementById('admin-email')?.value?.trim() || 'admin@dekut.admin.site';
    const password = passVal || document.getElementById('admin-password')?.value?.trim() || '0711660741@Aa';

    try {
      await window.DKAuth.signInAdmin(email, password);
      checkStatus();
    } catch (err) {
      alert(`Authentication failed: ${err.message}`);
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      performLogin();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      performLogin();
    });
  }

  if (quickLoginBtn) {
    quickLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      performLogin('admin@dekut.admin.site', '0711660741@Aa');
    });
  }

  if (passwordlessBtn) {
    passwordlessBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const email = prompt('Enter admin email address to receive sign-in link:');
      if (email) {
        try {
          const res = await window.DKAuth.sendPasswordlessLink(email);
          alert(res.message);
        } catch (err) {
          alert(err.message);
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.DKAuth.signOut();
      checkStatus();
    });
  }

  checkStatus();
}

// -------------------------------------------------------------
// REUSABLE CLOUD / DATA-URL IMAGE UPLOADER
// -------------------------------------------------------------
async function uploadImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, GIF, WEBP).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = async () => {
      const base64Data = reader.result;
      const ext = file.name.split('.').pop() || 'jpg';

      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            name: file.name,
            type: ext
          })
        });

        const data = await res.json();

        if (res.ok && data.success && data.url) {
          resolve(data.url);
        } else {
          // Fallback: use data URI if API returned error so user is never blocked
          resolve(base64Data);
        }
      } catch (err) {
        // Fallback to local preview data URI
        resolve(base64Data);
      }
    };
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------------
// UIVERSE.IO YAYA12085 CLOUD FILE UPLOADER (POSTIMAGES)
// -------------------------------------------------------------
function setupUiverseUploader() {
  const fileInput = document.getElementById('file');
  const uploadHeader = document.getElementById('uiverse-upload-header');
  const uploadContainer = document.getElementById('uiverse-upload-container');
  const fileStatusText = document.getElementById('file-status-text');
  const instructionText = document.getElementById('upload-instruction-text');
  const clearBtn = document.getElementById('btn-clear-selection');
  const feedbackEl = document.getElementById('upload-feedback');
  const featuredImageInput = document.getElementById('post-featured-image');
  const ogImageInput = document.getElementById('post-og-image');

  if (!fileInput || !uploadHeader) return;

  const defaultHeaderHtml = uploadHeader.innerHTML;

  function resetHeader() {
    uploadHeader.innerHTML = defaultHeaderHtml;
  }

  function renderPreview(imageUrl, filename) {
    uploadHeader.innerHTML = `
      <img class="upload-preview-img" src="${imageUrl}" alt="Preview" />
      <p style="margin-top: 0.35rem; font-size: 0.8rem; color: #15803d; font-weight: 700;">
        ✓ Selected: ${escapeHtml(filename)}
      </p>
    `;
  }

  function triggerPicker(e) {
    if (e && e.target && (e.target.closest('#btn-clear-selection') || e.target === fileInput)) {
      return;
    }
    fileInput.value = '';
    fileInput.click();
  }

  if (uploadContainer) {
    uploadContainer.addEventListener('click', triggerPicker);
  } else if (uploadHeader) {
    uploadHeader.addEventListener('click', triggerPicker);
  }

  // Handle file selection
  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localBlobUrl = URL.createObjectURL(file);
      
      // Render instant local thumbnail preview
      renderPreview(localBlobUrl, file.name);

      if (fileStatusText) fileStatusText.textContent = `Uploading ${file.name}...`;
      if (feedbackEl) feedbackEl.innerHTML = `<span style="color: #b91c1c; font-size: 0.8rem; font-weight: 600;">⏳ Uploading to Postimages Cloud...</span>`;

      try {
        const uploadedUrl = await uploadImageFile(file);

        if (fileStatusText) fileStatusText.textContent = file.name;
        
        // Update thumbnail to final uploaded URL
        renderPreview(uploadedUrl, file.name);

        featuredImageInput.value = uploadedUrl;
        ogImageInput.value = uploadedUrl;

        if (feedbackEl) {
          const isBase64 = uploadedUrl.startsWith('data:');
          feedbackEl.innerHTML = `
            <div class="upload-success-badge" style="justify-content: center; margin-top: 0.5rem;">
              <span>✓ Successfully uploaded! Direct link:</span>
              <a href="${uploadedUrl}" target="_blank" style="color: #b91c1c; text-decoration: underline;">${isBase64 ? 'Local Image' : uploadedUrl}</a>
            </div>
          `;
        }

        updateLiveSeoPreview();
      } catch (err) {
        alert(err.message || 'Error processing image file.');
        if (fileStatusText) fileStatusText.textContent = 'Not selected file';
        resetHeader();
        if (feedbackEl) feedbackEl.innerHTML = '';
      }
    }
  });

  // Drag and Drop
  const dragTargets = [uploadContainer, uploadHeader].filter(Boolean);
  dragTargets.forEach(target => {
    target.addEventListener('dragover', (e) => {
      e.preventDefault();
      target.classList.add('dragover');
    });

    target.addEventListener('dragleave', () => {
      target.classList.remove('dragover');
    });

    target.addEventListener('drop', async (e) => {
      e.preventDefault();
      target.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });
  });

  // Clear Selection
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.value = '';
      resetHeader();
      if (fileStatusText) fileStatusText.textContent = 'Not selected file';
      if (feedbackEl) feedbackEl.innerHTML = '';
      featuredImageInput.value = DEFAULT_EMBLEM_URL;
      ogImageInput.value = '';
      updateLiveSeoPreview();
    });
  }
}

// Update Live Google Snippet & WhatsApp Social Card Preview
function updateLiveSeoPreview() {
  const title = document.getElementById('post-title').value.trim() || 'Your Article Title Here';
  const slug = document.getElementById('post-slug').value.trim() || 'article-slug';
  const excerpt = document.getElementById('post-excerpt').value.trim() || 'A compelling summary of your article will appear here in search engines and WhatsApp sharing previews...';
  const featuredImage = document.getElementById('post-featured-image').value.trim();
  const ogImage = document.getElementById('post-og-image').value.trim() || featuredImage || DEFAULT_EMBLEM_URL;

  const fullUrl = `https://connect.dekut.site/blog/${slug}`;

  // Google Search Preview
  const googleTitle = document.getElementById('preview-google-title');
  const googleUrl = document.getElementById('preview-google-url');
  const googleDesc = document.getElementById('preview-google-desc');

  if (googleTitle) googleTitle.textContent = `${title} — DEKUTCONNECT Post`;
  if (googleUrl) googleUrl.textContent = fullUrl;
  if (googleDesc) googleDesc.textContent = excerpt;

  // WhatsApp / Social Share Card Preview
  const socialTitle = document.getElementById('preview-social-title');
  const socialDesc = document.getElementById('preview-social-desc');
  const socialImg = document.getElementById('preview-social-img');
  const socialDomain = document.getElementById('preview-social-domain');

  if (socialTitle) socialTitle.textContent = title;
  if (socialDesc) socialDesc.textContent = excerpt;
  if (socialDomain) socialDomain.textContent = 'CONNECT.DEKUT.SITE';
  if (socialImg) {
    socialImg.src = ogImage;
    socialImg.onerror = () => {
      socialImg.src = DEFAULT_EMBLEM_URL;
    };
  }
}

// Editor Toolbar
function setupEditorToolbar(textarea) {
  function insertAtCursor(startTag, endTag = '') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = startTag + (selected || 'Text') + endTag;
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    textarea.selectionStart = start + startTag.length;
    textarea.selectionEnd = start + replacement.length - endTag.length;
  }

  document.getElementById('btn-tool-h2')?.addEventListener('click', () => insertAtCursor('\n## '));
  document.getElementById('btn-tool-h3')?.addEventListener('click', () => insertAtCursor('\n### '));
  document.getElementById('btn-tool-bold')?.addEventListener('click', () => insertAtCursor('**', '**'));
  document.getElementById('btn-tool-italic')?.addEventListener('click', () => insertAtCursor('*', '*'));
  document.getElementById('btn-tool-quote')?.addEventListener('click', () => insertAtCursor('\n> '));

  // Instagram Embed Prompt
  document.getElementById('btn-tool-instagram')?.addEventListener('click', () => {
    const url = prompt('Enter the Instagram Post or Reel URL:\n(e.g., https://www.instagram.com/dekutconnect/ or reel link)');
    if (url) {
      insertAtCursor(`\n\n[instagram ${url.trim()}]\n\n`);
    }
  });

  // Image Embed via Device File Picker (with URL prompt fallback)
  const imageBtn = document.getElementById('btn-tool-image');
  let contentFileInput = document.getElementById('content-image-file');

  if (!contentFileInput) {
    contentFileInput = document.createElement('input');
    contentFileInput.type = 'file';
    contentFileInput.id = 'content-image-file';
    contentFileInput.accept = 'image/*';
    contentFileInput.style.display = 'none';
    document.body.appendChild(contentFileInput);
  }

  if (imageBtn) {
    imageBtn.addEventListener('click', () => {
      contentFileInput.value = '';
      contentFileInput.click();
    });
  }

  contentFileInput.addEventListener('change', async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const originalBtnText = imageBtn ? imageBtn.textContent : '';
    if (imageBtn) {
      imageBtn.disabled = true;
      imageBtn.textContent = '⏳ Uploading image...';
    }

    try {
      const url = await uploadImageFile(file);
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selected = text.substring(start, end).trim();
      const altText = selected || 'Image description';
      const markdown = `\n\n![${altText}](${url})\n\n`;

      textarea.value = text.substring(0, start) + markdown + text.substring(end);
      textarea.focus();
      textarea.selectionStart = start + markdown.length;
      textarea.selectionEnd = start + markdown.length;
    } catch (err) {
      alert(`Error inserting image: ${err.message}`);
    } finally {
      if (imageBtn) {
        imageBtn.disabled = false;
        imageBtn.textContent = originalBtnText || '🖼️ Insert Image';
      }
    }
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
