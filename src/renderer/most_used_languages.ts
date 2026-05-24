import { getBorderCharacters, type TableUserConfig, table } from "table";
import type { MostUsedLanguages } from "../types";

const GRAPH_MAX_WIDTH = 20;

export const renderMostUsedLanguages = (
  mostUsedLanguages: MostUsedLanguages,
  count: number,
) => {
  const numberFormat = new Intl.NumberFormat("en-us", {
    style: "percent",
    minimumFractionDigits: 2,
  });

  const sorted = [...mostUsedLanguages]
    .sort((a, b) => b.percent - a.percent)
    .slice(0, count);
  const max = sorted[0].percent;

  const data: string[][] = [];
  sorted.forEach((v) => {
    const percent = GRAPH_MAX_WIDTH * (v.percent / max);
    const fullCount = Math.floor(percent);
    const needHalf = percent - Math.floor(percent) > 0.5;

    data.push([
      v.name,
      numberFormat.format(v.percent),
      "|",
      "█".repeat(fullCount) + (needHalf ? "▌" : ""),
    ]);
  });

  const config: TableUserConfig = {
    border: getBorderCharacters("void"),
    columnDefault: { paddingLeft: 0 },
    columns: { 0: { paddingLeft: 4 }, 1: { alignment: "right" } },
    singleLine: true,
  };

  const result = table(data, config).replace(/\s+$/gm, "");

  return result;
};
