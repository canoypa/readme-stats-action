"use strict";

// src/index.ts
var import_promises = require("fs/promises");
var import_node_path = require("path");
var import_core = require("@actions/core");

// src/fetcher/contribution.ts
var import_github3 = require("@actions/github");

// src/fetcher/total_commit.ts
var import_github = require("@actions/github");
var fetchTotalCommit = async (token2, userName2) => {
  const octokit = (0, import_github.getOctokit)(token2);
  const response = await octokit.rest.search.commits({
    q: `author:${userName2}`
  });
  return response.data.total_count;
};

// src/fetcher/total_star_earned.ts
var import_github2 = require("@actions/github");
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
  const octokit = (0, import_github2.getOctokit)(token2);
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
  const octokit = (0, import_github3.getOctokit)(token2);
  const [response, totalStarEarned, commit] = await Promise.all([
    octokit.graphql(query2, { userName: userName2 }),
    fetchTotalStarEarned(token2, userName2),
    fetchTotalCommit(token2, userName2)
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
    pullRequest
  };
  return contributions;
};

// src/fetcher/most_used_languages.ts
var import_github4 = require("@actions/github");
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
  const octokit = (0, import_github4.getOctokit)(token2);
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
  const mostUsedLanguages = [...langSizeTotal.entries()].map(
    ([name, size]) => ({
      name,
      percent: size / sizeSum
    })
  );
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
var renderMostUsedLanguages = (mostUsedLanguages, count) => {
  const numberFormat = new Intl.NumberFormat("en-us", {
    style: "percent",
    minimumFractionDigits: 2
  });
  const sorted = [...mostUsedLanguages].sort((a, b) => b.percent - a.percent).slice(0, count);
  const max = sorted[0].percent;
  const data = [];
  sorted.forEach((v) => {
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
var targetPath = (0, import_node_path.resolve)(optTarget);
var optTemplate = (0, import_core.getInput)("template");
var templatePath = optTemplate ? (0, import_node_path.resolve)(optTemplate) : null;
var mostUsedLanguagesCount = Number(
  (0, import_core.getInput)("most-used-languages-count", { required: true })
);
var applyStats = async (content, name, fetchAndRender) => {
  const startMarker = `<!-- readme-stats:${name}:start -->`;
  const endMarker = `<!-- readme-stats:${name}:end -->`;
  const hasStart = content.includes(startMarker);
  const hasEnd = content.includes(endMarker);
  if (hasStart !== hasEnd) {
    throw new Error(
      `readme-stats:${name} \u306E start/end \u30DE\u30FC\u30AB\u30FC\u304C\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093`
    );
  }
  if (!hasStart) return content;
  const replaceStr = await fetchAndRender();
  const pattern = new RegExp(
    `(?<=${startMarker})[\\s\\S]*?(?=${endMarker})`,
    "g"
  );
  return content.replaceAll(pattern, `
${replaceStr}
`);
};
var main = async () => {
  if (templatePath) {
    await (0, import_promises.copyFile)(templatePath, targetPath);
  }
  const content = await (0, import_promises.readFile)(targetPath, { encoding: "utf-8" });
  let result = content;
  result = await applyStats(
    result,
    "contributions",
    async () => renderContributions(await fetchContributions(token, userName))
  );
  result = await applyStats(
    result,
    "most-used-languages",
    async () => renderMostUsedLanguages(
      await fetchMostUsedLanguages(token, userName),
      mostUsedLanguagesCount
    )
  );
  if (result !== content) {
    await (0, import_promises.writeFile)(targetPath, result);
  }
};
main().catch(import_core.setFailed);
//# sourceMappingURL=index.js.map