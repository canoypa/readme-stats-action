import { expect, test, vi } from "vitest";
import { fetchTotalStarEarned } from "./total_star_earned";

const mocks = vi.hoisted(() => ({
  mockGetOctokit: vi.fn().mockReturnValue({
    graphql: vi
      .fn()
      .mockReturnValueOnce({
        user: {
          repositories: {
            nodes: [
              { stargazerCount: 5 },
              { stargazerCount: 10 },
              { stargazerCount: 3 },
            ],
            pageInfo: {
              hasNextPage: true,
              endCursor: "EXAMPLE_CURSOR",
            },
          },
        },
      })
      .mockReturnValueOnce({
        user: {
          repositories: {
            nodes: [
              { stargazerCount: 0 },
              { stargazerCount: 0 },
              { stargazerCount: 0 },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      }),
  }),
}));
vi.mock("@actions/github", () => ({
  getOctokit: mocks.mockGetOctokit,
}));

test("fetchTotalStarEarned", async () => {
  const token = "EXAMPLE_TOKEN";
  const userName = "EXAMPLE_USER";

  const result = await fetchTotalStarEarned(token, userName);

  expect(result).toBe(18);
  expect(mocks.mockGetOctokit.mock.calls.length).toBe(1);
  expect(mocks.mockGetOctokit.mock.calls[0][0]).toBe(token);

  expect(mocks.mockGetOctokit().graphql.mock.calls.length).toBe(2);
  expect(mocks.mockGetOctokit().graphql.mock.calls[0][1]).toEqual({
    userName,
    cursor: null,
  });
  expect(mocks.mockGetOctokit().graphql.mock.calls[1][1]).toEqual({
    userName,
    cursor: "EXAMPLE_CURSOR",
  });
});
