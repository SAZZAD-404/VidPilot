/**
 * Social Media Posting Functions
 * Handles posting to Facebook, Instagram, YouTube, TikTok, LinkedIn
 */

export interface SocialPostOptions {
  videoUrl: string;
  caption: string;
  platform: "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin";
  accessToken: string;
  pageId?: string; // For Facebook/Instagram
}

export interface PostResponse {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Post to Facebook
 */
export async function postToFacebook(
  options: SocialPostOptions
): Promise<PostResponse> {
  const { videoUrl, caption, accessToken, pageId } = options;

  try {
    // Step 1: Upload video to Facebook
    const uploadResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/videos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_url: videoUrl,
          description: caption,
          access_token: accessToken,
        }),
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error?.message || "Facebook upload failed");
    }

    const data = await uploadResponse.json();
    return {
      success: true,
      postId: data.id,
    };
  } catch (error) {
    console.error("Facebook post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post to Instagram
 */
export async function postToInstagram(
  options: SocialPostOptions
): Promise<PostResponse> {
  const { videoUrl, caption, accessToken, pageId } = options;

  try {
    // Step 1: Create container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          media_type: "REELS",
          video_url: videoUrl,
          caption: caption,
          access_token: accessToken,
        }),
      }
    );

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(error.error?.message || "Instagram container creation failed");
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(error.error?.message || "Instagram publish failed");
    }

    const publishData = await publishResponse.json();
    return {
      success: true,
      postId: publishData.id,
    };
  } catch (error) {
    console.error("Instagram post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post to YouTube
 */
export async function postToYouTube(
  options: SocialPostOptions
): Promise<PostResponse> {
  const { videoUrl, caption, accessToken } = options;

  try {
    // YouTube requires OAuth 2.0 and uses resumable upload
    // This is a simplified version - full implementation needs proper OAuth flow
    
    const metadata = {
      snippet: {
        title: caption.split("\n")[0] || "Video",
        description: caption,
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: "public",
      },
    };

    // Step 1: Initialize upload
    const initResponse = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initResponse.ok) {
      const error = await initResponse.json();
      throw new Error(error.error?.message || "YouTube upload initialization failed");
    }

    const uploadUrl = initResponse.headers.get("Location");
    if (!uploadUrl) {
      throw new Error("No upload URL received from YouTube");
    }

    // Step 2: Upload video file
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/*",
        "Content-Length": videoBlob.size.toString(),
      },
      body: videoBlob,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error?.message || "YouTube upload failed");
    }

    const data = await uploadResponse.json();
    return {
      success: true,
      postId: data.id,
    };
  } catch (error) {
    console.error("YouTube post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post to TikTok
 */
export async function postToTikTok(
  options: SocialPostOptions
): Promise<PostResponse> {
  const { videoUrl, caption, accessToken } = options;

  try {
    // TikTok API requires specific format
    const response = await fetch("https://open-api.tiktok.com/share/video/upload/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        video_url: videoUrl,
        post_info: {
          title: caption.split("\n")[0] || "Video",
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "TikTok upload failed");
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.data?.share_id || data.share_id,
    };
  } catch (error) {
    console.error("TikTok post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(
  options: SocialPostOptions
): Promise<PostResponse> {
  const { videoUrl, caption, accessToken } = options;

  try {
    // LinkedIn requires organization or person URN
    // This is a simplified version
    
    const response = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-video"],
          owner: "urn:li:organization:YOUR_ORG_ID", // Replace with actual org ID
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "LinkedIn upload failed");
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.value?.asset || data.id,
    };
  } catch (error) {
    console.error("LinkedIn post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Universal post function that routes to the correct platform
 */
export async function postToSocialMedia(
  options: SocialPostOptions
): Promise<PostResponse> {
  switch (options.platform) {
    case "facebook":
      return postToFacebook(options);
    case "instagram":
      return postToInstagram(options);
    case "youtube":
      return postToYouTube(options);
    case "tiktok":
      return postToTikTok(options);
    case "linkedin":
      return postToLinkedIn(options);
    default:
      return {
        success: false,
        error: "Unsupported platform",
      };
  }
}
