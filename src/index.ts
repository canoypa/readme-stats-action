import { getInput } from "@actions/core";
import { copyFile, readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { getProcessor } from "processor";

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

  let md = await readFile(targetPath, { encoding: "utf-8" });

  const vFile = await getProcessor(token, userName).process(md);
  md = vFile.toString();

  await writeFile(targetPath, md);
};
main();
