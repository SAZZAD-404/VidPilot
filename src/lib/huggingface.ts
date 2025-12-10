/**
 * HuggingFace AI Integration
 * Free models for script generation
 */

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";

export interface ScriptGenerationOptions {
  prompt: string;
  maxLength?: number;
  temperature?: number;
}

/**
 * Generate video script using HuggingFace models
 * Uses free models: bigscience/bloom or google/gemma
 */
export async function generateScript(
  options: ScriptGenerationOptions,
  apiKey?: string
): Promise<string> {
  const { prompt, maxLength = 150, temperature = 0.7 } = options;

  try {
    // Try using BLOOM model first (free, no API key needed for inference)
    const model = apiKey ? "google/gemma-2b-it" : "bigscience/bloom-560m";
    
    const response = await fetch(`${HUGGINGFACE_API_URL}/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        inputs: `Generate a short, engaging video script (under 20 seconds) about: ${prompt}. Make it motivational and include a hook, main point, and call to action.`,
        parameters: {
          max_new_tokens: maxLength,
          temperature: temperature,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      // If model is loading, wait and retry
      if (response.status === 503) {
        const retryAfter = response.headers.get("Retry-After") || "30";
        throw new Error(`Model is loading. Please wait ${retryAfter} seconds and try again.`);
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract generated text
    let generatedText = "";
    if (Array.isArray(data)) {
      generatedText = data[0]?.generated_text || "";
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else if (typeof data === "string") {
      generatedText = data;
    }

    // Clean up and format the script
    return formatScript(generatedText, prompt);
  } catch (error) {
    console.error("HuggingFace API Error:", error);
    
    // Fallback: Generate a simple script if API fails
    return generateFallbackScript(prompt);
  }
}

/**
 * Format the generated script for video use
 */
function formatScript(text: string, originalPrompt: string): string {
  // Remove the original prompt if it's included
  let cleaned = text.replace(new RegExp(originalPrompt, "gi"), "").trim();
  
  // If text is too short or empty, use fallback
  if (cleaned.length < 50) {
    return generateFallbackScript(originalPrompt);
  }

  // Format with emojis and structure
  const lines = cleaned.split("\n").filter(line => line.trim().length > 0);
  
  if (lines.length >= 3) {
    return `🎬 Hook: ${lines[0]}\n\n💡 Main Point: ${lines[1]}\n\n🔥 Key Insight: ${lines[2]}\n\n✅ Call to Action: Follow for more tips and share this with someone who needs to hear it!`;
  }

  return `🎬 ${cleaned}\n\n✅ Follow for more tips!`;
}

/**
 * Fallback script generator (when API is unavailable)
 */
function generateFallbackScript(prompt: string): string {
  const topic = prompt.toLowerCase();
  
  return `🎬 Hook: Did you know that ${topic}? Most people don't realize this simple truth.\n\n💡 Main Point: Here's the thing - ${topic} can transform your life. Let me explain...\n\n🔥 Key Insight: Studies show that understanding ${topic} leads to 80% better outcomes.\n\n✅ Call to Action: Follow for more tips and share this with someone who needs to hear it!`;
}

/**
 * Generate captions/subtitles using Whisper model
 */
export async function generateSubtitles(
  audioFile: File | Blob,
  apiKey?: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", audioFile);

    const response = await fetch(
      `${HUGGINGFACE_API_URL}/openai/whisper-small`,
      {
        method: "POST",
        headers: {
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Whisper API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Whisper API Error:", error);
    throw error;
  }
}
