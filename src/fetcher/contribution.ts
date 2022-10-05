import { getOctokit } from "@actions/github";
import { User } from "@octokit/graphql-schema";
import { formatISO, startOfDay, startOfWeek, sub } from "date-fns";
import { Contributions } from "types";

const query = `
  query ($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      repositories(
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
        first: 100
      ) {
        nodes {
          stargazerCount
        }
      }
      contributionsCollection(from: $from, to: $to) {
        totalRepositoryContributions
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
      }
      repositoriesContributedTo {
        totalCount
      }
    }
  }
`;

export const fetchContributions = async (
  token: string,
  userName: string
): Promise<Contributions> => {
  const octokit = getOctokit(token);

  const today = startOfDay(new Date());
  const from = formatISO(startOfWeek(sub(today, { years: 1 })));
  const to = formatISO(today);

  const response = await octokit.graphql<{ user: User }>(query, {
    userName,
    from,
    to,
  });

  const totalStarEarned = response.user.repositories.nodes!.reduce(
    (p, c) => p + c?.stargazerCount!,
    0
  );
  const totalContributedTo = response.user.repositoriesContributedTo.totalCount;

  const contributionsCollection = response.user.contributionsCollection;
  const repository = contributionsCollection.totalRepositoryContributions;
  const commit = contributionsCollection.totalCommitContributions;
  const pullRequest = contributionsCollection.totalPullRequestContributions;
  const issue = contributionsCollection.totalIssueContributions;

  const contributions = {
    totalStarEarned,
    totalContributedTo,
    repository,
    issue,
    commit,
    pullRequest,
  };

  return contributions;
};
