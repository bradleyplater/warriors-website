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
});
