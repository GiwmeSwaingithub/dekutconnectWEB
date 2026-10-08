import os
import json
import shutil
import re
import time

REPO_DIR = r'c:\Users\Hacker\Documents\antigravity\amazing-maxwell'
PUBLIC_DIR = os.path.join(REPO_DIR, 'public')
POSTS_FILE = os.path.join(REPO_DIR, 'posts.json')
BLOG_DIR = os.path.join(REPO_DIR, 'blog')

BUILD_VERSION = int(time.time())

def fix_html_asset_paths(html_content):
    """
    Ensure all stylesheet link tags and script tags use /blog/ relative or base /blog/ paths with cache-busting version query parameters.
    """
    html_content = re.sub(r'href="/css/', 'href="/blog/css/', html_content)
    html_content = re.sub(r'src="/js/', 'src="/blog/js/', html_content)
    html_content = re.sub(r'src="/images/', 'src="/blog/images/', html_content)
    html_content = re.sub(r'href="/images/', 'href="/blog/images/', html_content)
    html_content = re.sub(r'src="/assets/', 'src="/blog/assets/', html_content)
    html_content = re.sub(r'href="/assets/', 'href="/blog/assets/', html_content)

    html_content = re.sub(r'src="(/blog/js/[^"?]+)(\?v=\d+)?"', f'src="\\1?v={BUILD_VERSION}"', html_content)
    html_content = re.sub(r'href="(/blog/css/[^"?]+)(\?v=\d+)?"', f'href="\\1?v={BUILD_VERSION}"', html_content)

    html_content = re.sub(r'href="/editor\.html"', 'href="/blog/editor.html"', html_content)
    html_content = re.sub(r'href="/editor"', 'href="/blog/editor.html"', html_content)
    html_content = re.sub(r'href="/dmca\.html"', 'href="/blog/dmca.html"', html_content)
    html_content = re.sub(r'href="/dmca"', 'href="/blog/dmca.html"', html_content)
    html_content = re.sub(r'href="/legal-audit\.html"', 'href="/blog/legal-audit.html"', html_content)
    html_content = re.sub(r'href="/legal-audit"', 'href="/blog/legal-audit.html"', html_content)

    return html_content

def build():
    print("=== Building GitHub Pages & Static Bundles ===")
    
    os.makedirs(BLOG_DIR, exist_ok=True)

    # Clean up old post HTML files and post folders in blog/
    core_files = {'index.html', 'editor.html', 'dmca.html', 'legal-audit.html', 'post.html', '404.html', 'manifest.json', 'posts.json'}
    core_dirs = {'css', 'js', 'fonts', 'images', 'assets'}
    for item in os.listdir(BLOG_DIR):
        item_path = os.path.join(BLOG_DIR, item)
        if os.path.isfile(item_path):
            if item.endswith('.html') and item not in core_files:
                os.remove(item_path)
        elif os.path.isdir(item_path):
            if item not in core_dirs:
                shutil.rmtree(item_path)
    
    # Copy public folders (css, js, fonts, images, assets) to root and blog/
    for sub in ['css', 'js', 'fonts', 'images', 'assets']:
        src_path = os.path.join(PUBLIC_DIR, sub)
        dst_blog_path = os.path.join(BLOG_DIR, sub)
        dst_root_path = os.path.join(REPO_DIR, sub)
        if os.path.exists(src_path):
            if os.path.exists(dst_blog_path):
                shutil.rmtree(dst_blog_path)
            shutil.copytree(src_path, dst_blog_path)

            if os.path.exists(dst_root_path):
                shutil.rmtree(dst_root_path)
            shutil.copytree(src_path, dst_root_path)
            print(f"Copied {sub} -> blog/{sub} & {sub}")

    # Copy partnership, go, and oraimo folders to root
    for folder in ['partnership', 'go', 'oraimo']:
        src_folder = os.path.join(PUBLIC_DIR, folder)
        dst_folder = os.path.join(REPO_DIR, folder)
        if os.path.exists(src_folder):
            if os.path.exists(dst_folder):
                shutil.rmtree(dst_folder)
            shutil.copytree(src_folder, dst_folder)
            print(f"Copied {folder} -> {folder}/")

    # Copy posts.json
    shutil.copy(POSTS_FILE, os.path.join(BLOG_DIR, 'posts.json'))
    shutil.copy(POSTS_FILE, os.path.join(PUBLIC_DIR, 'posts.json'))
    print("Copied posts.json -> blog/posts.json")

    # Root index.html should be the main portal homepage (connect.dekut.site)
    home_html_file = os.path.join(PUBLIC_DIR, 'home.html')
    if os.path.exists(home_html_file):
        shutil.copy(home_html_file, os.path.join(REPO_DIR, 'index.html'))
        print("Copied home.html -> index.html (Root Portal)")

    # Process and write blog HTML templates (into blog/)
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

    # Generate smart 404.html SPA renderer
    post_html_file = os.path.join(PUBLIC_DIR, 'post.html')
    if os.path.exists(post_html_file):
        with open(post_html_file, 'r', encoding='utf-8') as f:
            post_content = f.read()
        smart_404_content = fix_html_asset_paths(post_content)
    else:
        smart_404_content = "404 Not Found"

    with open(os.path.join(REPO_DIR, '404.html'), 'w', encoding='utf-8') as f:
        f.write(smart_404_content)
    with open(os.path.join(BLOG_DIR, '404.html'), 'w', encoding='utf-8') as f:
        f.write(smart_404_content)
    print("Created 404.html SPA fallback pages.")
    print("=== Build Complete ===")

if __name__ == '__main__':
    build()
