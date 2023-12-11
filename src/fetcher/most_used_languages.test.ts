import { expect, test, vi } from "vitest";
import { fetchMostUsedLanguages } from "./most_used_languages";

const mocks = vi.hoisted(() => ({
  mockGetOctokit: vi.fn().mockReturnValue({
    graphql: vi
      .fn()
      .mockReturnValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                languages: {
                  edges: [
                    { size: 30, node: { name: "JavaScript" } },
                    { size: 15, node: { name: "TypeScript" } },
                  ],
                },
              },
              {
                languages: {
                  edges: [
                    { size: 20, node: { name: "JavaScript" } },
                    { size: 10, node: { name: "Python" } },
                  ],
                },
              },
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
              {
                languages: {
                  edges: [{ size: 15, node: { name: "TypeScript" } }],
                },
              },
              {
                languages: {
                  edges: [{ size: 10, node: { name: "Python" } }],
                },
              },
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

test("fetchMostUsedLanguages", async () => {
  const token = "EXAMPLE_TOKEN";
  const userName = "EXAMPLE_USER";

  const result = await fetchMostUsedLanguages(token, userName);

  expect(result).toEqual([
    { name: "JavaScript", percent: 0.5 },
    { name: "TypeScript", percent: 0.3 },
    { name: "Python", percent: 0.2 },
  ]);

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
