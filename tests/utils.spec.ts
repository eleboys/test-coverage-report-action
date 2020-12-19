import { addReport } from "../src/utils";

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
})
