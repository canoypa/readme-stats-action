import { getOctokit } from "@actions/github";

export const fetchTotalCommit = async (
  token: string,
  userName: string,
): Promise<number> => {
  const octokit = getOctokit(token);

  const response = await octokit.rest.search.commits({
    q: `author:${userName}`,
  });

  return response.data.total_count;
};
