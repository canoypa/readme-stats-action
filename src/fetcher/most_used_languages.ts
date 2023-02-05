import { getOctokit } from "@actions/github";
import { User } from "@octokit/graphql-schema";
import { MostUsedLanguages } from "types";

const query = /* GraphQL */ `
  query ($userName: String!) {
    user(login: $userName) {
      repositories(
        ownerAffiliations: OWNER
        isFork: false
        first: 100
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
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

  const response = await octokit.graphql<{ user: User }>(query, {
    userName,
  });

  const langSizeTotal = new Map<string, number>();
  response.user.repositories.nodes!.forEach((r) => {
    r!.languages!.edges!.forEach((l) => {
      const size = l!.size;
      const name = l!.node.name;

      const prev = langSizeTotal.get(name) ?? 0;
      langSizeTotal.set(name, prev + size);
    });
  });

  const sizeSum = [...langSizeTotal.values()].reduce((a, b) => a + b);

  const mostUsedLanguages = [...langSizeTotal.entries()]
    .map(([name, size]) => ({ name, percent: size / sizeSum }))
    .sort((a, b) => (a.percent > b.percent ? -1 : 1));

  return mostUsedLanguages;
};
