import { CoverageReport, Report } from "./models";

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
