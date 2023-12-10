export const fetchTotalCommit = async (
  token: string,
  userName: string
): Promise<number> => {
  const url = new URL("https://api.github.com/search/commits");
  url.searchParams.append("q", `author:${userName}`);

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
    },
  });

  const data = await res.json();

  return data.total_count;
};
