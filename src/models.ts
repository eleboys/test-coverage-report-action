export interface ReportItem {
  fileName: string;
  report: Report;
}

export interface Report {
  lines: CoverageReport;
  functions: CoverageReport;
  statements: CoverageReport;
  branches: CoverageReport;
}

export interface CoverageReport {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

export interface PullRequest {
  owner: string;
  repo: string;
  issueNumber: number;
  base: string;
  head: string;
}
