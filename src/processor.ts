import { fetchContributions } from "fetcher/contribution";
import { fetchMostUsedLanguages } from "fetcher/most_used_languages";
import { zone } from "mdast-zone";
import { remark } from "remark";
import { renderContributions } from "renderer/contributions";
import { renderMostUsedLanguages } from "renderer/most_used_languages";
import { Plugin } from "unified";

const readmeStats: Plugin<[string, string]> = function (token, userName) {
  return async (tree: any) => {
    const contributions = await fetchContributions(token, userName);
    const mostUsedLanguages = await fetchMostUsedLanguages(token, userName);

    zone(tree, "contributions", (start, _, end) => {
      const value = renderContributions(contributions);
      return [start, { type: "code", value }, end];
    });

    zone(tree, "most-used-languages", (start, _, end) => {
      const value = renderMostUsedLanguages(mostUsedLanguages);

      return [start, { type: "code", value }, end];
    });
  };
};

export const getProcessor = (token: string, userName: string) => {
  return remark().use(readmeStats, token, userName).freeze();
};
