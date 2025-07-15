export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {}
  }
  const isDev: string;
}
