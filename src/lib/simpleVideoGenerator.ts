/**
 * Simple Video Generator
 * Creates basic videos from text without external dependencies
 * Uses HTML5 Canvas and MediaRecorder API
 */

import { supabase } from "@/integrations/supabase/client";

export interface SimpleVideoOptions {
  script: string;
  title: string;
  style: "motivational" | "tutorial" | "story" | "news";
  duration?: number;
}

/**
 * Generate a simple video from script using Canvas
 * This creates a basic video with animated text
 */
export async function generateSimpleVideo(
  options: SimpleVideoOptions
): Promise<{ videoBlob: Blob; videoUrl: string }> {
  const { script, title, style, duration = 20 } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Style configurations
      const styles = {
        motivational: {
          bgGradient: ["#FF6B6B", "#4ECDC4"],
          textColor: "#FFFFFF",
          emoji: "🔥",
        },
        tutorial: {
          bgGradient: ["#667eea", "#764ba2"],
          textColor: "#FFFFFF",
          emoji: "📚",
        },
        story: {
          bgGradient: ["#f093fb", "#f5576c"],
          textColor: "#FFFFFF",
          emoji: "📖",
        },
        news: {
          bgGradient: ["#4facfe", "#00f2fe"],
          textColor: "#FFFFFF",
          emoji: "📰",
        },
      };

      const currentStyle = styles[style];

      // Set up MediaRecorder
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(chunks, { type: "video/webm" });
        
        // Upload to Supabase Storage
        const fileName = `generated/${Date.now()}.webm`;
        const { data, error } = await supabase.storage
          .from("videos")
          .upload(fileName, videoBlob, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          // Return blob URL as fallback
          const blobUrl = URL.createObjectURL(videoBlob);
          resolve({ videoBlob, videoUrl: blobUrl });
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("videos").getPublicUrl(fileName);

        resolve({ videoBlob, videoUrl: publicUrl });
      };

      mediaRecorder.onerror = (e) => {
        reject(new Error("MediaRecorder error: " + e));
      };

      // Start recording
      mediaRecorder.start();

      // Animation variables
      let frame = 0;
      const fps = 30;
      const totalFrames = duration * fps;
      const lines = script.split("\n").filter((l) => l.trim());

      // Animation loop
      const animate = () => {
        if (frame >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, currentStyle.bgGradient[0]);
        gradient.addColorStop(1, currentStyle.bgGradient[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate progress
        const progress = frame / totalFrames;

        // Draw title at top
        ctx.fillStyle = currentStyle.textColor;
        ctx.font = "bold 60px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.fillText(
          `${currentStyle.emoji} ${title}`,
          canvas.width / 2,
          150
        );

        // Draw script text with animation
        ctx.font = "48px Arial";
        ctx.shadowBlur = 5;
        const lineHeight = 80;
        const startY = 400;

        // Animate text appearance
        const visibleLines = Math.floor(progress * lines.length * 1.5);

        lines.slice(0, visibleLines).forEach((line, index) => {
          const y = startY + index * lineHeight;
          const lineProgress = Math.min(
            1,
            (progress * lines.length * 1.5 - index) * 2
          );

          // Fade in effect
          ctx.globalAlpha = lineProgress;

          // Word wrap
          const words = line.split(" ");
          let currentLine = "";
          let lineCount = 0;

          words.forEach((word) => {
            const testLine = currentLine + word + " ";
            const metrics = ctx.measureText(testLine);

            if (metrics.width > canvas.width - 100 && currentLine !== "") {
              ctx.fillText(
                currentLine,
                canvas.width / 2,
                y + lineCount * lineHeight
              );
              currentLine = word + " ";
              lineCount++;
            } else {
              currentLine = testLine;
            }
          });

          ctx.fillText(
            currentLine,
            canvas.width / 2,
            y + lineCount * lineHeight
          );
        });

        ctx.globalAlpha = 1;

        // Draw progress bar at bottom
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(50, canvas.height - 100, canvas.width - 100, 10);
        ctx.fillStyle = currentStyle.textColor;
        ctx.fillRect(
          50,
          canvas.height - 100,
          (canvas.width - 100) * progress,
          10
        );

        frame++;
        requestAnimationFrame(animate);
      };

      // Start animation
      animate();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate video and save to database
 */
export async function createAndSaveSimpleVideo(
  userId: string,
  options: SimpleVideoOptions
): Promise<{
  videoId: string;
  videoUrl: string;
  script: string;
}> {
  try {
    console.log("🎬 Generating simple video...");

    // Generate video
    const { videoUrl } = await generateSimpleVideo(options);
    console.log("✅ Video generated:", videoUrl);

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
    };
  } catch (error: any) {
    console.error("Video generation error:", error);
    throw error;
  }
}
