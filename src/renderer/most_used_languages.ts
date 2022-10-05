import { getBorderCharacters, table, TableUserConfig } from "table";
import { MostUsedLanguages } from "types";

const GRAPH_MAX_WIDTH = 20;

export const renderMostUsedLanguages = (
  mostUsedLanguages: MostUsedLanguages
) => {
  const numberFormat = new Intl.NumberFormat("en-us", {
    style: "percent",
    minimumFractionDigits: 2,
  });

  const max = Math.max(...mostUsedLanguages.map((v) => v.percent));

  const data: string[][] = [];
  mostUsedLanguages.slice(0, 5).forEach((v) => {
    const repeat = Math.round(GRAPH_MAX_WIDTH * (v.percent / max));

    data.push([
      v.name,
      numberFormat.format(v.percent),
      "|",
      "█".repeat(repeat),
    ]);
  });

  const config: TableUserConfig = {
    border: getBorderCharacters("void"),
    columnDefault: { paddingLeft: 0 },
    singleLine: true,
  };

  const result = table(data, config).replace(/\s+$/gm, "");

  return result;
};
