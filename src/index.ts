import { copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getInput, setFailed } from "@actions/core";
import { fetchContributions } from "./fetcher/contribution";
import { fetchMostUsedLanguages } from "./fetcher/most_used_languages";
import { renderContributions } from "./renderer/contributions";
import { renderMostUsedLanguages } from "./renderer/most_used_languages";

const token = getInput("token", { required: true });
const userName = getInput("user-name", { required: true });

const optTarget = getInput("target", { required: true });
const targetPath = resolve(optTarget);

const optTemplate = getInput("template");
const templatePath = optTemplate ? resolve(optTemplate) : null;

const applyStats = async (
  content: string,
  name: string,
  fetchAndRender: () => Promise<string>,
): Promise<string> => {
  const startMarker = `<!-- readme-stats:${name}:start -->`;
  const endMarker = `<!-- readme-stats:${name}:end -->`;
  const hasStart = content.includes(startMarker);
  const hasEnd = content.includes(endMarker);
  if (hasStart !== hasEnd) {
    throw new Error(
      `readme-stats:${name} の start/end マーカーが対応していません`,
    );
  }
  if (!hasStart) return content;

  const replaceStr = await fetchAndRender();
  const pattern = new RegExp(
    `(?<=${startMarker})[\\s\\S]*?(?=${endMarker})`,
    "g",
  );
  return content.replaceAll(pattern, `\n${replaceStr}\n`);
};

const main = async () => {
  if (templatePath) {
    await copyFile(templatePath, targetPath);
  }

  const content = await readFile(targetPath, { encoding: "utf-8" });
  let result = content;

  result = await applyStats(result, "contributions", async () =>
    renderContributions(await fetchContributions(token, userName)),
  );

  result = await applyStats(result, "most-used-languages", async () =>
    renderMostUsedLanguages(await fetchMostUsedLanguages(token, userName)),
  );

  if (result !== content) {
    await writeFile(targetPath, result);
  }
};
main().catch(setFailed);
