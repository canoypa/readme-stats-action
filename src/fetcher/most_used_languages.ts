import { getOctokit } from "@actions/github";
import { User } from "@octokit/graphql-schema";
import { MostUsedLanguages } from "types";

const query = /* GraphQL */ `
  query ($userName: String!, $cursor: String) {
    user(login: $userName) {
      repositories(
        ownerAffiliations: OWNER
        isFork: false
        first: 100
        orderBy: { field: PUSHED_AT, direction: DESC }
        after: $cursor
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          languages(first: 100) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export const fetchMostUsedLanguages = async (
  token: string,
  userName: string
): Promise<MostUsedLanguages> => {
  const octokit = getOctokit(token);

  const langSizeTotal = new Map<string, number>();

  let hasNextPage = true;
  let cursor: string | null = null;
  do {
    const params: { [param: string]: unknown } = { userName, cursor };
    const response = await octokit.graphql<{ user: User }>(query, params);

    const repo = response.user.repositories;

    repo.nodes?.forEach((n) => {
      n!.languages!.edges!.forEach((l) => {
        const size = l!.size;
        const name = l!.node.name;

        const prev = langSizeTotal.get(name) ?? 0;
        langSizeTotal.set(name, prev + size);
      });
    });

    hasNextPage = repo.pageInfo.hasNextPage;
    cursor = repo.pageInfo.endCursor || null;
  } while (hasNextPage);

  const sizeSum = [...langSizeTotal.values()].reduce((a, b) => a + b);

  const mostUsedLanguages = [...langSizeTotal.entries()]
    .map(([name, size]) => ({ name, percent: size / sizeSum }))
    .sort((a, b) => (a.percent > b.percent ? -1 : 1));

  return mostUsedLanguages;
};
