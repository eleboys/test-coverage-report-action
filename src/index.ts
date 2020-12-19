import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";

import { Report, CoverageReport, ReportItem, PullRequest } from "./models";

async function run() {
    try {
        const inputs = {
            token: core.getInput("token"),
            path: core.getInput("path"),
            title: core.getInput("title"),
        };

        const pr = getPullRequestDetails();

        if (!pr) {
            core.error("This action only works on pull_request events");
            return;
        }

        const octokit = github.getOctokit(inputs.token);
        const files = await getPullRequestFiles(octokit, pr);
        const report = generateReport(inputs.path, files);
        const coverage = reportToString(report, inputs.title);

        await updatePullRequestDescription(pr, octokit, coverage);

        core.setOutput("summary", report);
    } catch (error) {
        core.setFailed(error.message);
    }
}

function getPullRequestDetails(): PullRequest {
    const {
        payload: { pull_request: pullRequest, repository },
    } = github.context;

    if (!pullRequest) {
        return null as any;
    }

    const { number: issueNumber } = pullRequest;
    const { full_name: repoFullName } = repository as any;
    const [owner, repo] = repoFullName.split("/");
    const base = github.context.payload.pull_request?.base?.sha;
    const head = github.context.payload.pull_request?.head?.sha;

    if (!base || !head) {
        core.setFailed(
            `The base and head commits are missing from the payload for this ${github.context.eventName} event. `
        );
    }

    return {
        base,
        head,
        issueNumber,
        owner,
        repo,
    };
}

async function updatePullRequestDescription(
    pr: PullRequest,
    octokit,
    coverage: string
) {
    const params = {
        pull_number: pr.issueNumber,
        owner: pr.owner,
        repo: pr.repo,
    };
    const res = await octokit.pulls.get(params);
    await octokit.pulls.update({
        ...params,
        body: buildPullRequestDescription(res.data.body, coverage),
    });
}

function buildPullRequestDescription(body: string, coverage: string) {
    const title = coverage.split("\n")[0];
    const start = body.indexOf(title);
    const end = body.indexOf(".|", start);
    if (start < 0 || end < 0) {
        return body + "\n\n" + coverage;
    }

    body =
        body.substring(0, start) +
        coverage +
        body.substring(end + 2, body.length);
    return body;
}

async function getPullRequestFiles(octokit, pr: PullRequest) {
    const compareResp = await octokit.repos.compareCommits({
        base: pr.base,
        head: pr.head,
        owner: pr.owner,
        repo: pr.repo,
    });

    if (compareResp.status !== 200) {
        core.setFailed(`The GitHub API for comparing the base and head commits for this 
          ${github.context.eventName} event returned ${compareResp.status}, expected 200. `);
    }

    return compareResp.data.files
        .filter((f) => f.status === "modified" || f.status === "added")
        .map((f) => f.filename);
}

function generateReport(path: string, files: string[]): Report {
    const data = fs.readFileSync(
        `${process.env.GITHUB_WORKSPACE}/${path}`,
        "utf8"
    );
    const json = JSON.parse(data);
    return calculateCoverage(files, json);
}

function reportToString(report: Report, title: string) {
    const coverage = `==== **${title}** ====
  | Type       |   #   |  %  |
  |------------|:-----:|:---:|
  | Lines      |   ( ${report.lines.covered}     /${
        report.lines.total
    } )   | ${report.lines.pct.toFixed(2)}% |
  | Functions  |   ( ${report.functions.covered} /${
        report.functions.total
    } )   | ${report.functions.pct.toFixed(2)}% |
  | Statements |   ( ${report.statements.covered}/${
        report.statements.total
    } )   | ${report.statements.pct.toFixed(2)}% |
  | Branches   |   ( ${report.branches.covered}  /${
        report.branches.total
    } )   | ${report.branches.pct.toFixed(2)}% .|`;

    return coverage;
}

function calculateCoverage(
    changedFiles: string[],
    report: { [key: string]: Report }
): Report {
    const output: Report[] = [];
    const reports = reportToArray(report);

    changedFiles.forEach((cf) => {
        const item = reports.find((r) =>
            r.fileName.toLocaleLowerCase().endsWith(cf)
        );
        if (item) {
            output.push(item.report);
        }
    });

    return output.reduce((sum, item) => {
        return addReport(sum, item);
    });
}

function addReport(r1: Report, r2: Report): Report {
    return {
        branches: addCoverageReport(r1?.branches, r2?.branches),
        functions: addCoverageReport(r1?.functions, r2?.functions),
        lines: addCoverageReport(r1?.lines, r2?.lines),
        statements: addCoverageReport(r1?.statements, r2?.statements),
    };
}

function addCoverageReport(
    c1: CoverageReport,
    c2: CoverageReport
): CoverageReport {
    const res = {
        covered: (c1?.covered || 0) + (c2?.covered || 0),
        skipped: (c1?.skipped || 0) + (c2?.skipped || 0),
        total: (c1?.total || 0) + (c2?.total || 0),
        pct: 0,
    };

    res.pct = (res.covered / res.total || 0) * 100;
    return res;
}

function reportToArray(report: { [key: string]: Report }): ReportItem[] {
    const props = Object.getOwnPropertyNames(report);
    const reports: ReportItem[] = [];

    props.forEach((prop) => {
        reports.push({
            fileName: prop,
            report: report[prop],
        });
    });

    return reports;
}

run();
