import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { heroSlides } from "./heroSlides";

const TEAM_DIR = join(process.cwd(), "public", "images", "team");
const CSS = readFileSync(join(process.cwd(), "app", "components", "HeroBanner.css"), "utf-8");

const filesOnDisk = readdirSync(TEAM_DIR).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
const filesInCarousel = heroSlides.map((s) => s.image.replace("/images/team/", ""));

describe("hero carousel slides", () => {
  it("shows every photo in public/images/team", () => {
    const missing = filesOnDisk.filter((f) => !filesInCarousel.includes(f));
    expect(missing, `add these to heroSlides.ts: ${missing.join(", ")}`).toEqual([]);
  });

  it("only references photos that exist on disk", () => {
    const broken = filesInCarousel.filter((f) => !filesOnDisk.includes(f));
    expect(broken, `these files are gone: ${broken.join(", ")}`).toEqual([]);
  });

  it("gives every slide a caption, which doubles as the image alt text", () => {
    expect(heroSlides.filter((s) => !s.caption.trim())).toEqual([]);
  });

  it("lists each photo only once", () => {
    expect(new Set(filesInCarousel).size).toBe(filesInCarousel.length);
  });
});

describe("hero image sizing", () => {
  // Guards the fix for photos being cropped (heads cut off) and upscaled (blurry).
  it("uses object-fit: scale-down so photos are never cropped or upscaled", () => {
    expect(CSS).toMatch(/\.hero-banner-image\s*\{[^}]*object-fit:\s*scale-down/);
  });

  it("never falls back to object-fit: cover, which crops the photo", () => {
    expect(CSS).not.toMatch(/\.hero-banner-image\s*\{[^}]*object-fit:\s*cover/);
    expect(CSS).not.toMatch(/\.hero-banner-slide\s*\{[^}]*background-size:\s*cover/);
  });
});
