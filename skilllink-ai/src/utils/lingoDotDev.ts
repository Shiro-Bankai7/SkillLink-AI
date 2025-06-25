import { LingoDotDevEngine } from "lingo.dev/sdk";

const lingoDotDev = new LingoDotDevEngine({
  apiKey: import.meta.env.VITE_LINGO_DOT_DEV_API_KEY,
});

export default lingoDotDev;
