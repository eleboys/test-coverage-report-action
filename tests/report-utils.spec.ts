import { addCoverageReport, addReport, calculateCoverage, reportToArray, reportToString } from "../src/report-utils";

const sampleCoverageSummary = {
    "total": {
        "lines":{"total":79,"covered":35,"skipped":0,"pct":44.3},
        "statements":{"total":79,"covered":35,"skipped":0,"pct":44.3},
        "functions":{"total":17,"covered":7,"skipped":0,"pct":41.18},
        "branches":{"total":110,"covered":75,"skipped":0,"pct":68.18}
    },
    "file1.ts": {
        "lines":{"total":53,"covered":15,"skipped":0,"pct":28.3},
        "functions":{"total":9,"covered":2,"skipped":0,"pct":22.22},
        "statements":{"total":53,"covered":15,"skipped":0,"pct":28.3},
        "branches":{"total":34,"covered":2,"skipped":0,"pct":5.88}
    },
    "file2.ts": {
        "lines":{"total":26,"covered":20,"skipped":0,"pct":76.92},
        "functions":{"total":8,"covered":5,"skipped":0,"pct":62.5},
        "statements":{"total":26,"covered":20,"skipped":0,"pct":76.92},
        "branches":{"total":76,"covered":73,"skipped":0,"pct":96.05},
    }
};

describe("test addReport method", () => {
    it("should exist", () => {
        expect(addReport).toBeTruthy();
    });

    it("should return valid object if both sides are null", () => {
        const res = addReport(null, null);
        expect(res).toBeTruthy();
        expect(res.branches).not.toBeFalsy();
        expect(res.functions).not.toBeFalsy();
        expect(res.lines).not.toBeFalsy();
        expect(res.statements).not.toBeFalsy();
    });

    it("should return valid object if left side is null", () => {
        const cov = { covered: 1, pct: 1, skipped: 1, total: 1};
        const res = addReport(null, { branches: cov, functions: cov, lines: cov, statements: cov });
        expect(res).toBeTruthy();
    });

    it("should return valid object if right side is null", () => {
        const cov = { covered: 1, pct: 1, skipped: 1, total: 1};
        const res = addReport({ branches: cov, functions: cov, lines: cov, statements: cov }, null);
        expect(res).toBeTruthy();
    });
});

describe("test addCoverageReport method", () => {
    it("should return valid object if both sided are null", () => {
        const res = addCoverageReport(null, null);
        expect(res).toBeTruthy();
        expect(res).toEqual({covered:0,skipped:0,total:0,pct:0});
    });

    it("should return valid object if right side is null", () => {
        const res = addCoverageReport({ covered: 1, skipped: 1, total: 10, pct: 10}, null);
        expect(res).toBeTruthy();
        expect(res).toEqual({covered:1,skipped:1,total:10,pct:10});
    });

    it("should return valid object if left side is null", () => {
        const res = addCoverageReport(null, { covered: 1, skipped: 1, total: 10, pct: 10});
        expect(res).toBeTruthy();
        expect(res).toEqual({covered:1,skipped:1,total:10,pct:10});
    });

    it("should add correctly and calculate average percentage", () => {
        const res = addCoverageReport({ covered: 5, skipped: 0, total: 10, pct: 50}, { covered: 1, skipped: 1, total: 10, pct: 10});
        expect(res).toBeTruthy();
        expect(res).toEqual({covered:6,skipped:1,total:20,pct:30});
    });
});

describe("test reportToArray method", () => {
    it("should return empty result if null input is passed", () => {
        const res = reportToArray(null);
        expect(res.length).toEqual(0);
    });

    it("should return array with correct length and correct items", () => {
        const res = reportToArray(sampleCoverageSummary);
        expect(res.length).toEqual(3);
        expect(res[0]).toEqual({ fileName: "total", report: sampleCoverageSummary.total });
        expect(res[1]).toEqual({ fileName: "file1.ts", report: sampleCoverageSummary["file1.ts"] });
        expect(res[2]).toEqual({ fileName: "file2.ts", report: sampleCoverageSummary["file2.ts"] });
    });
});

describe("test calculateCoverage method", () => {
    it("should return null if no file is changed", () => {
        const res = calculateCoverage([], sampleCoverageSummary);
        expect(res).toBeNull();
    });

    it("should calculate correct report base on one touched file", () => {
        const res = calculateCoverage(["file1.ts"], sampleCoverageSummary);
        expect(res.branches).toEqual(sampleCoverageSummary["file1.ts"].branches);
        expect(res.functions).toEqual(sampleCoverageSummary["file1.ts"].functions);
        expect(res.lines).toEqual(sampleCoverageSummary["file1.ts"].lines);
        expect(res.statements).toEqual(sampleCoverageSummary["file1.ts"].statements);
    });

    it("should calculate correct report base on two touched file", () => {
        const res = calculateCoverage(["file1.ts", "file2.ts", "file4.ts"], sampleCoverageSummary);
        expect(res.branches).toEqual({"total":110,"covered":75,"skipped":0,"pct": 68.18181818181817 });
    });
});

describe("test reportToString method", () => {
    it("should return planned value if no report is passed", () => {
        const res = reportToString(null, null);
        expect(res).toEqual(`### ${null}\n        None of the files form test coverage report were touched•`)
    });

    it("should return planned value if report is passed", () => {
        const report = sampleCoverageSummary.total;
        const res = reportToString(sampleCoverageSummary.total, "TITLE");
        expect(res.length).toEqual(248)
    });
});
