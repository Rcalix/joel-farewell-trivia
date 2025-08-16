/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string
  // Agrega más variables de entorno aquí si las necesitas
  // readonly VITE_OTHER_VAR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
