import { afterEach, describe, expect, it, vi } from "vitest";
import type { SpaceConfig } from "@/lib/types";
import { ApiProvider } from "./api-provider";

const spaces: SpaceConfig[] = [
  { id: "lib", name: "Lib", type: "study", floors: [{ id: "1", name: "One", capacity: 100 }, { id: "2", name: "Two", capacity: 50 }] },
];

afterEach(() => vi.unstubAllGlobals());

describe("ApiProvider", () => {
  it("maps readings onto configured floors, using config capacities", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        readings: [
          { spaceId: "lib", floorId: "1", count: 42, timestamp: "2026-10-05T14:00:00Z" },
          { spaceId: "other", floorId: "x", count: 9, timestamp: "2026-10-05T14:00:00Z" },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const p = new ApiProvider({ spaces, baseUrl: "https://example.test/", apiKey: "k" });
    const [lib] = await p.getCurrent();

    expect(fetchMock).toHaveBeenCalledWith("https://example.test/occupancy", expect.objectContaining({ headers: { Authorization: "Bearer k" } }));
    expect(lib.floors).toEqual([{ floorId: "1", count: 42, capacity: 100, timestamp: "2026-10-05T14:00:00Z" }]);
    expect(p.isSimulated).toBe(false);
  });

  it("returns an empty curve when the history endpoint is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 404 })));
    expect(await new ApiProvider({ spaces, baseUrl: "https://example.test" }).getToday("lib")).toEqual([]);
  });
});
