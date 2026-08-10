import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const httpsKey = env.HTTPS_KEY;
    const httpsCert = env.HTTPS_CERT;

    return {
        plugins: [react()],

        server: {
            host: "0.0.0.0",
            port: 5173,

            ...(httpsKey && httpsCert
                ? {
                      https: {
                          key: fs.readFileSync(
                              path.resolve(process.cwd(), httpsKey)
                          ),
                          cert: fs.readFileSync(
                              path.resolve(process.cwd(), httpsCert)
                          ),
                      },
                  }
                : {}),

            proxy: {
                "/api": {
                    target: "http://127.0.0.1:8000",
                    changeOrigin: true,
                },
            },
        },
    };
});