import os
import json
import shutil
import re

REPO_DIR = r'c:\Users\Hacker\Documents\antigravity\amazing-maxwell'
PUBLIC_DIR = os.path.join(REPO_DIR, 'public')
POSTS_FILE = os.path.join(REPO_DIR, 'posts.json')
BLOG_DIR = os.path.join(REPO_DIR, 'blog')

def fix_html_asset_paths(html_content):
    """
    Ensure all stylesheet link tags and script tags use /blog/ relative or base /blog/ paths.
    """
    # Fix absolute root CSS paths -> /blog/css/
    html_content = re.sub(r'href="/css/', 'href="/blog/css/', html_content)
    # Fix absolute root JS paths -> /blog/js/
    html_content = re.sub(r'src="/js/', 'src="/blog/js/', html_content)
    # Fix absolute root images -> /blog/images/
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

    return html_content

def build():
    print("=== Building GitHub Pages & Vercel Static Bundle (Firestore Engine) ===")
    
    # Ensure blog directory exists
    os.makedirs(BLOG_DIR, exist_ok=True)

    # Clean up old post HTML files and post folders in blog/
    core_files = {'index.html', 'editor.html', 'dmca.html', 'legal-audit.html', 'post.html', '404.html', 'manifest.json', 'posts.json'}
    core_dirs = {'css', 'js', 'fonts', 'images', 'assets'}
    for item in os.listdir(BLOG_DIR):
        item_path = os.path.join(BLOG_DIR, item)
        if os.path.isfile(item_path):
            if item.endswith('.html') and item not in core_files:
                os.remove(item_path)
                print(f"Cleaned up legacy post file: blog/{item}")
        elif os.path.isdir(item_path):
            if item not in core_dirs:
                shutil.rmtree(item_path)
                print(f"Cleaned up legacy post directory: blog/{item}")
    
    # Copy public folders (css, js, fonts, images, assets) to blog/
    for sub in ['css', 'js', 'fonts', 'images', 'assets']:
        src_path = os.path.join(PUBLIC_DIR, sub)
        dst_path = os.path.join(BLOG_DIR, sub)
        if os.path.exists(src_path):
            if os.path.exists(dst_path):
                shutil.rmtree(dst_path)
            shutil.copytree(src_path, dst_path)
            print(f"Copied {sub} -> blog/{sub}")

    # Copy posts.json into blog/posts.json
    shutil.copy(POSTS_FILE, os.path.join(BLOG_DIR, 'posts.json'))
    shutil.copy(POSTS_FILE, os.path.join(PUBLIC_DIR, 'posts.json'))
    print("Copied posts.json -> blog/posts.json")

    # Process and write core HTML templates
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

    # Generate smart 404.html fallback
    smart_404_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DEKUTCONNECT Post — Loading Article...</title>
  <script>
    (function() {
      var path = window.location.pathname;
      var parts = path.split('/').filter(Boolean);
      
      if (parts.length >= 1) {
        var slug = parts[parts.length - 1].replace(/\\.html$/, '');
        if (slug && slug !== 'blog' && slug !== 'index' && slug !== 'editor' && slug !== 'dmca') {
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
    print("Created 404.html SPA fallback pages.")
    print("=== Build Complete: All post metadata managed live via Firebase Firestore ===")

if __name__ == '__main__':
    build()
