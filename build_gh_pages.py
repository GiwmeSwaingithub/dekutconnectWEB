import os
import json
import shutil
import re

REPO_DIR = r'c:\Users\Hacker\Documents\antigravity\amazing-maxwell'
PUBLIC_DIR = os.path.join(REPO_DIR, 'public')
POSTS_FILE = os.path.join(REPO_DIR, 'posts.json')
BLOG_DIR = os.path.join(REPO_DIR, 'blog')

CREST_IMAGE_URL = 'https://i.postimg.cc/TY5RBJKk/560442384-17856268296536413-2485079652577777705-n-jpg-stp-dst-jpg-s150x150-tt6-efg-ey-J2ZW5jb2Rl-X3R.jpg'

def escape_html(text):
    if not text:
        return ''
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#039;'))

def fix_html_asset_paths(html_content):
    """
    Ensure all stylesheet link tags and script tags use /blog/ relative or base /blog/ paths.
    """
    # Fix absolute root CSS paths -> /blog/css/ or css/
    html_content = re.sub(r'href="/css/', 'href="/blog/css/', html_content)
    # Fix absolute root JS paths -> /blog/js/ or js/
    html_content = re.sub(r'src="/js/', 'src="/blog/js/', html_content)
    # Fix absolute root images -> /blog/images/ or images/
    html_content = re.sub(r'src="/images/', 'src="/blog/images/', html_content)
    html_content = re.sub(r'href="/images/', 'href="/blog/images/', html_content)
    # Fix absolute root assets -> /blog/assets/
    html_content = re.sub(r'src="/assets/', 'src="/blog/assets/', html_content)
    html_content = re.sub(r'href="/assets/', 'href="/blog/assets/', html_content)

    # Fix navigation links to stay within /blog/
    html_content = re.sub(r'href="/editor\.html"', 'href="/blog/editor.html"', html_content)
    html_content = re.sub(r'href="/editor"', 'href="/blog/editor.html"', html_content)
    html_content = re.sub(r'href="/dmca\.html"', 'href="/blog/dmca.html"', html_content)
    html_content = re.sub(r'href="/dmca"', 'href="/blog/dmca.html"', html_content)
    html_content = re.sub(r'href="/legal-audit\.html"', 'href="/blog/legal-audit.html"', html_content)
    html_content = re.sub(r'href="/legal-audit"', 'href="/blog/legal-audit.html"', html_content)
    html_content = re.sub(r'href="/"', 'href="/blog"', html_content)

    return html_content

def build():
    print("=== Building GitHub Pages Static Bundle ===")
    
    # Ensure blog directory exists
    os.makedirs(BLOG_DIR, exist_ok=True)
    
    # Copy public folders (css, js, fonts, images, assets) to blog/
    for sub in ['css', 'js', 'fonts', 'images', 'assets']:
        src_path = os.path.join(PUBLIC_DIR, sub)
        dst_path = os.path.join(BLOG_DIR, sub)
        if os.path.exists(src_path):
            if os.path.exists(dst_path):
                shutil.rmtree(dst_path)
            shutil.copytree(src_path, dst_path)
            print(f"Copied {sub} -> blog/{sub}")

    # Copy posts.json into blog/posts.json and REPO_DIR/posts.json
    shutil.copy(POSTS_FILE, os.path.join(BLOG_DIR, 'posts.json'))
    print("Copied posts.json -> blog/posts.json")

    # Load posts
    with open(POSTS_FILE, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    # Process and write HTML files (index.html, editor.html, dmca.html, legal-audit.html, post.html, manifest.json)
    html_files = ['index.html', 'editor.html', 'dmca.html', 'legal-audit.html', 'post.html', 'manifest.json']
    for hf in html_files:
        src_file = os.path.join(PUBLIC_DIR, hf)
        if os.path.exists(src_file):
            with open(src_file, 'r', encoding='utf-8') as f:
                content = f.read()
            fixed_content = fix_html_asset_paths(content)
            dst_file = os.path.join(BLOG_DIR, hf)
            with open(dst_file, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"Processed {hf} -> blog/{hf}")

    # Load post template
    post_template_path = os.path.join(PUBLIC_DIR, 'post.html')
    with open(post_template_path, 'r', encoding='utf-8') as f:
        post_template = f.read()
    post_template = fix_html_asset_paths(post_template)

    # Generate pre-rendered static HTML files for every post in posts.json
    for post in posts:
        slug = post.get('slug')
        if not slug:
            continue

        canonical_url = f"https://connect.dekut.site/blog/{slug}"
        og_img = post.get('ogImage') or post.get('featuredImage') or CREST_IMAGE_URL
        escaped_title = escape_html(post.get('title', ''))
        escaped_desc = escape_html(post.get('excerpt', ''))

        html = post_template
        html = re.sub(r'<title>.*?</title>', f'<title>{escaped_title} — DEKUTCONNECT Post</title>', html, flags=re.IGNORECASE)
        html = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{canonical_url}">', html, flags=re.IGNORECASE)
        html = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{escaped_desc}">', html, flags=re.IGNORECASE)

        # Open Graph
        html = re.sub(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{canonical_url}">', html, flags=re.IGNORECASE)
        html = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{escaped_title}">', html, flags=re.IGNORECASE)
        html = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{escaped_desc}">', html, flags=re.IGNORECASE)
        html = re.sub(r'<meta property="og:image" content=".*?">', f'<meta property="og:image" content="{og_img}">', html, flags=re.IGNORECASE)

        # Twitter Card
        html = re.sub(r'<meta name="twitter:url" content=".*?">', f'<meta name="twitter:url" content="{canonical_url}">', html, flags=re.IGNORECASE)
        html = re.sub(r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{escaped_title}">', html, flags=re.IGNORECASE)
        html = re.sub(r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{escaped_desc}">', html, flags=re.IGNORECASE)
        html = re.sub(r'<meta name="twitter:image" content=".*?">', f'<meta name="twitter:image" content="{og_img}">', html, flags=re.IGNORECASE)

        # Write blog/<slug>.html
        post_html_file = os.path.join(BLOG_DIR, f"{slug}.html")
        with open(post_html_file, 'w', encoding='utf-8') as f:
            f.write(html)

        # Write blog/<slug>/index.html
        post_dir = os.path.join(BLOG_DIR, slug)
        os.makedirs(post_dir, exist_ok=True)
        with open(os.path.join(post_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(html)

        print(f"Generated static post pages for: {slug}")

    # Generate smart 404.html in root and blog/404.html for SPA GitHub Pages fallback
    smart_404_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DEKUTCONNECT Post — Loading Article...</title>
  <script>
    (function() {
      var path = window.location.pathname;
      var parts = path.split('/').filter(Boolean);
      
      // If path is under /blog/<slug>
      if (parts.length >= 1) {
        var slug = parts[parts.length - 1].replace(/\\.html$/, '');
        if (slug && slug !== 'blog' && slug !== 'index') {
          window.location.replace('/blog/post.html?slug=' + encodeURIComponent(slug));
          return;
        }
      }
      window.location.replace('/blog');
    })();
  </script>
</head>
<body>
  <p>Redirecting to DEKUTCONNECT Post...</p>
</body>
</html>
"""
    with open(os.path.join(REPO_DIR, '404.html'), 'w', encoding='utf-8') as f:
        f.write(smart_404_content)
    with open(os.path.join(BLOG_DIR, '404.html'), 'w', encoding='utf-8') as f:
        f.write(smart_404_content)
    print("Created 404.html fallback pages.")

if __name__ == '__main__':
    build()
