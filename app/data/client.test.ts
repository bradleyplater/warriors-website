import { describe, it, expect, vi, beforeEach } from "vitest";

describe("data client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("fetches players.json from the CDN base URL", async () => {
    const mockPlayers = [{ id: "PLR1", name: "Test", number: 1, position: "Forward", stats: [] }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPlayers,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getPlayers, DATA_BASE_URL } = await import("./client");
    const result = await getPlayers();

    expect(fetchMock).toHaveBeenCalledWith(`${DATA_BASE_URL}/players.json`);
    expect(result).toEqual(mockPlayers);
  });

  it("fetches results.json and roster-config.json from their own paths", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    const { getResults, getRosterConfig, DATA_BASE_URL } = await import("./client");
    await getResults();
    await getRosterConfig();

    expect(fetchMock).toHaveBeenCalledWith(`${DATA_BASE_URL}/results.json`);
    expect(fetchMock).toHaveBeenCalledWith(`${DATA_BASE_URL}/roster-config.json`);
  });

  it("fetches upcoming-games.json from its own path", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);

    const { getUpcomingGames, DATA_BASE_URL } = await import("./client");
    await getUpcomingGames();

    expect(fetchMock).toHaveBeenCalledWith(`${DATA_BASE_URL}/upcoming-games.json`);
  });

  it("builds asset URLs from a published S3 key", async () => {
    const { assetUrl, DATA_BASE_URL } = await import("./client");
    expect(assetUrl("opponents/OPN878600/logo-1.jpg")).toBe(`${DATA_BASE_URL}/opponents/OPN878600/logo-1.jpg`);
  });

  it("memoizes repeat calls for the same resource within a session", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);

    const { getResults } = await import("./client");
    await getResults();
    await getResults();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws a descriptive error when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: "Not Found" });
    vi.stubGlobal("fetch", fetchMock);

    const { getRosterConfig } = await import("./client");
    await expect(getRosterConfig()).rejects.toThrow(/roster-config\.json.*404/);
  });

  it("fetches seasons.json from its own path", async () => {
    const seasons = { activeSeason: "26/27", seasons: ["25/26", "26/27"] };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => seasons });
    vi.stubGlobal("fetch", fetchMock);

    const { getSeasons, DATA_BASE_URL } = await import("./client");

    expect(await getSeasons()).toEqual(seasons);
    expect(fetchMock).toHaveBeenCalledWith(`${DATA_BASE_URL}/seasons.json`);
  });

  it("resolves seasons to null when seasons.json is not published yet", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403, statusText: "Forbidden" }));

    const { getSeasons } = await import("./client");

    expect(await getSeasons()).toBeNull();
  });
});
