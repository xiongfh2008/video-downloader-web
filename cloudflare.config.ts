import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "video-downloader-web",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-03",
    compatibilityFlags: ["nodejs_compat"],

    // Production only: disable public workers.dev and preview URLs.
    workersDev: false,
    previewUrls: false,

    assets: { notFoundHandling: "none" },

    env: {
      ASSETS: bindings.assets(),
    },
  }),
});
