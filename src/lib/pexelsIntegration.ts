/**
 * Pexels API Integration
 * Free stock videos and images for video generation
 */

const PEXELS_API_URL = "https://api.pexels.com/v1";
const PEXELS_VIDEO_API_URL = "https://api.pexels.com/videos";

/**
 * Get Pexels API key
 */
function getPexelsApiKey(): string {
  return import.meta.env.VITE_PEXELS_API_KEY || "";
}

/**
 * Search for stock videos on Pexels
 */
export async function searchPexelsVideos(
  query: string,
  perPage: number = 5
): Promise<any[]> {
  const apiKey = getPexelsApiKey();

  if (!apiKey) {
    console.warn("Pexels API key not configured");
    return [];
  }

  try {
    const response = await fetch(
      `${PEXELS_VIDEO_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error("Pexels video search error:", error);
    return [];
  }
}

/**
 * Search for stock images on Pexels
 */
export async function searchPexelsImages(
  query: string,
  perPage: number = 5
): Promise<any[]> {
  const apiKey = getPexelsApiKey();

  if (!apiKey) {
    console.warn("Pexels API key not configured");
    return [];
  }

  try {
    const response = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.photos || [];
  } catch (error) {
    console.error("Pexels image search error:", error);
    return [];
  }
}

/**
 * Get best video URL from Pexels video object
 */
export function getBestVideoUrl(video: any): string {
  // Try to get HD video first, then fall back to lower quality
  const videoFiles = video.video_files || [];
  
  // Prefer vertical HD videos
  const hdVertical = videoFiles.find(
    (f: any) => f.quality === "hd" && f.width < f.height
  );
  if (hdVertical) return hdVertical.link;

  // Fall back to any HD
  const hd = videoFiles.find((f: any) => f.quality === "hd");
  if (hd) return hd.link;

  // Fall back to SD
  const sd = videoFiles.find((f: any) => f.quality === "sd");
  if (sd) return sd.link;

  // Last resort: first video file
  return videoFiles[0]?.link || "";
}

/**
 * Get best image URL from Pexels image object
 */
export function getBestImageUrl(image: any): string {
  // Prefer portrait large
  return image.src?.portrait || image.src?.large || image.src?.original || "";
}

/**
 * Get relevant stock video for topic
 */
export async function getStockVideoForTopic(
  topic: string,
  style: string
): Promise<string | null> {
  try {
    // Create search query based on topic and style
    const searchQueries = {
      motivational: `${topic} motivation success inspiration`,
      tutorial: `${topic} learning education tutorial`,
      story: `${topic} story narrative journey`,
      news: `${topic} business professional corporate`,
    };

    const query = searchQueries[style as keyof typeof searchQueries] || topic;

    console.log(`🔍 Searching Pexels for: ${query}`);

    const videos = await searchPexelsVideos(query, 3);

    if (videos.length === 0) {
      console.warn("No videos found on Pexels");
      return null;
    }

    // Get the first video
    const video = videos[0];
    const videoUrl = getBestVideoUrl(video);

    console.log(`✅ Found Pexels video: ${video.id}`);

    return videoUrl;
  } catch (error) {
    console.error("Error getting stock video:", error);
    return null;
  }
}

/**
 * Get relevant stock image for topic
 */
export async function getStockImageForTopic(
  topic: string,
  style: string
): Promise<string | null> {
  try {
    const searchQueries = {
      motivational: `${topic} motivation success`,
      tutorial: `${topic} learning education`,
      story: `${topic} story`,
      news: `${topic} business`,
    };

    const query = searchQueries[style as keyof typeof searchQueries] || topic;

    console.log(`🔍 Searching Pexels images for: ${query}`);

    const images = await searchPexelsImages(query, 3);

    if (images.length === 0) {
      console.warn("No images found on Pexels");
      return null;
    }

    const image = images[0];
    const imageUrl = getBestImageUrl(image);

    console.log(`✅ Found Pexels image: ${image.id}`);

    return imageUrl;
  } catch (error) {
    console.error("Error getting stock image:", error);
    return null;
  }
}

/**
 * Check if Pexels is configured
 */
export function isPexelsConfigured(): boolean {
  const apiKey = getPexelsApiKey();
  return !!apiKey && apiKey.length > 0;
}

/**
 * Get multiple stock videos for a video montage
 */
export async function getStockVideoMontage(
  topic: string,
  style: string,
  count: number = 3
): Promise<string[]> {
  try {
    const query = `${topic} ${style}`;
    const videos = await searchPexelsVideos(query, count);

    return videos.map((video) => getBestVideoUrl(video)).filter((url) => url);
  } catch (error) {
    console.error("Error getting video montage:", error);
    return [];
  }
}
