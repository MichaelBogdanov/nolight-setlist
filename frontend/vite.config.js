import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react()],

        server: {
            host: "0.0.0.0",
            port: 5173,

            https: {
                key: fs.readFileSync(
                    path.resolve(process.cwd(), env.HTTPS_KEY)
                ),
                cert: fs.readFileSync(
                    path.resolve(process.cwd(), env.HTTPS_CERT)
                ),
            },

            proxy: {
                "/api": {
                    target: "http://127.0.0.1:8000",
                    changeOrigin: true,
                },
            },
        },
    };
});
