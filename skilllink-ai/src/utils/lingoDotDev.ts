import { LingoDotDevEngine } from "lingo.dev/sdk";

const lingoDotDev = new LingoDotDevEngine({
  apiKey: import.meta.env.VITE_LINGO_DOT_DEV_API_KEY,
});

// Utility functions to interact with the LingoDotDev backend proxy endpoints
// Provides recognizeLocale and localizeText with robust error handling

export async function recognizeLocale(text: string): Promise<string> {
  try {
    const res = await fetch('/api/lingo/recognizeLocale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.locale || 'en';
  } catch (err: any) {
    console.error('LingoDotDev recognizeLocale error:', err);
    return 'en'; // fallback
  }
}

export async function localizeText(text: string, sourceLocale: string, targetLocale: string): Promise<string> {
  try {
    const res = await fetch('/api/lingo/localizeText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLocale, targetLocale })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.localizedText || text;
  } catch (err: any) {
    console.error('LingoDotDev localizeText error:', err);
    return text; // fallback
  }
}

export default lingoDotDev;
