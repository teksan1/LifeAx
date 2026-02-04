"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_plugin_jsx_loc_1 = require("@builder.io/vite-plugin-jsx-loc");
const vite_1 = __importDefault(require("@tailwindcss/vite"));
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const vite_2 = require("vite");
const vite_plugin_manus_runtime_1 = require("vite-plugin-manus-runtime");
// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================
const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = node_path_1.default.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming
function ensureLogDir() {
    if (!node_fs_1.default.existsSync(LOG_DIR)) {
        node_fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
    }
}
function trimLogFile(logPath, maxSize) {
    try {
        if (!node_fs_1.default.existsSync(logPath) || node_fs_1.default.statSync(logPath).size <= maxSize) {
            return;
        }
        const lines = node_fs_1.default.readFileSync(logPath, "utf-8").split("\n");
        const keptLines = [];
        let keptBytes = 0;
        // Keep newest lines (from end) that fit within 60% of maxSize
        const targetSize = TRIM_TARGET_BYTES;
        for (let i = lines.length - 1; i >= 0; i--) {
            const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
            if (keptBytes + lineBytes > targetSize)
                break;
            keptLines.unshift(lines[i]);
            keptBytes += lineBytes;
        }
        node_fs_1.default.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
    }
    catch {
        /* ignore trim errors */
    }
}
function writeToLogFile(source, entries) {
    if (entries.length === 0)
        return;
    ensureLogDir();
    const logPath = node_path_1.default.join(LOG_DIR, `${source}.log`);
    // Format entries with timestamps
    const lines = entries.map((entry) => {
        const ts = new Date().toISOString();
        return `[${ts}] ${JSON.stringify(entry)}`;
    });
    // Append to log file
    node_fs_1.default.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");
    // Trim if exceeds max size
    trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
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
                            defer: true,
                        },
                        injectTo: "head",
                    },
                ],
            };
        },
        configureServer(server) {
            // POST /__manus__/logs: Browser sends logs (written directly to files)
            server.middlewares.use("/__manus__/logs", (req, res, next) => {
                if (req.method !== "POST") {
                    return next();
                }
                const handlePayload = (payload) => {
                    // Write logs directly to files
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
                    }
                    catch (e) {
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
                    }
                    catch (e) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ success: false, error: String(e) }));
                    }
                });
            });
        },
    };
}
const plugins = [(0, plugin_react_1.default)(), (0, vite_1.default)(), (0, vite_plugin_jsx_loc_1.jsxLocPlugin)(), (0, vite_plugin_manus_runtime_1.vitePluginManusRuntime)(), vitePluginManusDebugCollector()];
exports.default = (0, vite_2.defineConfig)({
    plugins,
    resolve: {
        alias: {
            "@": node_path_1.default.resolve(import.meta.dirname, "client", "src"),
            "@shared": node_path_1.default.resolve(import.meta.dirname, "shared"),
            "@assets": node_path_1.default.resolve(import.meta.dirname, "attached_assets"),
        },
    },
    envDir: node_path_1.default.resolve(import.meta.dirname),
    root: node_path_1.default.resolve(import.meta.dirname, "client"),
    publicDir: node_path_1.default.resolve(import.meta.dirname, "client", "public"),
    build: {
        outDir: node_path_1.default.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        host: true,
        allowedHosts: [
            ".manuspre.computer",
            ".manus.computer",
            ".manus-asia.computer",
            ".manuscomputer.ai",
            ".manusvm.computer",
            "localhost",
            "127.0.0.1",
        ],
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
});
