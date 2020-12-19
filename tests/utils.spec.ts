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
    })
})
