// vite/client is loaded through tsconfig "types"; this augments its ImportMetaEnv.
// Every VITE_* variable the app reads is declared here so import.meta.env stays typed.
// Add a line per variable, and mirror it in .env.example.
interface ImportMetaEnv {
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
