import { getBorderCharacters, table, TableUserConfig } from "table";
import { Contributions } from "types";

export const renderContributions = (contributions: Contributions) => {
  const data = [
    ["Repositories", ":", contributions.repository],
    ["Issues", ":", contributions.issue],
    ["Commits", ":", contributions.commit],
    ["Pull-Requests", ":", contributions.pullRequest],
    ["Total Stars Earned", ":", contributions.totalStarEarned],
    ["Total Contributed To", ":", contributions.totalContributedTo],
  ];

  const config: TableUserConfig = {
    border: getBorderCharacters("void"),
    columnDefault: { paddingLeft: 0 },
    columns: { 0: { paddingLeft: 4 } },
    singleLine: true,
  };

  const result = table(data, config).replace(/\s+$/gm, "");

  return result;
};
