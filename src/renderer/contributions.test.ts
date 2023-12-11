import { expect, test } from "vitest";
import { renderContributions } from "./contributions";

test("renderContributions", () => {
  const contributions = {
    repository: 10,
    issue: 5,
    commit: 20,
    pullRequest: 8,
    totalStarEarned: 18,
    totalContributedTo: 15,
  };

  const expectedOutput = `    Repositories   : 10
    Issues         : 5
    Commits        : 20
    Pull-Requests  : 8
    Stars Earned   : 18
    Contributed To : 15`;

  const result = renderContributions(contributions);

  expect(result).toBe(expectedOutput);
});
