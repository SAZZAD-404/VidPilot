// AI Social Media Post Generator (Rule-based - 100% FREE)
// No API keys needed, works offline

export type Platform = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube';
export type Tone = 'funny' | 'professional' | 'emotional' | 'trendy' | 'minimal' | 'storytelling' | 'marketing';
export type Length = 'short' | 'medium' | 'long';

export interface PostOptions {
  platform: Platform;
  topic: string;
  brand?: string;
  audience: string;
  tone: Tone;
  length: Length;
  includeCTA: boolean;
}

export interface PostVariation {
  text: string;
  hashtags: string[];
  cta?: string;
  characterCount: number;
}

// Platform-specific templates and rules
const platformRules: Record<Platform, { maxLength: number; hashtagCount: number; style: string }> = {
  facebook: { maxLength: 500, hashtagCount: 3, style: 'conversational and community-focused' },
  instagram: { maxLength: 2200, hashtagCount: 10, style: 'visual and lifestyle-oriented' },
  linkedin: { maxLength: 3000, hashtagCount: 5, style: 'professional and value-driven' },
  twitter: { maxLength: 280, hashtagCount: 2, style: 'concise and impactful' },
  youtube: { maxLength: 5000, hashtagCount: 8, style: 'descriptive and engaging' },
};

// Tone-based templates
const toneTemplates = {
  funny: {
    short: [
      "😂 {topic}? More like {hook}! {brand} gets it. {audience}, you know what I mean! 🤣",
      "Plot twist: {topic} is actually {twist}! 💀 {brand} spilling the tea ☕",
      "Me: I don't need {topic}. Also me: *immediately gets {topic}* 😅 {brand} knows the struggle!",
    ],
    medium: [
      "Okay so funny story about {topic}... 😂\n\nI thought it was just another {comparison}, but then {brand} showed me the truth! Now I can't stop thinking about it. {audience}, am I the only one? 🤷‍♂️\n\nSeriously though, if you haven't tried {topic} yet, you're missing out on the joke! 🎭",
      "Breaking news: Local {audience} discovers {topic} and life is never the same! 📰😂\n\nBefore: Normal, boring existence\nAfter: {brand} changed everything with {topic}\n\nWhy did nobody tell me about this sooner?! 🤯",
      "Let's talk about {topic} for a second... 🎤\n\n*clears throat dramatically*\n\nSo {brand} just dropped this and I'm SCREAMING! 😱 {audience}, we need to discuss this immediately. This is not a drill! 🚨\n\nWho else is obsessed? Show of hands! 🙋‍♀️",
    ],
    long: [
      "Alright, story time! 📖😂\n\nSo there I was, minding my own business, when {topic} entered my life. I wasn't ready. Nobody prepared me for this! {brand} just casually dropped this bombshell and expected us to act normal?!\n\nThe audacity! The nerve! The absolute GENIUS! 🤯\n\n{audience}, I need you to understand something: {topic} is not what you think it is. It's better. It's funnier. It's everything we didn't know we needed.\n\nAnd now I'm here, at 2 AM, writing this post because I can't stop thinking about it. This is fine. Everything is fine. 🔥😅\n\nMoral of the story? Sometimes the best things in life come when you least expect them. Also, {brand} is a genius and we should all appreciate that.\n\nWho's with me? Drop a 😂 if you relate!",
    ],
  },
  professional: {
    short: [
      "Exploring {topic} with {brand}. Key insights for {audience} in today's market. 💼",
      "{topic}: A strategic approach for {audience}. {brand} delivers results. 📊",
      "Professional perspective on {topic}. {brand} leads the way for {audience}. ✨",
    ],
    medium: [
      "Today's focus: {topic} 🎯\n\nAs {audience}, understanding {topic} is crucial for success. {brand} has identified three key strategies:\n\n1. Strategic implementation\n2. Data-driven decisions\n3. Sustainable growth\n\nLet's discuss how this impacts your business.",
      "In today's competitive landscape, {topic} has emerged as a game-changer. 📈\n\n{brand} is committed to helping {audience} navigate this space effectively. Our approach combines innovation with proven methodologies.\n\nKey takeaway: Success requires both vision and execution.",
      "Professional insight on {topic}: 💡\n\n{brand} has been working with {audience} to optimize {topic} strategies. The results speak for themselves:\n\n✓ Increased efficiency\n✓ Better outcomes\n✓ Measurable ROI\n\nReady to transform your approach?",
    ],
    long: [
      "In-Depth Analysis: {topic} 📊\n\nAs industry leaders serving {audience}, {brand} has conducted extensive research on {topic}. Here's what we've learned:\n\nThe Current Landscape:\nThe market is evolving rapidly, and {topic} sits at the intersection of innovation and practical application. Organizations that adapt early gain significant competitive advantages.\n\nKey Findings:\n• Strategic implementation drives 40% better results\n• {audience} who embrace {topic} see measurable improvements\n• Long-term success requires systematic approach\n\nOur Recommendation:\n{brand} advocates for a balanced strategy that combines immediate action with sustainable planning. This isn't about quick fixes—it's about building lasting value.\n\nNext Steps:\nWe're committed to supporting {audience} through this transformation. Let's connect to discuss how {topic} can drive your success.\n\nWhat's your experience with {topic}? Share your insights below. 👇",
    ],
  },
  emotional: {
    short: [
      "💙 {topic} touched my heart today. {brand} reminds us what truly matters. {audience}, you're not alone.",
      "Sometimes {topic} is exactly what we need. Grateful for {brand}. 🙏 {audience}, stay strong.",
      "This {topic} moment brought tears to my eyes. {brand} gets it. ❤️ {audience}, we're in this together.",
    ],
    medium: [
      "There's something deeply moving about {topic}... 💫\n\n{brand} reminded me today why we do what we do. It's not just about the product—it's about the people. {audience}, you inspire us every single day.\n\nIn a world that moves so fast, moments like these make us pause and appreciate what really matters. Thank you for being part of this journey. 🙏❤️",
      "Today, {topic} made me realize something important. 🌟\n\n{brand} has always believed in the power of connection, and seeing how {audience} responds to {topic} fills my heart with gratitude.\n\nWe're not just building a business—we're building a community. A family. A movement.\n\nTo everyone who's been part of this: thank you. You make this meaningful. 💙",
      "I wasn't prepared for how {topic} would impact me today. 🥺\n\n{brand} started with a simple mission: to serve {audience} with heart and authenticity. But somewhere along the way, it became so much more.\n\n{topic} isn't just a concept—it's a reminder of why we're here. It's about making a difference, one person at a time.\n\nIf you're reading this, know that you matter. Your story matters. And we're honored to be part of it. ❤️✨",
    ],
    long: [
      "A Letter About {topic} 💌\n\nDear {audience},\n\nI need to share something with you today. {topic} has been on my mind, and I can't keep these feelings inside anymore.\n\nWhen {brand} started this journey, we had a vision. But what we didn't anticipate was how deeply {topic} would resonate with people like you. The stories you've shared, the lives you've touched, the courage you've shown—it's overwhelming in the best possible way.\n\nThere are moments in life that change us. Moments that remind us why we're here, what we're fighting for, and who we're meant to serve. {topic} is one of those moments for me.\n\nI've seen {audience} overcome incredible challenges. I've witnessed transformations that seemed impossible. I've felt the weight of responsibility and the lightness of hope, often in the same breath.\n\nThis isn't just business. This isn't just marketing. This is real. This is human. This is us, together, creating something meaningful.\n\n{brand} exists because of you. Every decision we make, every product we create, every word we write—it's all for you. And {topic} represents everything we believe in: authenticity, connection, and the power of community.\n\nThank you for trusting us. Thank you for being vulnerable. Thank you for showing up, even when it's hard.\n\nWe see you. We hear you. We're with you.\n\nWith gratitude and love,\n{brand} Team 💙\n\nP.S. Your story matters. Never forget that.",
    ],
  },
  trendy: {
    short: [
      "🔥 {topic} is THE vibe right now! {brand} x {audience} = perfection ✨💯",
      "POV: You discover {topic} and your life changes forever 😍 {brand} gets it!",
      "Not me being obsessed with {topic} 24/7 💀 {brand} really said 'here you go {audience}' 🎁",
    ],
    medium: [
      "Okay but can we talk about {topic}?! 🗣️✨\n\n{brand} really woke up and chose excellence! {audience}, this is our moment! The energy? Immaculate. The vibes? Unmatched. The impact? LEGENDARY! 🔥\n\nIf you're not on this wave yet, what are you even doing?! 💯",
      "BREAKING: {topic} is officially the main character of 2024! 🌟\n\n{brand} understood the assignment and then some! {audience}, we're witnessing history right now. This is giving everything we needed and more! 😍\n\nThe way this hits different? *chef's kiss* 👨‍🍳💋",
      "Listen up {audience}! 📢\n\n{topic} just entered the chat and it's giving MAIN CHARACTER ENERGY! ✨ {brand} really said 'let me show you how it's done' and we're here for it! 🙌\n\nThis is the moment. This is the vibe. This is IT! 🔥💯",
    ],
    long: [
      "Alright {audience}, let's have a moment about {topic}... 🎤✨\n\nFirst of all, {brand} really came through with this one! Like, the way they understood the assignment? IMMACULATE! 💯\n\nLet me break down why {topic} is literally everything right now:\n\n1️⃣ The VIBES are unmatched\n2️⃣ It's giving main character energy\n3️⃣ The aesthetic? *chef's kiss*\n4️⃣ It's literally what we've been manifesting\n5️⃣ The cultural impact is REAL\n\nAnd can we talk about how {brand} just casually dropped this and expected us to act normal?! The audacity! The serve! The absolute ICON behavior! 🔥\n\n{audience}, if you're not already on this wave, you're missing out on THE moment of the year! This is not a drill! This is your sign! ✨\n\nThe energy is electric, the vibes are immaculate, and the future is NOW! Who's ready to make {topic} their whole personality? Because same! 😍💅\n\nDrop a 🔥 if you're obsessed! Let's make this VIRAL! 📈✨",
    ],
  },
  minimal: {
    short: [
      "{topic}. {brand}. {audience}. ✨",
      "Simply {topic}. By {brand}. For {audience}. 🤍",
      "{topic}. Nothing more, nothing less. {brand}.",
    ],
    medium: [
      "{topic}.\n\n{brand} for {audience}.\n\nClean. Simple. Effective.\n\nThat's it. That's the post. ✨",
      "Today: {topic}.\n\n{brand} delivers.\n{audience} benefits.\n\nNo fluff. Just value. 🤍",
      "{topic}.\n\nBy {brand}.\nFor {audience}.\n\nPure. Simple. Meaningful.\n\nSometimes less is more. ✨",
    ],
    long: [
      "{topic}.\n\nIn a world of noise, {brand} offers clarity.\n\nFor {audience} who value:\n• Simplicity\n• Quality\n• Authenticity\n\n{topic} speaks for itself.\n\nNo elaborate explanations.\nNo unnecessary complexity.\nJust what matters.\n\nClean. Clear. Complete.\n\nThat's our promise.\nThat's our product.\nThat's {brand}.\n\n✨",
    ],
  },
  storytelling: {
    short: [
      "Once upon a time, {audience} discovered {topic}. {brand} made it happen. The end. ✨📖",
      "Chapter 1: {topic} changes everything. {brand} writes the story. {audience} lives it. 🌟",
      "The story of {topic} begins with {brand} and {audience}. What happens next? Magic. ✨",
    ],
    medium: [
      "The Story of {topic} 📖\n\nOnce upon a time, {audience} faced a challenge. Then {brand} introduced {topic}, and everything changed.\n\nThis isn't just a product. It's a journey. Your journey.\n\nWhat chapter are you on? ✨",
      "Let me tell you a story about {topic}... 🌟\n\nIt started with a simple idea: What if {audience} could experience something truly special? {brand} took that question and turned it into reality.\n\nThe result? {topic}.\n\nBut the story doesn't end there. It's just beginning. Your chapter starts now. 📖✨",
      "Every great story has a turning point. 📖\n\nFor {audience}, that moment came with {topic}. {brand} didn't just create a product—we created a narrative.\n\nYour story. Your journey. Your transformation.\n\nWhat will your next chapter hold? ✨",
    ],
    long: [
      "The Journey of {topic}: A Story Worth Telling 📖✨\n\nChapter One: The Beginning\n\nEvery story starts somewhere. For {audience}, it began with a question: 'What if there was a better way?'\n\n{brand} heard that question. We felt it. We lived it.\n\nChapter Two: The Discovery\n\nThen came {topic}. Not by accident, but by design. By listening. By caring. By understanding what {audience} truly needed.\n\nWe didn't just build a product. We crafted an experience. A journey. A transformation.\n\nChapter Three: The Transformation\n\nWhat happened next was magic. {audience} didn't just use {topic}—they embraced it. They made it their own. They wrote their own chapters.\n\nStories of success. Stories of growth. Stories of change.\n\nChapter Four: Your Story\n\nAnd now, we're here. At the beginning of your chapter. The pen is in your hand. The page is blank. The possibilities are endless.\n\n{brand} is honored to be part of your story. {topic} is your tool. But the narrative? That's all you.\n\nWhat will you write?\n\nThe adventure continues... ✨📖",
    ],
  },
  marketing: {
    short: [
      "🚀 {topic} is here! {brand} delivers what {audience} needs. Limited time offer! 💥",
      "Introducing {topic} by {brand}! Perfect for {audience}. Get yours now! ✨",
      "Don't miss out! {topic} from {brand} is exactly what {audience} has been waiting for! 🎯",
    ],
    medium: [
      "🎯 Attention {audience}!\n\n{brand} is excited to announce {topic}! This is the solution you've been searching for.\n\n✅ Premium quality\n✅ Proven results\n✅ Trusted by thousands\n\nReady to transform your experience? Click the link below! 🚀",
      "EXCLUSIVE OFFER for {audience}! 🌟\n\n{brand} presents {topic}—the game-changer you need!\n\nWhy choose us?\n• Industry-leading quality\n• Exceptional value\n• Guaranteed satisfaction\n\nDon't wait! This opportunity won't last forever. Get started today! 💥",
      "Transform Your Experience with {topic}! ✨\n\n{brand} has created something special for {audience}:\n\n🎁 Exclusive features\n🎁 Unbeatable value\n🎁 Instant results\n\nJoin thousands of satisfied customers. Your journey starts here! 🚀",
    ],
    long: [
      "🚀 INTRODUCING: {topic} by {brand}!\n\nAttention {audience}! We've been working on something incredible, and it's finally here!\n\n🌟 What is {topic}?\n{topic} is the ultimate solution designed specifically for {audience}. We've combined cutting-edge innovation with user-friendly design to create something truly special.\n\n💎 Why Choose {brand}?\n✅ Proven track record of excellence\n✅ Trusted by thousands of satisfied customers\n✅ Industry-leading quality and support\n✅ Competitive pricing with unmatched value\n✅ 100% satisfaction guarantee\n\n🎯 Perfect For:\n• {audience} looking to level up\n• Anyone seeking reliable solutions\n• Those who demand the best\n\n🎁 SPECIAL LAUNCH OFFER!\nFor a limited time, get exclusive access to {topic} with:\n• 20% off your first purchase\n• Free premium support\n• Bonus resources worth $100\n• 30-day money-back guarantee\n\n⏰ Don't Miss Out!\nThis offer expires soon! Join the {brand} family today and discover why {audience} everywhere are making the switch to {topic}.\n\n👉 Click the link in bio to get started!\n👉 Tag a friend who needs this!\n👉 Share this post to spread the word!\n\nQuestions? Our team is here to help! Drop a comment or DM us.\n\n{brand} - Your Partner in Success! 🌟\n\n#LimitedTimeOffer #ExclusiveDeal #TransformYourLife",
    ],
  },
};

// Platform-specific hashtags
const platformHashtags: Record<Platform, string[]> = {
  facebook: ['community', 'family', 'together', 'share', 'connect', 'love', 'life', 'friends'],
  instagram: ['instagood', 'photooftheday', 'love', 'beautiful', 'happy', 'fashion', 'style', 'instadaily', 'reels', 'viral'],
  linkedin: ['leadership', 'business', 'career', 'professional', 'networking', 'innovation', 'growth', 'success', 'motivation', 'entrepreneur'],
  twitter: ['trending', 'viral', 'news', 'breaking', 'thread', 'opinion', 'discussion', 'community'],
  youtube: ['subscribe', 'youtube', 'video', 'tutorial', 'howto', 'vlog', 'entertainment', 'trending', 'viral', 'shorts'],
};

// CTA templates by platform
const ctaTemplates: Record<Platform, string[]> = {
  facebook: [
    "👉 Click the link to learn more!",
    "💬 Comment below with your thoughts!",
    "👍 Like and share if you agree!",
    "🔗 Visit our page for details!",
  ],
  instagram: [
    "💫 Link in bio!",
    "📲 Save this for later!",
    "👥 Tag someone who needs this!",
    "❤️ Double tap if you love this!",
  ],
  linkedin: [
    "🔗 Connect with me for more insights.",
    "💼 Visit our website to learn more.",
    "📊 Download our free guide in the comments.",
    "🤝 Let's discuss in the comments below.",
  ],
  twitter: [
    "🔄 RT if you agree!",
    "💬 Reply with your take!",
    "🔗 Read more: [link]",
    "👇 Thread below!",
  ],
  youtube: [
    "👍 Like this video!",
    "🔔 Subscribe for more!",
    "💬 Comment your thoughts!",
    "📺 Watch till the end!",
  ],
};

// Generate social media posts
export function generateSocialPosts(options: PostOptions): PostVariation[] {
  const { platform, topic, brand, audience, tone, length, includeCTA } = options;
  const rules = platformRules[platform];
  const templates = toneTemplates[tone][length];
  const variations: PostVariation[] = [];

  // Generate 3 variations
  for (let i = 0; i < 3; i++) {
    const template = templates[i % templates.length];
    
    // Replace placeholders
    let postText = template
      .replace(/{topic}/g, topic)
      .replace(/{brand}/g, brand || 'Our Brand')
      .replace(/{audience}/g, audience)
      .replace(/{hook}/g, generateHook(topic))
      .replace(/{twist}/g, generateTwist(topic))
      .replace(/{comparison}/g, generateComparison(topic));

    // Add CTA if requested
    let cta = '';
    if (includeCTA) {
      const ctas = ctaTemplates[platform];
      cta = ctas[i % ctas.length];
      postText += `\n\n${cta}`;
    }

    // Generate hashtags
    const hashtags = generateHashtags(topic, platform, rules.hashtagCount);

    // Ensure within platform limits
    if (postText.length > rules.maxLength) {
      postText = postText.substring(0, rules.maxLength - 3) + '...';
    }

    variations.push({
      text: postText,
      hashtags,
      cta,
      characterCount: postText.length,
    });
  }

  return variations;
}

// Helper functions
function generateHook(topic: string): string {
  const hooks = [
    `the best thing ever`,
    `what we've been waiting for`,
    `a game changer`,
    `absolutely genius`,
    `the future`,
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

function generateTwist(topic: string): string {
  const twists = [
    `the secret we all needed`,
    `way better than expected`,
    `not what you think`,
    `the plot twist of the year`,
    `everything and more`,
  ];
  return twists[Math.floor(Math.random() * twists.length)];
}

function generateComparison(topic: string): string {
  const comparisons = [
    `trend`,
    `fad`,
    `hype`,
    `buzzword`,
    `gimmick`,
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateHashtags(topic: string, platform: Platform, count: number): string[] {
  const hashtags: string[] = [];
  
  // Add topic-based hashtags
  const topicWords = topic.toLowerCase().split(' ');
  topicWords.forEach(word => {
    if (word.length > 3) {
      hashtags.push(word.replace(/[^a-z0-9]/g, ''));
    }
  });
  
  // Add platform-specific hashtags
  const platformTags = platformHashtags[platform];
  const randomTags = platformTags
    .sort(() => Math.random() - 0.5)
    .slice(0, count - hashtags.length);
  
  hashtags.push(...randomTags);
  
  return hashtags.slice(0, count);
}
