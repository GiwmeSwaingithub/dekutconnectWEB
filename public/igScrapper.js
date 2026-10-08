document.addEventListener('DOMContentLoaded', function() {
    const snippets = document.querySelectorAll('.ig-stats');
    const config = {
        apiUrls: [
            'https://ig-analytics-vercel.vercel.app/api/profile?username=',
            'https://instascrapper-mocha.vercel.app/api/profile?username='
        ]
    };

    // Function to try multiple API endpoints
    async function fetchProfileData(username) {
        for (const apiUrl of config.apiUrls) {
            try {
                const response = await fetch(`${apiUrl}${username}`);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error(`Error fetching from ${apiUrl}:`, error);
            }
        }
        throw new Error('Failed to fetch data from all endpoints');
    }

    snippets.forEach(snippet => {
        const username = snippet.dataset.username;
        if (username) {
            fetchProfileData(username)
                .then(data => {
                    const content = snippet.querySelector('.ig-content');
                    const loading = content.querySelector('.ig-loading');
                    const profile = data.profile;
                    
                    const statsHTML = `
                        <div class="ig-username">
                            @${profile.username}
                            ${profile.is_verified ? '<span class="ig-verified"><i class="fas fa-check-circle"></i></span>' : ''}
                        </div>
                        <div class="ig-grid">
                            <div class="ig-stat">
                                <div class="ig-value">${formatNumber(profile.posts_count)}</div>
                                <div class="ig-label">Posts</div>
                            </div>
                            <div class="ig-stat">
                                <div class="ig-value">${formatNumber(profile.followers)}</div>
                                <div class="ig-label">Followers</div>
                            </div>
                            <div class="ig-stat">
                                <div class="ig-value">${formatNumber(profile.following)}</div>
                                <div class="ig-label">Following</div>
                            </div>
                        </div>
                    `;
                    
                    loading.style.display = 'none';
                    content.innerHTML = statsHTML;
                    
                    // Make entire card clickable to Instagram profile
                    snippet.addEventListener('click', function() {
                        window.open(`https://instagram.com/${profile.username}`, '_blank');
                    });
                })
                .catch(error => {
                    const content = snippet.querySelector('.ig-content');
                    const loading = content.querySelector('.ig-loading');
                    loading.style.display = 'none';
                    content.innerHTML = '<div class="ig-error"><p>Failed to load stats</p></div>';
                    
                    // Still make card clickable even if stats failed
                    snippet.addEventListener('click', function() {
                        window.open(`https://instagram.com/${username}`, '_blank');
                    });
                });
        }
    });
    
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
});
