import type { CapacitorConfig } from "@capacitor/cli";

// De app laadt de live website rechtstreeks (geen aparte static build).
// Dezelfde Postgres-database, dezelfde API-routes, dezelfde sessies als
// de webversie — de app is een native "venster" op diezelfde site.
//
// Zet dit op je productie-domein zodra dat live staat. Tot die tijd wijst
// dit naar de Railway-URL zodat er meteen getest kan worden.
const PRODUCTION_URL = "https://dreamdaypartners-production.up.railway.app";

const config: CapacitorConfig = {
  appId: "com.dreamdayplatform.app",
  appName: "DreamDay Platform",
  webDir: "www",
  server: {
    url: PRODUCTION_URL,
    androidScheme: "https",
    cleartext: false,
  },
};

export default config;
