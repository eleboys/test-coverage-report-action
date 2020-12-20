import { CoverageReport, Report, ReportItem } from "./models";

export function addReport(r1: Report, r2: Report): Report {
    return {
        branches: addCoverageReport(r1?.branches, r2?.branches),
        functions: addCoverageReport(r1?.functions, r2?.functions),
        lines: addCoverageReport(r1?.lines, r2?.lines),
        statements: addCoverageReport(r1?.statements, r2?.statements),
    };
}

export function addCoverageReport(
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


export function calculateCoverage(
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

    if (!output.length) {
        return null;
    }

    return output.reduce((sum, item) => {
        return addReport(sum, item);
    });
}

export function reportToArray(report: { [key: string]: Report }): ReportItem[] {
    const reports: ReportItem[] = [];
    if (!report) {
        return reports;
    } 
    
    const props = Object.getOwnPropertyNames(report);

    props.forEach((prop) => {
        reports.push({
            fileName: prop,
            report: report[prop],
        });
    });

    return reports;
}

export function reportToString(report: Report, title: string): string {

    if (!report) {
        return `### ${title}
        None of the files form test coverage report were touched•`
    }

    const coverage = `### ${title}
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
    } )   | ${report.branches.pct.toFixed(2)}% |•`;

    return coverage;
}
