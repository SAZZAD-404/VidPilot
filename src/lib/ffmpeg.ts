/**
 * FFmpeg Video Processing Utilities
 * Note: FFmpeg runs on the server side
 * These are utility functions for generating FFmpeg commands
 */

export interface VideoProcessingOptions {
  inputFile: string;
  outputFile: string;
  subtitlesFile?: string;
  backgroundMusic?: string;
  duration?: number;
  zoom?: boolean;
  crop?: { width: number; height: number; x: number; y: number };
  transitions?: boolean;
}

/**
 * Generate FFmpeg command for video processing
 * Complete FREE pipeline with auto zoom, crop, text overlay, music, transitions
 * This command should be executed on a server with FFmpeg installed
 */
export function generateFFmpegCommand(options: VideoProcessingOptions): string {
  const {
    inputFile,
    outputFile,
    subtitlesFile,
    backgroundMusic,
    duration,
    zoom = true,
    crop,
    transitions = true,
  } = options;

  let command = `ffmpeg -i "${inputFile}"`;

  // Add background music if provided
  if (backgroundMusic) {
    command += ` -i "${backgroundMusic}"`;
  }

  // Video filters array
  const filters: string[] = [];

  // Auto zoom effect (Ken Burns effect)
  if (zoom) {
    // Scale to vertical format (1080x1920 for TikTok/Instagram)
    filters.push("scale=1080:1920:force_original_aspect_ratio=decrease");
    filters.push("pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black");
    // Zoom pan effect (slow zoom in)
    filters.push("zoompan=z='min(zoom+0.0015,1.5)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'");
  }

  // Auto crop (center crop if needed)
  if (crop) {
    filters.push(`crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`);
  } else if (zoom) {
    // Auto center crop for vertical videos
    // filters.push("crop=1080:1920:(iw-1080)/2:(ih-1920)/2");
  }

  // Add subtitles (text overlay)
  if (subtitlesFile) {
    // Escape quotes in file path for Windows compatibility
    const escapedPath = subtitlesFile.replace(/\\/g, '/').replace(/"/g, '\\"');
    filters.push(`subtitles="${escapedPath}":force_style='FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2,Alignment=2,MarginV=50'`);
  }

  // Transitions (fade in/out)
  if (transitions) {
    filters.push("fade=t=in:st=0:d=0.5");
    if (duration) {
      filters.push(`fade=t=out:st=${duration - 0.5}:d=0.5`);
    }
  }

  // Apply all video filters
  if (filters.length > 0) {
    command += ` -vf "${filters.join(',')}"`;
  }

  // Audio processing
  if (backgroundMusic) {
    // Mix original audio with background music
    command += ` -filter_complex "[0:a]volume=0.3[a1];[1:a]volume=0.7[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2"`;
  } else {
    // Normalize audio
    command += ` -af "volume=1.0,highpass=f=200,lowpass=f=3000"`;
  }

  // Duration limit (for short videos)
  if (duration) {
    command += ` -t ${duration}`;
  }

  // Output settings (optimized for social media)
  command += ` -c:v libx264 -preset fast -crf 23 -profile:v high -level 4.0`;
  command += ` -c:a aac -b:a 128k -ar 44100`;
  command += ` -movflags +faststart`; // Web optimization
  command += ` -pix_fmt yuv420p`; // Compatibility
  command += ` "${outputFile}"`;

  return command;
}

/**
 * Generate SRT subtitle file content
 */
export function generateSRTContent(
  subtitles: Array<{ start: number; end: number; text: string }>
): string {
  return subtitles
    .map((sub, index) => {
      const startTime = formatSRTTime(sub.start);
      const endTime = formatSRTTime(sub.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n`;
    })
    .join("\n");
}

/**
 * Format time for SRT (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 60 - secs) * 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

/**
 * Process video on client side using Web API (limited functionality)
 * For full FFmpeg processing, use server-side API
 */
export async function processVideoClientSide(
  videoFile: File,
  options: Partial<VideoProcessingOptions>
): Promise<Blob> {
  // This is a placeholder - actual FFmpeg processing needs to be done server-side
  // For now, we'll just return the original file
  // In production, call a server API endpoint that runs FFmpeg
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: videoFile.type });
      resolve(blob);
    };
    reader.readAsArrayBuffer(videoFile);
  });
}

/**
 * Extract audio from video file (client-side, limited)
 */
export async function extractAudio(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    video.src = URL.createObjectURL(videoFile);
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Note: Actual audio extraction requires server-side processing
      // This is a placeholder
      resolve(new Blob([], { type: "audio/mpeg" }));
    };
    
    video.onerror = reject;
  });
}
