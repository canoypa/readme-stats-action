import { expect, test, vi } from "vitest";
import { fetchTotalCommit } from "./total_commit";

test("fetchTotalCommit", async () => {
  const token = "EXAMPLE_TOKEN";
  const userName = "EXAMPLE_USER";

  const mockFetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({ total_count: 10 }),
  });
  global.fetch = mockFetch;

  const result = await fetchTotalCommit(token, userName);

  expect(result).toBe(10);
  expect(mockFetch.mock.calls.length).toBe(1);
  expect(mockFetch.mock.calls[0][0].toString()).toBe(
    `https://api.github.com/search/commits?q=author%3A${userName}`
  );
  expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe(
    `token ${token}`
  );
});
