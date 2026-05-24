"use strict";

// src/index.ts
var import_core = require("@actions/core");
var import_promises = require("fs/promises");
var import_path = require("path");

// src/fetcher/contribution.ts
var import_github2 = require("@actions/github");

// src/fetcher/total_commit.ts
var fetchTotalCommit = async (token2, userName2) => {
  const url = new URL("https://api.github.com/search/commits");
  url.searchParams.append("q", `author:${userName2}`);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token2}`
    }
  });
  const data = await res.json();
  return data.total_count;
};

// src/fetcher/total_star_earned.ts
var import_github = require("@actions/github");
var query = (
  /* GraphQL */
  `
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
`
);
var fetchTotalStarEarned = async (token2, userName2) => {
  const octokit = (0, import_github.getOctokit)(token2);
  let count = 0;
  let hasNextPage = true;
  let cursor = null;
  do {
    const params = { userName: userName2, cursor };
    const response = await octokit.graphql(query, params);
    const repo = response.user.repositories;
    count += repo.nodes?.reduce((p, c) => p + (c?.stargazerCount ?? 0), 0) ?? 0;
    hasNextPage = repo.pageInfo.hasNextPage && !repo.nodes?.some((n) => (n?.stargazerCount ?? 0) < 1);
    cursor = hasNextPage && repo.pageInfo.endCursor || null;
  } while (hasNextPage);
  return count;
};

// src/fetcher/contribution.ts
var query2 = (
  /* GraphQL */
  `
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
`
);
var fetchContributions = async (token2, userName2) => {
  const octokit = (0, import_github2.getOctokit)(token2);
  const response = await octokit.graphql(query2, {
    userName: userName2
  });
  const totalStarEarned = await fetchTotalStarEarned(token2, userName2);
  const totalContributedTo = response.user.repositoriesContributedTo.totalCount;
  const repository = response.user.repositories.totalCount;
  const commit = await fetchTotalCommit(token2, userName2);
  const pullRequest = response.user.pullRequests.totalCount;
  const issue = response.user.issues.totalCount;
  const contributions = {
    totalStarEarned,
    totalContributedTo,
    repository,
    issue,
    commit,
    pullRequest
  };
  return contributions;
};

// src/fetcher/most_used_languages.ts
var import_github3 = require("@actions/github");
var query3 = (
  /* GraphQL */
  `
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
`
);
var fetchMostUsedLanguages = async (token2, userName2) => {
  const octokit = (0, import_github3.getOctokit)(token2);
  const langSizeTotal = /* @__PURE__ */ new Map();
  let hasNextPage = true;
  let cursor = null;
  do {
    const params = { userName: userName2, cursor };
    const response = await octokit.graphql(query3, params);
    const repo = response.user.repositories;
    repo.nodes?.forEach((n) => {
      n?.languages?.edges?.forEach((l) => {
        if (!l) return;
        const size = l.size;
        const name = l.node.name;
        const prev = langSizeTotal.get(name) ?? 0;
        langSizeTotal.set(name, prev + size);
      });
    });
    hasNextPage = repo.pageInfo.hasNextPage;
    cursor = repo.pageInfo.endCursor || null;
  } while (hasNextPage);
  const sizeSum = [...langSizeTotal.values()].reduce((a, b) => a + b);
  const mostUsedLanguages = [...langSizeTotal.entries()].map(([name, size]) => ({ name, percent: size / sizeSum })).sort((a, b) => a.percent > b.percent ? -1 : 1);
  return mostUsedLanguages;
};

// src/renderer/contributions.ts
var import_table = require("table");
var renderContributions = (contributions) => {
  const data = [
    ["Repositories", ":", contributions.repository],
    ["Issues", ":", contributions.issue],
    ["Commits", ":", contributions.commit],
    ["Pull-Requests", ":", contributions.pullRequest],
    ["Stars Earned", ":", contributions.totalStarEarned],
    ["Contributed To", ":", contributions.totalContributedTo]
  ];
  const config = {
    border: (0, import_table.getBorderCharacters)("void"),
    columnDefault: { paddingLeft: 0 },
    columns: { 0: { paddingLeft: 4 } },
    singleLine: true
  };
  const result = (0, import_table.table)(data, config).replace(/\s+$/gm, "");
  return result;
};

// src/renderer/most_used_languages.ts
var import_table2 = require("table");
var GRAPH_MAX_WIDTH = 20;
var renderMostUsedLanguages = (mostUsedLanguages) => {
  const numberFormat = new Intl.NumberFormat("en-us", {
    style: "percent",
    minimumFractionDigits: 2
  });
  const max = Math.max(...mostUsedLanguages.map((v) => v.percent));
  const data = [];
  mostUsedLanguages.slice(0, 5).forEach((v) => {
    const percent = GRAPH_MAX_WIDTH * (v.percent / max);
    const fullCount = Math.floor(percent);
    const needHalf = percent - Math.floor(percent) > 0.5;
    data.push([
      v.name,
      numberFormat.format(v.percent),
      "|",
      "\u2588".repeat(fullCount) + (needHalf ? "\u258C" : "")
    ]);
  });
  const config = {
    border: (0, import_table2.getBorderCharacters)("void"),
    columnDefault: { paddingLeft: 0 },
    columns: { 0: { paddingLeft: 4 }, 1: { alignment: "right" } },
    singleLine: true
  };
  const result = (0, import_table2.table)(data, config).replace(/\s+$/gm, "");
  return result;
};

// src/index.ts
var token = (0, import_core.getInput)("token", { required: true });
var userName = (0, import_core.getInput)("user-name", { required: true });
var optTarget = (0, import_core.getInput)("target", { required: true });
var targetPath = (0, import_path.resolve)(optTarget);
var optTemplate = (0, import_core.getInput)("template");
var templatePath = optTemplate ? (0, import_path.resolve)(optTemplate) : null;
var main = async () => {
  if (templatePath) {
    await (0, import_promises.copyFile)(templatePath, targetPath);
  }
  let content = await (0, import_promises.readFile)(targetPath, { encoding: "utf-8" });
  const contributionsPattern = /<!--\s+readme-stats:contributions\s+-->/g;
  if (content.match(contributionsPattern) !== null) {
    const data = await fetchContributions(token, userName);
    const replaceStr = renderContributions(data);
    content = content.replaceAll(contributionsPattern, replaceStr);
  }
  const mostUsedLanguagesPattern = /<!--\s+readme-stats:most-used-languages\s+-->/g;
  if (content.match(mostUsedLanguagesPattern) !== null) {
    const data = await fetchMostUsedLanguages(token, userName);
    const replaceStr = renderMostUsedLanguages(data);
    content = content.replaceAll(mostUsedLanguagesPattern, replaceStr);
  }
  await (0, import_promises.writeFile)(targetPath, content);
};
main();
//# sourceMappingURL=index.js.map