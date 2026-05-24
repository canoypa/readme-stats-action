import { expect, test, vi } from "vitest";
import { fetchTotalCommit } from "./total_commit";

const { mockCommits } = vi.hoisted(() => ({
  mockCommits: vi.fn().mockResolvedValue({ data: { total_count: 10 } }),
}));

vi.mock("@actions/github", () => ({
  getOctokit: vi.fn().mockReturnValue({
    rest: { search: { commits: mockCommits } },
  }),
}));

test("fetchTotalCommit", async () => {
  const token = "EXAMPLE_TOKEN";
  const userName = "EXAMPLE_USER";

  const result = await fetchTotalCommit(token, userName);

  expect(result).toBe(10);
  expect(mockCommits).toHaveBeenCalledWith({ q: `author:${userName}` });
});
