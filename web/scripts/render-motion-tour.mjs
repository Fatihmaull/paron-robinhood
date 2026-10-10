/**
 * Frame-step /tour into an MP4. No audio.
 * Usage, from web/, with the app already serving:
 *   BASE_URL=http://127.0.0.1:3000 node scripts/render-motion-tour.mjs
 * Output: ../out/paron-motion-demo.mp4 (not committed).
 */
import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const out = join(process.cwd(), "..", "out", "paron-motion-demo.mp4");
const framesDir = join(tmpdir(), "paron-tour-frames");
const fps = 30;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  reducedMotion: "no-preference",
});
const page = await context.newPage();
await page.goto(`${base}/tour?t=0`, { waitUntil: "networkidle" });
const duration = await page.evaluate(() => window.__paronTour.duration);
const count = Math.round((duration / 1000) * fps);
await mkdir(framesDir, { recursive: true });

for (let index = 0; index < count; index += 1) {
  const ms = Math.min(duration - 1, Math.round((index / fps) * 1000));
  await page.evaluate((time) => window.__paronTour.seek(time), ms);
  const name = String(index).padStart(5, "0");
  await page.screenshot({ path: join(framesDir, `${name}.png`) });
  if (index % fps === 0) console.log(`${(ms / 1000).toFixed(1)}s / ${(duration / 1000).toFixed(1)}s`);
}

await browser.close();
await mkdir(join(process.cwd(), "..", "out"), { recursive: true });
await new Promise((resolve, reject) => {
  const child = spawn("ffmpeg", [
    "-y",
    "-framerate", String(fps),
    "-i", join(framesDir, "%05d.png"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "18",
    out,
  ], { stdio: "inherit" });
  child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))));
});
await rm(framesDir, { recursive: true, force: true });
console.log(out);
