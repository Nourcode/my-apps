export type App = {
  name: string;
  url: string;
  icon: string;
  tags: string[];
  description: string;
  brand: string;
};

const catalog: App[] = [
  {
    name: "Claude",
    url: "https://claude.ai",
    icon: "https://www.google.com/s2/favicons?domain=claude.ai&sz=64",
    tags: ["AI"],
    description: "AI assistant for writing, coding, and analysis.",
    brand: "Anthropic",
  },
  {
    name: "Amazon",
    url: "https://amazon.com",
    icon: "https://www.google.com/s2/favicons?domain=amazon.com&sz=64",
    tags: ["Shopping"],
    description: "Online marketplace for shopping, streaming, and cloud services.",
    brand: "Amazon",
  },
  {
    name: "Antigravity IDE",
    url: "https://antigravity.google",
    icon: "https://www.google.com/s2/favicons?domain=antigravity.google&sz=64",
    tags: ["Dev"],
    description: "AI-native code editor built for agentic development.",
    brand: "Google",
  },
  {
    name: "Discord",
    url: "https://discord.com",
    icon: "https://www.google.com/s2/favicons?domain=discord.com&sz=64",
    tags: ["Social"],
    description: "Voice, video, and text chat platform for communities and teams.",
    brand: "Discord",
  },
  {
    name: "GitHub Desktop",
    url: "https://desktop.github.com",
    icon: "https://www.google.com/s2/favicons?domain=desktop.github.com&sz=64",
    tags: ["Dev"],
    description: "Visual Git client for managing repositories without the command line.",
    brand: "GitHub",
  },
  {
    name: "WhatsApp",
    url: "https://whatsapp.com",
    icon: "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64",
    tags: ["Social"],
    description: "Encrypted messaging, voice, and video calling app.",
    brand: "Meta",
  },
  {
    name: "DeSmuME",
    url: "https://desmume.org",
    icon: "https://www.google.com/s2/favicons?domain=desmume.org&sz=64",
    tags: ["Gaming"],
    description: "Open-source Nintendo DS emulator for playing DS games on desktop.",
    brand: "DeSmuME",
  },
  {
    name: "GitHub",
    url: "https://github.com",
    icon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    tags: ["Dev"],
    description: "Web platform for hosting and collaborating on code repositories.",
    brand: "GitHub",
  },
  {
    name: "Notion",
    url: "https://notion.so",
    icon: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
    tags: ["Productivity"],
    description: "All-in-one workspace for notes, docs, wikis, and project management.",
    brand: "Notion",
  },
  {
    name: "Dropbox",
    url: "https://dropbox.com",
    icon: "https://www.google.com/s2/favicons?domain=dropbox.com&sz=64",
    tags: ["Storage"],
    description: "Cloud storage and file sharing service for syncing files across devices.",
    brand: "Dropbox",
  },
  {
    name: "YouTube",
    url: "https://youtube.com",
    icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
    tags: ["Entertainment"],
    description: "Video streaming platform for watching and sharing content worldwide.",
    brand: "Google",
  },
  {
    name: "Spotify",
    url: "https://spotify.com",
    icon: "https://www.google.com/s2/favicons?domain=spotify.com&sz=64",
    tags: ["Entertainment"],
    description: "Music and podcast streaming service with millions of tracks.",
    brand: "Spotify",
  },
  {
    name: "Vercel",
    url: "https://vercel.com",
    icon: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
    tags: ["Dev"],
    description: "Cloud platform for deploying and hosting frontend projects and serverless functions.",
    brand: "Vercel",
  },
  {
    name: "Gmail",
    url: "https://mail.google.com",
    icon: "https://www.google.com/s2/favicons?domain=mail.google.com&sz=64",
    tags: ["Productivity"],
    description: "Google's email service with powerful search and smart inbox features.",
    brand: "Google",
  },
  {
    name: "Google Drive",
    url: "https://drive.google.com",
    icon: "https://www.google.com/s2/favicons?domain=drive.google.com&sz=64",
    tags: ["Storage"],
    description: "Cloud storage and file sharing integrated with Google Docs, Sheets, and Slides.",
    brand: "Google",
  },
  {
    name: "ChatGPT",
    url: "https://chatgpt.com",
    icon: "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64",
    tags: ["AI"],
    description: "AI conversational assistant for writing, coding, research, and problem-solving.",
    brand: "OpenAI",
  },
  {
    name: "Gemini",
    url: "https://gemini.google.com",
    icon: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64",
    tags: ["AI"],
    description: "Google's AI assistant for multimodal tasks including text, images, and code.",
    brand: "Google",
  },
];

export default catalog;
