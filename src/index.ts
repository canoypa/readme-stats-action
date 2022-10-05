import { getInput } from "@actions/core";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { getProcessor } from "processor";

const token = getInput("token", { required: true });
const userName = getInput("userName", { required: true });

const targetPath = resolve("./README.md");

const main = async () => {
  const md = await readFile(targetPath, { encoding: "utf-8" });

  const vFile = await getProcessor(token, userName).process(md);
  const updatedMd = vFile.toString();

  await writeFile(targetPath, updatedMd);
};
main();
