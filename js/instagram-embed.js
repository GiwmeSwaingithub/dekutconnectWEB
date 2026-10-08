/**
 * DEKUTCONNECT Post - Instagram Media Embed Engine
 * Seamlessly embeds Instagram Photos, Videos, and Reels
 * Supports both official embed script and responsive iframe fallback
 */

class InstagramEmbedEngine {
  constructor() {
    this.scriptLoaded = false;
  }

  // Extract Instagram ID and Type (p = post, reel = reel)
  parseInstagramUrl(url) {
    if (!url) return null;
    const cleanUrl = url.trim();
    // Matches: instagram.com/p/ID, instagram.com/reel/ID, instagram.com/tv/ID
    const match = cleanUrl.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (match) {
      return {
        type: match[1],
        id: match[2],
        permalink: `https://www.instagram.com/${match[1]}/${match[2]}/`
      };
    }
    return null;
  }

  // Render embed HTML
  renderEmbed(url) {
    const data = this.parseInstagramUrl(url);
    if (!data) {
      return `<div class="p-4 bg-gray-100 text-red-600 rounded">Invalid Instagram URL: ${url}</div>`;
    }

    // Embed structure with responsive container & fallback
    return `
      <div class="instagram-embed-box" data-ig-id="${data.id}">
        <blockquote 
          class="instagram-media" 
          data-instgrm-captioned 
          data-instgrm-permalink="${data.permalink}?utm_source=ig_embed&amp;utm_campaign=loading" 
          data-instgrm-version="14" 
          style="background:#FFF; border:0; border-radius:12px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"
        >
          <div style="padding:16px;">
            <a href="${data.permalink}" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank" rel="noopener noreferrer">
              <div style="display: flex; flex-direction: row; align-items: center;">
                <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                  <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                  <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                </div>
              </div>
              <div style="padding: 19% 0;"></div>
              <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                      <g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.497,60.657 531,56.16 531,50.657 C531,45.154 535.497,40.657 541,40.657 C546.503,40.657 551,45.154 551,50.657 C551,56.16 546.503,60.657 541,60.657 M541,36.657 C533.268,36.657 527,42.925 527,50.657 C527,58.389 533.268,64.657 541,64.657 C548.732,64.657 555,58.389 555,50.657 C555,42.925 548.732,36.657 541,36.657"></path></g>
                    </g>
                  </g>
                </svg>
              </div>
              <div style="padding-top: 8px;">
                <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View post on Instagram</div>
              </div>
            </a>
          </div>
        </blockquote>
      </div>
    `;
  }

  // Load Instagram official embed JS safely
  loadScript() {
    if (this.scriptLoaded || window.instgrm) {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = 'https://www.instagram.com/embed.js';
    script.onload = () => {
      this.scriptLoaded = true;
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    };
    document.body.appendChild(script);
  }

  // Process all Instagram tags in a body of text
  processContent(content) {
    if (!content) return '';

    // Replace [instagram URL] tags
    let processed = content.replace(/\[instagram\s+(https?:\/\/[^\s\]]+)\]/gi, (match, url) => {
      return this.renderEmbed(url);
    });

    // Also support standalone Instagram URLs on their own line
    processed = processed.replace(/^(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?)$/gm, (match, url) => {
      return this.renderEmbed(url);
    });

    return processed;
  }
}

window.IGEmbed = new InstagramEmbedEngine();
