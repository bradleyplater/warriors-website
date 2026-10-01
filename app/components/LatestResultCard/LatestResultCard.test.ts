import { describe, it, expect } from "vitest";
import { opponentCrestSrc } from "./LatestResultCard";
import { DATA_BASE_URL } from "../../data/client";

describe("opponentCrestSrc", () => {
  it("serves the published S3 key from the CDN", () => {
    expect(opponentCrestSrc({ logoImage: "opponents/OPN878600/logo-1790867655827.jpg" })).toBe(
      `${DATA_BASE_URL}/opponents/OPN878600/logo-1790867655827.jpg`
    );
  });

  it("returns null when the opponent has no logo", () => {
    expect(opponentCrestSrc({})).toBeNull();
    expect(opponentCrestSrc({ logoImage: "" })).toBeNull();
    expect(opponentCrestSrc({ logoImage: null })).toBeNull();
  });
});
