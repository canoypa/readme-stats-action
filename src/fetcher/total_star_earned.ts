import { getOctokit } from "@actions/github";
import { User } from "@octokit/graphql-schema";

const query = /* GraphQL */ `
  query ($userName: String!, $cursor: String) {
    user(login: $userName) {
      repositories(
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
        first: 100
        after: $cursor
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          stargazerCount
        }
      }
    }
  }
`;

export const fetchTotalStarEarned = async (
  token: string,
  userName: string
): Promise<number> => {
  const octokit = getOctokit(token);

  let count = 0;

  let hasNextPage = true;
  let cursor: string | null = null;
  do {
    const params: { [param: string]: unknown } = { userName, cursor };
    const response = await octokit.graphql<{ user: User }>(query, params);

    const repo = response.user.repositories;

    count += repo.nodes?.reduce((p, c) => p + (c?.stargazerCount ?? 0), 0) ?? 0;

    hasNextPage =
      repo.pageInfo.hasNextPage &&
      !repo.nodes?.some((n) => (n?.stargazerCount ?? 0) < 1);
    cursor = (hasNextPage && repo.pageInfo.endCursor) || null;
  } while (hasNextPage);

  return count;
};
