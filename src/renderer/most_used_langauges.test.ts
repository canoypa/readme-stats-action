import { expect, test } from "vitest";
import { renderMostUsedLanguages } from "./most_used_languages";

test("renderMostUsedLanguages", () => {
  const mostUsedLanguages = [
    { name: "JavaScript", percent: 0.5 },
    { name: "TypeScript", percent: 0.3 },
    { name: "Python", percent: 0.2 },
  ];

  const expectedOutput = `    JavaScript 50.00% | ████████████████████
    TypeScript 30.00% | ████████████
    Python     20.00% | ████████`;

  const result = renderMostUsedLanguages(mostUsedLanguages);

  expect(result).toEqual(expectedOutput);
});
