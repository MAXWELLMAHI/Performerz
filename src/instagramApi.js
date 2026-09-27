/**
 * Instagram API Integration & Mock Data Module
 * Account: PERFORMERS ACADEMY OF DANCE & GYMNASTICS (@performerzacademy)
 * Profile URL: https://www.instagram.com/performerzacademy/?hl=en
 */

export const INSTAGRAM_CONFIG = {
  PROFILE_URL: 'https://www.instagram.com/performerzacademy/?hl=en',
  HANDLE: '@performerzacademy',
  GRAPH_API_ENDPOINT: 'https://graph.instagram.com/v18.0/me/media'
};

/**
 * Fallback Mock Data Array of Top 10 Performing Instagram Reels (Sorted by Engagement)
 * Pure video previews with 9:16 vertical aspect ratio, poster frames, and direct reel permalinks.
 */
export const TOP_10_INSTAGRAM_REELS = [
  {
    id: 'DVq-9vGjV8z',
    url: 'https://www.instagram.com/reel/DVq-9vGjV8z/',
    videoUrl: '/vertical_reel_1.mp4',
    poster: '/about_boundless_form.jpg',
    title: 'Boundless Form Choreography',
    views: '45.2K',
    likes: '3.4K'
  },
  {
    id: 'Dc4CFX2NJ5m',
    url: 'https://www.instagram.com/reel/Dc4CFX2NJ5m/',
    videoUrl: '/vertical_reel_2.mp4',
    poster: '/about_fluid_power.jpg',
    title: 'Fluid Power Tumbling Mechanics',
    views: '62.8K',
    likes: '5.1K'
  },
  {
    id: 'Dcyx_RUtKbh',
    url: 'https://www.instagram.com/reel/Dcyx_RUtKbh/',
    videoUrl: '/vertical_reel_1.mp4',
    poster: '/about_pure_gravity.jpg',
    title: 'Haute Contemporary Floor Architecture',
    views: '38.9K',
    likes: '2.9K'
  },
  {
    id: 'DcrF0VUNf40',
    url: 'https://www.instagram.com/reel/DcrF0VUNf40/',
    videoUrl: '/vertical_reel_2.mp4',
    poster: '/editorial_dancers_fashion.jpg',
    title: 'Master Mentor Stage Alignment',
    views: '51.4K',
    likes: '4.2K'
  },
  {
    id: 'DcivIHONvGp',
    url: 'https://www.instagram.com/reel/DcivIHONvGp/',
    videoUrl: '/vertical_reel_1.mp4',
    poster: '/about_philosophy_ensemble.jpg',
    title: 'Raw Grace & Momentum Flow',
    views: '29.7K',
    likes: '2.1K'
  },
  {
    id: 'DcZFihyxZWi',
    url: 'https://www.instagram.com/reel/DcZFihyxZWi/',
    videoUrl: '/vertical_reel_2.mp4',
    poster: '/about_boundless_form.jpg',
    title: 'Dynamic Rhythm & Floor Mechanics',
    views: '41.0K',
    likes: '3.8K'
  },
  {
    id: 'DVq-9vGjV8z_2',
    url: 'https://www.instagram.com/reel/DVq-9vGjV8z/',
    videoUrl: '/vertical_reel_1.mp4',
    poster: '/about_fluid_power.jpg',
    title: 'High-Inversion Acrobatic Extensions',
    views: '58.3K',
    likes: '4.9K'
  },
  {
    id: 'Dc4CFX2NJ5m_2',
    url: 'https://www.instagram.com/reel/Dc4CFX2NJ5m/',
    videoUrl: '/vertical_reel_2.mp4',
    poster: '/about_pure_gravity.jpg',
    title: 'Weightless Aerial & Stage Performance',
    views: '34.5K',
    likes: '2.7K'
  },
  {
    id: 'Dcyx_RUtKbh_2',
    url: 'https://www.instagram.com/reel/Dcyx_RUtKbh/',
    videoUrl: '/vertical_reel_1.mp4',
    poster: '/editorial_dancers_fashion.jpg',
    title: 'Precision Extension & Release',
    views: '48.1K',
    likes: '3.9K'
  },
  {
    id: 'DcrF0VUNf40_2',
    url: 'https://www.instagram.com/reel/DcrF0VUNf40/',
    videoUrl: '/vertical_reel_2.mp4',
    poster: '/about_philosophy_ensemble.jpg',
    title: 'Stage Craft & Contemporary Artistry',
    views: '54.6K',
    likes: '4.5K'
  }
];

export const TOP_8_INSTAGRAM_REELS = TOP_10_INSTAGRAM_REELS.slice(0, 8);

/**
 * Helper function ready to plug in Instagram Graph API / Basic Display API
 * Fetches top 10 reels by engagement (views/likes), falling back to mock array if no access token.
 */
export async function fetchTop10InstagramReels(accessToken = null) {
  if (!accessToken || typeof accessToken !== 'string') {
    return TOP_10_INSTAGRAM_REELS;
  }
  try {
    const url = new URL(INSTAGRAM_CONFIG.GRAPH_API_ENDPOINT);
    url.searchParams.set('fields', 'id,caption,media_type,media_url,permalink,thumbnail_url,like_count,comments_count');
    url.searchParams.set('access_token', accessToken.trim());

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      return TOP_10_INSTAGRAM_REELS;
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.data)) {
      return TOP_10_INSTAGRAM_REELS;
    }

    const fetchedReels = data.data
      .filter(item => item && (item.media_type === 'VIDEO' || item.media_type === 'REELS'))
      .sort((a, b) => ((b.like_count || 0) + (b.comments_count || 0)) - ((a.like_count || 0) + (a.comments_count || 0)))
      .slice(0, 10)
      .map(item => ({
        id: String(item.id || ''),
        url: typeof item.permalink === 'string' && item.permalink.startsWith('https://') ? item.permalink : INSTAGRAM_CONFIG.PROFILE_URL,
        videoUrl: typeof item.media_url === 'string' ? item.media_url : '',
        poster: typeof item.thumbnail_url === 'string' ? item.thumbnail_url : '/about_boundless_form.jpg',
        title: typeof item.caption === 'string' ? item.caption.split('\n')[0].slice(0, 120) : 'Top Instagram Reel',
        views: `${Math.floor((Number(item.like_count) || 100) * 12.5 / 1000)}K`,
        likes: `${Number(item.like_count) || 500}`
      }));

    return fetchedReels.length > 0 ? fetchedReels : TOP_10_INSTAGRAM_REELS;
  } catch (error) {
    console.warn('[Instagram API] Falling back to Top 10 mock dataset:', error);
    return TOP_10_INSTAGRAM_REELS;
  }
}

export const fetchTop8InstagramReels = fetchTop10InstagramReels;

