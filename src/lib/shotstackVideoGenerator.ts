/**
 * Shotstack Video Generator
 * Professional video generation using Shotstack API
 */

import { supabase } from "@/integrations/supabase/client";

export interface ShotstackVideoOptions {
  script: string;
  title: string;
  style: "motivational" | "tutorial" | "story" | "news";
  duration?: number;
}

const SHOTSTACK_API_URL = "https://api.shotstack.io/v1";

/**
 * Get Shotstack API key based on environment
 */
function getShotstackApiKey(): string {
  const env = import.meta.env.VITE_SHOTSTACK_ENV || "sandbox";
  
  if (env === "production") {
    return import.meta.env.VITE_SHOTSTACK_API_KEY_PRODUCTION || "";
  }
  
  return import.meta.env.VITE_SHOTSTACK_API_KEY_SANDBOX || "";
}

/**
 * Get style configuration
 */
function getStyleConfig(style: string) {
  const styles = {
    motivational: {
      background: "#FF6B6B",
      textColor: "#FFFFFF",
      font: "Montserrat ExtraBold",
      transition: "fade",
    },
    tutorial: {
      background: "#667eea",
      textColor: "#FFFFFF",
      font: "Open Sans Bold",
      transition: "slideLeft",
    },
    story: {
      background: "#f093fb",
      textColor: "#FFFFFF",
      font: "Playfair Display Bold",
      transition: "slideUp",
    },
    news: {
      background: "#4facfe",
      textColor: "#FFFFFF",
      font: "Roboto Bold",
      transition: "wipeRight",
    },
  };

  return styles[style as keyof typeof styles] || styles.motivational;
}

/**
 * Generate video using Shotstack API
 */
export async function generateShotstackVideo(
  options: ShotstackVideoOptions
): Promise<{ videoUrl: string; renderId: string }> {
  const { script, title, style, duration = 20 } = options;
  const apiKey = getShotstackApiKey();

  if (!apiKey) {
    throw new Error("Shotstack API key not configured");
  }

  const styleConfig = getStyleConfig(style);

  // Try to get stock video from Pexels
  let backgroundVideoUrl: string | null = null;
  try {
    const { getStockVideoForTopic, isPexelsConfigured } = await import("./pexelsIntegration");
    if (isPexelsConfigured()) {
      console.log("🎬 Getting stock video from Pexels...");
      backgroundVideoUrl = await getStockVideoForTopic(title, style);
      if (backgroundVideoUrl) {
        console.log("✅ Pexels stock video found");
      }
    }
  } catch (error) {
    console.warn("⚠️ Could not get Pexels video:", error);
  }

  // Split script into lines for animation
  const lines = script
    .split("\n")
    .filter((l) => l.trim())
    .slice(0, 5); // Max 5 lines

  const durationPerLine = duration / lines.length;

  // Create tracks
  const tracks: any[] = [];

  // Track 1: Background video (if available from Pexels)
  if (backgroundVideoUrl) {
    tracks.push({
      clips: [
        {
          asset: {
            type: "video",
            src: backgroundVideoUrl,
          },
          start: 0,
          length: duration,
          fit: "cover",
          scale: 1,
          opacity: 0.6, // Slightly transparent so text is readable
        },
      ],
    });
  }

  // Track 2: Text overlays
  const textClips = lines.map((line, index) => {
    const start = index * durationPerLine;
    const length = durationPerLine;

    return {
      asset: {
        type: "html",
        html: `
          <div style="
            width: 1080px;
            height: 1920px;
            background: ${backgroundVideoUrl ? "rgba(0,0,0,0.4)" : `linear-gradient(135deg, ${styleConfig.background} 0%, ${styleConfig.background}dd 100%)`};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 100px;
            font-family: ${styleConfig.font}, sans-serif;
            color: ${styleConfig.textColor};
            text-align: center;
          ">
            ${index === 0 ? `<h1 style="font-size: 80px; margin-bottom: 50px; text-shadow: 3px 3px 15px rgba(0,0,0,0.8);">${title}</h1>` : ""}
            <p style="font-size: 60px; line-height: 1.5; text-shadow: 3px 3px 15px rgba(0,0,0,0.8);">
              ${line}
            </p>
          </div>
        `,
        css: "",
        width: 1080,
        height: 1920,
      },
      start: start,
      length: length,
      fit: "cover",
      scale: 1,
      transition: {
        in: styleConfig.transition,
        out: styleConfig.transition,
      },
    };
  });

  tracks.push({
    clips: textClips,
  });

  // Create Shotstack edit
  const edit = {
    timeline: {
      background: styleConfig.background,
      tracks: tracks,
    },
    output: {
      format: "mp4",
      resolution: "hd",
      aspectRatio: "9:16", // Vertical video for social media
      size: {
        width: 1080,
        height: 1920,
      },
      fps: 30,
      quality: "high",
    },
  };

  console.log("🎬 Sending request to Shotstack...");

  // Submit render request
  const renderResponse = await fetch(`${SHOTSTACK_API_URL}/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(edit),
  });

  if (!renderResponse.ok) {
    const error = await renderResponse.json();
    throw new Error(`Shotstack API error: ${error.message || renderResponse.statusText}`);
  }

  const renderData = await renderResponse.json();
  const renderId = renderData.response.id;

  console.log("✅ Render submitted:", renderId);
  console.log("⏳ Waiting for render to complete...");

  // Poll for render status
  const videoUrl = await pollRenderStatus(renderId, apiKey);

  console.log("✅ Video ready:", videoUrl);

  return { videoUrl, renderId };
}

/**
 * Poll render status until complete
 */
async function pollRenderStatus(
  renderId: string,
  apiKey: string,
  maxAttempts = 60
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(`${SHOTSTACK_API_URL}/render/${renderId}`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!statusResponse.ok) {
      throw new Error("Failed to check render status");
    }

    const statusData = await statusResponse.json();
    const status = statusData.response.status;

    console.log(`📊 Render status: ${status} (${attempt + 1}/${maxAttempts})`);

    if (status === "done") {
      return statusData.response.url;
    }

    if (status === "failed") {
      throw new Error("Render failed: " + statusData.response.error);
    }

    // Status is "queued" or "rendering", continue polling
  }

  throw new Error("Render timeout - took too long to complete");
}

/**
 * Generate video and save to database
 */
export async function createShotstackVideo(
  userId: string,
  options: ShotstackVideoOptions
): Promise<{
  videoId: string;
  videoUrl: string;
  script: string;
  renderId: string;
}> {
  try {
    console.log("🎬 Starting Shotstack video generation...");

    // Generate video with Shotstack
    const { videoUrl, renderId } = await generateShotstackVideo(options);

    console.log("💾 Saving to database...");

    // Save to database
    const { data, error } = await supabase
      .from("videos")
      .insert({
        user_id: userId,
        title: options.title,
        script: options.script,
        video_url: videoUrl,
        status: "completed",
        duration: options.duration || 20,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save video: ${error.message}`);
    }

    console.log("✅ Video saved to database:", data.id);

    return {
      videoId: data.id,
      videoUrl: videoUrl,
      script: options.script,
      renderId: renderId,
    };
  } catch (error: any) {
    console.error("❌ Shotstack video generation error:", error);
    throw error;
  }
}

/**
 * Check if Shotstack is configured
 */
export function isShotstackConfigured(): boolean {
  const apiKey = getShotstackApiKey();
  return !!apiKey && apiKey.length > 0;
}
