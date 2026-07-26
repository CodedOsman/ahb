// vite.config.ts
import tailwindcss from "file:///C:/Users/osman/Documents/asantey-luxury-salon/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///C:/Users/osman/Documents/asantey-luxury-salon/node_modules/@vitejs/plugin-react/dist/index.js";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "file:///C:/Users/osman/Documents/asantey-luxury-salon/node_modules/vite/dist/node/index.js";
import { vitePluginManusRuntime } from "file:///C:/Users/osman/Documents/asantey-luxury-salon/node_modules/vite-plugin-manus-runtime/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\osman\\Documents\\asantey-luxury-salon";
var PROJECT_ROOT = __vite_injected_original_dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
function vitePluginStorageProxy() {
  return {
    name: "manus-storage-proxy",
    configureServer(server) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing storage key");
          return;
        }
        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
        if (!forgeBaseUrl || !forgeKey) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Storage proxy not configured");
          return;
        }
        try {
          const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
          forgeUrl.searchParams.set("path", key);
          const forgeResp = await fetch(forgeUrl, {
            headers: { Authorization: `Bearer ${forgeKey}` }
          });
          if (!forgeResp.ok) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Storage backend error");
            return;
          }
          const { url } = await forgeResp.json();
          if (!url) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Empty signed URL");
            return;
          }
          res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
          res.end();
        } catch {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Storage proxy error");
        }
      });
    }
  };
}
var plugins = [react(), tailwindcss(), vitePluginManusRuntime(), vitePluginManusDebugCollector(), vitePluginStorageProxy()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "client", "src"),
      "@shared": path.resolve(__vite_injected_original_dirname, "shared"),
      "@assets": path.resolve(__vite_injected_original_dirname, "attached_assets")
    }
  },
  envDir: path.resolve(__vite_injected_original_dirname),
  root: path.resolve(__vite_injected_original_dirname, "client"),
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    port: 3e3,
    strictPort: false,
    // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxvc21hblxcXFxEb2N1bWVudHNcXFxcYXNhbnRleS1sdXh1cnktc2Fsb25cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG9zbWFuXFxcXERvY3VtZW50c1xcXFxhc2FudGV5LWx1eHVyeS1zYWxvblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvb3NtYW4vRG9jdW1lbnRzL2FzYW50ZXktbHV4dXJ5LXNhbG9uL3ZpdGUuY29uZmlnLnRzXCI7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcIkB0YWlsd2luZGNzcy92aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgdHlwZSBQbHVnaW4sIHR5cGUgVml0ZURldlNlcnZlciB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyB2aXRlUGx1Z2luTWFudXNSdW50aW1lIH0gZnJvbSBcInZpdGUtcGx1Z2luLW1hbnVzLXJ1bnRpbWVcIjtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE1hbnVzIERlYnVnIENvbGxlY3RvciAtIFZpdGUgUGx1Z2luXG4vLyBXcml0ZXMgYnJvd3NlciBsb2dzIGRpcmVjdGx5IHRvIGZpbGVzLCB0cmltbWVkIHdoZW4gZXhjZWVkaW5nIHNpemUgbGltaXRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IFBST0pFQ1RfUk9PVCA9IGltcG9ydC5tZXRhLmRpcm5hbWU7XG5jb25zdCBMT0dfRElSID0gcGF0aC5qb2luKFBST0pFQ1RfUk9PVCwgXCIubWFudXMtbG9nc1wiKTtcbmNvbnN0IE1BWF9MT0dfU0laRV9CWVRFUyA9IDEgKiAxMDI0ICogMTAyNDsgLy8gMU1CIHBlciBsb2cgZmlsZVxuY29uc3QgVFJJTV9UQVJHRVRfQllURVMgPSBNYXRoLmZsb29yKE1BWF9MT0dfU0laRV9CWVRFUyAqIDAuNik7IC8vIFRyaW0gdG8gNjAlIHRvIGF2b2lkIGNvbnN0YW50IHJlLXRyaW1taW5nXG5cbnR5cGUgTG9nU291cmNlID0gXCJicm93c2VyQ29uc29sZVwiIHwgXCJuZXR3b3JrUmVxdWVzdHNcIiB8IFwic2Vzc2lvblJlcGxheVwiO1xuXG5mdW5jdGlvbiBlbnN1cmVMb2dEaXIoKSB7XG4gIGlmICghZnMuZXhpc3RzU3luYyhMT0dfRElSKSkge1xuICAgIGZzLm1rZGlyU3luYyhMT0dfRElSLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cmltTG9nRmlsZShsb2dQYXRoOiBzdHJpbmcsIG1heFNpemU6IG51bWJlcikge1xuICB0cnkge1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhsb2dQYXRoKSB8fCBmcy5zdGF0U3luYyhsb2dQYXRoKS5zaXplIDw9IG1heFNpemUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lcyA9IGZzLnJlYWRGaWxlU3luYyhsb2dQYXRoLCBcInV0Zi04XCIpLnNwbGl0KFwiXFxuXCIpO1xuICAgIGNvbnN0IGtlcHRMaW5lczogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQga2VwdEJ5dGVzID0gMDtcblxuICAgIC8vIEtlZXAgbmV3ZXN0IGxpbmVzIChmcm9tIGVuZCkgdGhhdCBmaXQgd2l0aGluIDYwJSBvZiBtYXhTaXplXG4gICAgY29uc3QgdGFyZ2V0U2l6ZSA9IFRSSU1fVEFSR0VUX0JZVEVTO1xuICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgbGluZUJ5dGVzID0gQnVmZmVyLmJ5dGVMZW5ndGgoYCR7bGluZXNbaV19XFxuYCwgXCJ1dGYtOFwiKTtcbiAgICAgIGlmIChrZXB0Qnl0ZXMgKyBsaW5lQnl0ZXMgPiB0YXJnZXRTaXplKSBicmVhaztcbiAgICAgIGtlcHRMaW5lcy51bnNoaWZ0KGxpbmVzW2ldKTtcbiAgICAgIGtlcHRCeXRlcyArPSBsaW5lQnl0ZXM7XG4gICAgfVxuXG4gICAgZnMud3JpdGVGaWxlU3luYyhsb2dQYXRoLCBrZXB0TGluZXMuam9pbihcIlxcblwiKSwgXCJ1dGYtOFwiKTtcbiAgfSBjYXRjaCB7XG4gICAgLyogaWdub3JlIHRyaW0gZXJyb3JzICovXG4gIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVUb0xvZ0ZpbGUoc291cmNlOiBMb2dTb3VyY2UsIGVudHJpZXM6IHVua25vd25bXSkge1xuICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICBlbnN1cmVMb2dEaXIoKTtcbiAgY29uc3QgbG9nUGF0aCA9IHBhdGguam9pbihMT0dfRElSLCBgJHtzb3VyY2V9LmxvZ2ApO1xuXG4gIC8vIEZvcm1hdCBlbnRyaWVzIHdpdGggdGltZXN0YW1wc1xuICBjb25zdCBsaW5lcyA9IGVudHJpZXMubWFwKChlbnRyeSkgPT4ge1xuICAgIGNvbnN0IHRzID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIHJldHVybiBgWyR7dHN9XSAke0pTT04uc3RyaW5naWZ5KGVudHJ5KX1gO1xuICB9KTtcblxuICAvLyBBcHBlbmQgdG8gbG9nIGZpbGVcbiAgZnMuYXBwZW5kRmlsZVN5bmMobG9nUGF0aCwgYCR7bGluZXMuam9pbihcIlxcblwiKX1cXG5gLCBcInV0Zi04XCIpO1xuXG4gIC8vIFRyaW0gaWYgZXhjZWVkcyBtYXggc2l6ZVxuICB0cmltTG9nRmlsZShsb2dQYXRoLCBNQVhfTE9HX1NJWkVfQllURVMpO1xufVxuXG4vKipcbiAqIFZpdGUgcGx1Z2luIHRvIGNvbGxlY3QgYnJvd3NlciBkZWJ1ZyBsb2dzXG4gKiAtIFBPU1QgL19fbWFudXNfXy9sb2dzOiBCcm93c2VyIHNlbmRzIGxvZ3MsIHdyaXR0ZW4gZGlyZWN0bHkgdG8gZmlsZXNcbiAqIC0gRmlsZXM6IGJyb3dzZXJDb25zb2xlLmxvZywgbmV0d29ya1JlcXVlc3RzLmxvZywgc2Vzc2lvblJlcGxheS5sb2dcbiAqIC0gQXV0by10cmltbWVkIHdoZW4gZXhjZWVkaW5nIDFNQiAoa2VlcHMgbmV3ZXN0IGVudHJpZXMpXG4gKi9cbmZ1bmN0aW9uIHZpdGVQbHVnaW5NYW51c0RlYnVnQ29sbGVjdG9yKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJtYW51cy1kZWJ1Zy1jb2xsZWN0b3JcIixcblxuICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaHRtbCxcbiAgICAgICAgdGFnczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRhZzogXCJzY3JpcHRcIixcbiAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgIHNyYzogXCIvX19tYW51c19fL2RlYnVnLWNvbGxlY3Rvci5qc1wiLFxuICAgICAgICAgICAgICBkZWZlcjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbmplY3RUbzogXCJoZWFkXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIC8vIFBPU1QgL19fbWFudXNfXy9sb2dzOiBCcm93c2VyIHNlbmRzIGxvZ3MgKHdyaXR0ZW4gZGlyZWN0bHkgdG8gZmlsZXMpXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKFwiL19fbWFudXNfXy9sb2dzXCIsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gXCJQT1NUXCIpIHtcbiAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGFuZGxlUGF5bG9hZCA9IChwYXlsb2FkOiBhbnkpID0+IHtcbiAgICAgICAgICAvLyBXcml0ZSBsb2dzIGRpcmVjdGx5IHRvIGZpbGVzXG4gICAgICAgICAgaWYgKHBheWxvYWQuY29uc29sZUxvZ3M/Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHdyaXRlVG9Mb2dGaWxlKFwiYnJvd3NlckNvbnNvbGVcIiwgcGF5bG9hZC5jb25zb2xlTG9ncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYXlsb2FkLm5ldHdvcmtSZXF1ZXN0cz8ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgd3JpdGVUb0xvZ0ZpbGUoXCJuZXR3b3JrUmVxdWVzdHNcIiwgcGF5bG9hZC5uZXR3b3JrUmVxdWVzdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGF5bG9hZC5zZXNzaW9uRXZlbnRzPy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB3cml0ZVRvTG9nRmlsZShcInNlc3Npb25SZXBsYXlcIiwgcGF5bG9hZC5zZXNzaW9uRXZlbnRzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9KTtcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogdHJ1ZSB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcmVxQm9keSA9IChyZXEgYXMgeyBib2R5PzogdW5rbm93biB9KS5ib2R5O1xuICAgICAgICBpZiAocmVxQm9keSAmJiB0eXBlb2YgcmVxQm9keSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVQYXlsb2FkKHJlcUJvZHkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0pO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogU3RyaW5nKGUpIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvZHkgPSBcIlwiO1xuICAgICAgICByZXEub24oXCJkYXRhXCIsIChjaHVuaykgPT4ge1xuICAgICAgICAgIGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLm9uKFwiZW5kXCIsICgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgICAgICAgICBoYW5kbGVQYXlsb2FkKHBheWxvYWQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0pO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogU3RyaW5nKGUpIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdml0ZVBsdWdpblN0b3JhZ2VQcm94eSgpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwibWFudXMtc3RvcmFnZS1wcm94eVwiLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoXCIvbWFudXMtc3RvcmFnZVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gcmVxLnVybD8ucmVwbGFjZSgvXlxcLy8sIFwiXCIpO1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiIH0pO1xuICAgICAgICAgIHJlcy5lbmQoXCJNaXNzaW5nIHN0b3JhZ2Uga2V5XCIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvcmdlQmFzZVVybCA9IChwcm9jZXNzLmVudi5CVUlMVF9JTl9GT1JHRV9BUElfVVJMIHx8IFwiXCIpLnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG4gICAgICAgIGNvbnN0IGZvcmdlS2V5ID0gcHJvY2Vzcy5lbnYuQlVJTFRfSU5fRk9SR0VfQVBJX0tFWTtcblxuICAgICAgICBpZiAoIWZvcmdlQmFzZVVybCB8fCAhZm9yZ2VLZXkpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwgeyBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvcGxhaW5cIiB9KTtcbiAgICAgICAgICByZXMuZW5kKFwiU3RvcmFnZSBwcm94eSBub3QgY29uZmlndXJlZFwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGZvcmdlVXJsID0gbmV3IFVSTChcInYxL3N0b3JhZ2UvcHJlc2lnbi9nZXRcIiwgZm9yZ2VCYXNlVXJsICsgXCIvXCIpO1xuICAgICAgICAgIGZvcmdlVXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJwYXRoXCIsIGtleSk7XG5cbiAgICAgICAgICBjb25zdCBmb3JnZVJlc3AgPSBhd2FpdCBmZXRjaChmb3JnZVVybCwge1xuICAgICAgICAgICAgaGVhZGVyczogeyBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7Zm9yZ2VLZXl9YCB9LFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKCFmb3JnZVJlc3Aub2spIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAyLCB7IFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiIH0pO1xuICAgICAgICAgICAgcmVzLmVuZChcIlN0b3JhZ2UgYmFja2VuZCBlcnJvclwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB7IHVybCB9ID0gKGF3YWl0IGZvcmdlUmVzcC5qc29uKCkpIGFzIHsgdXJsOiBzdHJpbmcgfTtcbiAgICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDIsIHsgXCJDb250ZW50LVR5cGVcIjogXCJ0ZXh0L3BsYWluXCIgfSk7XG4gICAgICAgICAgICByZXMuZW5kKFwiRW1wdHkgc2lnbmVkIFVSTFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXMud3JpdGVIZWFkKDMwNywgeyBMb2NhdGlvbjogdXJsLCBcIkNhY2hlLUNvbnRyb2xcIjogXCJuby1zdG9yZVwiIH0pO1xuICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDIsIHsgXCJDb250ZW50LVR5cGVcIjogXCJ0ZXh0L3BsYWluXCIgfSk7XG4gICAgICAgICAgcmVzLmVuZChcIlN0b3JhZ2UgcHJveHkgZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG5cbmNvbnN0IHBsdWdpbnMgPSBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKSwgdml0ZVBsdWdpbk1hbnVzUnVudGltZSgpLCB2aXRlUGx1Z2luTWFudXNEZWJ1Z0NvbGxlY3RvcigpLCB2aXRlUGx1Z2luU3RvcmFnZVByb3h5KCldO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgXCJjbGllbnRcIiwgXCJzcmNcIiksXG4gICAgICBcIkBzaGFyZWRcIjogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsIFwic2hhcmVkXCIpLFxuICAgICAgXCJAYXNzZXRzXCI6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCBcImF0dGFjaGVkX2Fzc2V0c1wiKSxcbiAgICB9LFxuICB9LFxuICBlbnZEaXI6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lKSxcbiAgcm9vdDogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsIFwiY2xpZW50XCIpLFxuICBidWlsZDoge1xuICAgIG91dERpcjogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsIFwiZGlzdC9wdWJsaWNcIiksXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgc3RyaWN0UG9ydDogZmFsc2UsIC8vIFdpbGwgZmluZCBuZXh0IGF2YWlsYWJsZSBwb3J0IGlmIDMwMDAgaXMgYnVzeVxuICAgIGhvc3Q6IHRydWUsXG4gICAgYWxsb3dlZEhvc3RzOiBbXG4gICAgICBcIi5tYW51c3ByZS5jb21wdXRlclwiLFxuICAgICAgXCIubWFudXMuY29tcHV0ZXJcIixcbiAgICAgIFwiLm1hbnVzLWFzaWEuY29tcHV0ZXJcIixcbiAgICAgIFwiLm1hbnVzY29tcHV0ZXIuYWlcIixcbiAgICAgIFwiLm1hbnVzdm0uY29tcHV0ZXJcIixcbiAgICAgIFwibG9jYWxob3N0XCIsXG4gICAgICBcIjEyNy4wLjAuMVwiLFxuICAgIF0sXG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogdHJ1ZSxcbiAgICAgIGRlbnk6IFtcIioqLy4qXCJdLFxuICAgIH0sXG4gICAgcHJveHk6IHtcbiAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vMTI3LjAuMC4xOjUwMDFcIixcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuXG5cbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sV0FBVztBQUNsQixPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFDakIsU0FBUyxvQkFBcUQ7QUFDOUQsU0FBUyw4QkFBOEI7QUFOdkMsSUFBTSxtQ0FBbUM7QUFhekMsSUFBTSxlQUFlO0FBQ3JCLElBQU0sVUFBVSxLQUFLLEtBQUssY0FBYyxhQUFhO0FBQ3JELElBQU0scUJBQXFCLElBQUksT0FBTztBQUN0QyxJQUFNLG9CQUFvQixLQUFLLE1BQU0scUJBQXFCLEdBQUc7QUFJN0QsU0FBUyxlQUFlO0FBQ3RCLE1BQUksQ0FBQyxHQUFHLFdBQVcsT0FBTyxHQUFHO0FBQzNCLE9BQUcsVUFBVSxTQUFTLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFBQSxFQUMzQztBQUNGO0FBRUEsU0FBUyxZQUFZLFNBQWlCLFNBQWlCO0FBQ3JELE1BQUk7QUFDRixRQUFJLENBQUMsR0FBRyxXQUFXLE9BQU8sS0FBSyxHQUFHLFNBQVMsT0FBTyxFQUFFLFFBQVEsU0FBUztBQUNuRTtBQUFBLElBQ0Y7QUFFQSxVQUFNLFFBQVEsR0FBRyxhQUFhLFNBQVMsT0FBTyxFQUFFLE1BQU0sSUFBSTtBQUMxRCxVQUFNLFlBQXNCLENBQUM7QUFDN0IsUUFBSSxZQUFZO0FBR2hCLFVBQU0sYUFBYTtBQUNuQixhQUFTLElBQUksTUFBTSxTQUFTLEdBQUcsS0FB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S0FBSztBQUN0QyxjQUFJLENBQUMsS0FBSztBQUNSLGdCQUFJLFVBQVUsS0FBSyxFQUFFLGdCQUFnQixhQUFhLENBQUM7QUFDbkQsZ0JBQUksSUFBSSxrQkFBa0I7QUFDMUI7QUFBQSxVQUNGO0FBRUEsY0FBSSxVQUFVLEtBQUssRUFBRSxVQUFVLEtBQUssaUJBQWlCLFdBQVcsQ0FBQztBQUNqRSxjQUFJLElBQUk7QUFBQSxRQUNWLFFBQVE7QUFDTixjQUFJLFVBQVUsS0FBSyxFQUFFLGdCQUFnQixhQUFhLENBQUM7QUFDbkQsY0FBSSxJQUFJLHFCQUFxQjtBQUFBLFFBQy9CO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU0sVUFBVSxDQUFDLE1BQU0sR0FBRyxZQUFZLEdBQUcsdUJBQXVCLEdBQUcsOEJBQThCLEdBQUcsdUJBQXVCLENBQUM7QUFFNUgsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFxQixVQUFVLEtBQUs7QUFBQSxNQUN0RCxXQUFXLEtBQUssUUFBUSxrQ0FBcUIsUUFBUTtBQUFBLE1BQ3JELFdBQVcsS0FBSyxRQUFRLGtDQUFxQixpQkFBaUI7QUFBQSxJQUNoRTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVEsS0FBSyxRQUFRLGdDQUFtQjtBQUFBLEVBQ3hDLE1BQU0sS0FBSyxRQUFRLGtDQUFxQixRQUFRO0FBQUEsRUFDaEQsT0FBTztBQUFBLElBQ0wsUUFBUSxLQUFLLFFBQVEsa0NBQXFCLGFBQWE7QUFBQSxJQUN2RCxhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBO0FBQUEsSUFDWixNQUFNO0FBQUEsSUFDTixjQUFjO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLElBQUk7QUFBQSxNQUNGLFFBQVE7QUFBQSxNQUNSLE1BQU0sQ0FBQyxPQUFPO0FBQUEsSUFDaEI7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUdGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
