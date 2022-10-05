export type Contributions = {
  totalStarEarned: number;
  totalContributedTo: number;
  repository: number;
  issue: number;
  commit: number;
  pullRequest: number;
};

export type MostUsedLanguages = Array<{
  name: string;
  percent: number;
}>;
