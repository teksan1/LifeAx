import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Serve static frontend files
app.use(express.static(path.resolve(__dirname, "../dist/client")));

// Fallback for SPA
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../dist/client/index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 LifeAx server running at http://localhost:${PORT}`);
});
