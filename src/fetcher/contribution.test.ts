import { expect, test, vi } from "vitest";
import { fetchContributions } from "./contribution";

const mocks = vi.hoisted(() => ({
  mockGetOctokit: vi.fn().mockReturnValue({
    graphql: vi.fn().mockReturnValueOnce({
      user: {
        repositoriesContributedTo: {
          totalCount: 5,
        },
        repositories: {
          totalCount: 10,
        },
        pullRequests: {
          totalCount: 3,
        },
        issues: {
          totalCount: 2,
        },
      },
    }),
  }),
  mockFetchTotalStarEarned: vi.fn().mockResolvedValue(18),
  mockFetchTotalCommit: vi.fn().mockResolvedValue(7),
}));
vi.mock("@actions/github", () => ({
  getOctokit: mocks.mockGetOctokit,
}));
vi.mock("./total_star_earned", () => ({
  fetchTotalStarEarned: mocks.mockFetchTotalStarEarned,
}));
vi.mock("./total_commit", () => ({
  fetchTotalCommit: mocks.mockFetchTotalCommit,
}));

test("fetchContributions", async () => {
  const token = "EXAMPLE_TOKEN";
  const userName = "EXAMPLE_USER";

  const result = await fetchContributions(token, userName);

  expect(result).toEqual({
    totalStarEarned: 18,
    totalContributedTo: 5,
    repository: 10,
    issue: 2,
    commit: 7,
    pullRequest: 3,
  });

  expect(mocks.mockGetOctokit.mock.calls.length).toBe(1);
  expect(mocks.mockGetOctokit.mock.calls[0][0]).toBe(token);

  expect(mocks.mockGetOctokit().graphql.mock.calls.length).toBe(1);
  expect(mocks.mockGetOctokit().graphql.mock.calls[0][1]).toEqual({
    userName,
  });

  expect(mocks.mockFetchTotalStarEarned.mock.calls.length).toBe(1);
  expect(mocks.mockFetchTotalStarEarned.mock.calls[0]).toEqual([
    token,
    userName,
  ]);

  expect(mocks.mockFetchTotalCommit.mock.calls.length).toBe(1);
  expect(mocks.mockFetchTotalCommit.mock.calls[0]).toEqual([token, userName]);
});
