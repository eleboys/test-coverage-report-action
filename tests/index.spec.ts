import { run } from "../src/index";

describe("test index file", () => {
    it("should exist", () => {
        expect(run).toBeTruthy();
    });
});
