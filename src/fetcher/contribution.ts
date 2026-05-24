import { getOctokit } from "@actions/github";
import type { User } from "@octokit/graphql-schema";
import type { Contributions } from "../types";
import { fetchTotalCommit } from "./total_commit";
import { fetchTotalStarEarned } from "./total_star_earned";

const query = /* GraphQL */ `
  query ($userName: String!) {
    user(login: $userName) {
      repositories(ownerAffiliations: OWNER) {
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
  userName: string,
): Promise<Contributions> => {
  const octokit = getOctokit(token);

  const [response, totalStarEarned, commit] = await Promise.all([
    octokit.graphql<{ user: User }>(query, { userName }),
    fetchTotalStarEarned(token, userName),
    fetchTotalCommit(token, userName),
  ]);

  const totalContributedTo = response.user.repositoriesContributedTo.totalCount;
  const repository = response.user.repositories.totalCount;
  const pullRequest = response.user.pullRequests.totalCount;
  const issue = response.user.issues.totalCount;

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
