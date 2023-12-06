import { getOctokit } from "@actions/github";
import { User } from "@octokit/graphql-schema";
import { formatISO, startOfDay, startOfWeek, sub } from "date-fns";
import { Contributions } from "types";
import { fetchTotalCommit } from "./total_commit";
import { fetchTotalStarEarned } from "./total_star_earned";

const query = /* GraphQL */ `
  query ($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      repositories {
        totalCount
      }
      issues {
        totalCount
      }
      pullRequests {
        totalCount
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

  const totalStarEarned = fetchTotalStarEarned(token, userName);
  const totalContributedTo = response.user.repositoriesContributedTo.totalCount;

  const repository = response.user.repositories.totalCount;
  const commit = fetchTotalCommit(token, userName);
  const pullRequest = response.user.pullRequests.totalCount;
  const issue = response.user.issues.totalCount;

  const contributions = {
    totalStarEarned: await totalStarEarned,
    totalContributedTo,
    repository,
    issue,
    commit: await commit,
    pullRequest,
  };

  return contributions;
};
