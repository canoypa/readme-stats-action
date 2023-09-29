import { getInput } from "@actions/core";
import { fetchContributions } from "fetcher/contribution";
import { fetchMostUsedLanguages } from "fetcher/most_used_languages";
import { copyFile, readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { renderContributions } from "renderer/contributions";
import { renderMostUsedLanguages } from "renderer/most_used_languages";

const token = getInput("token", { required: true });
const userName = getInput("user-name", { required: true });

const optTarget = getInput("target", { required: true });
const targetPath = resolve(optTarget);

const optTemplate = getInput("template");
const templatePath = resolve(optTemplate);

const main = async () => {
  if (templatePath) {
    await copyFile(templatePath, targetPath);
  }

  let content = await readFile(targetPath, { encoding: "utf-8" });

  const contributionsPattern = /<!--\s+readme-stats:contributions\s+-->/g;
  if (content.match(contributionsPattern) !== null) {
    const data = await fetchContributions(token, userName);
    const replaceStr = renderContributions(data);

    content = content.replaceAll(contributionsPattern, replaceStr);
  }

  const mostUsedLanguagesPattern =
    /<!--\s+readme-stats:most-used-languages\s+-->/g;
  if (content.match(mostUsedLanguagesPattern) !== null) {
    const data = await fetchMostUsedLanguages(token, userName);
    const replaceStr = renderMostUsedLanguages(data);

    content = content.replaceAll(mostUsedLanguagesPattern, replaceStr);
  }

  await writeFile(targetPath, content);
};
main();
