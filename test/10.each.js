"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jp_grid_square_master_1 = require("../src/jp-grid-square-master");
const assert = require("assert");
const FILE = __filename.split("/").pop();
describe(FILE, () => {
    let totalRows = 0;
    const isValid = row => (+row[0] && +row[2]);
    it("each first time", function () {
        this.timeout(600000);
        let validRows = 0;
        const each = (row) => {
            totalRows++;
            if (isValid(row))
                validRows++;
            // break
            row.shift();
        };
        const option = { progress: console.warn, each: each };
        return jp_grid_square_master_1.all(option).then(rows => {
            assert(!rows, "result should not be returned when each() given");
            assert(totalRows);
            assert.strictEqual(validRows, totalRows);
        });
    });
    it("each second time", function () {
        let validRows = 0;
        const prefIndex = {};
        const each = (row) => {
            if (isValid(row))
                validRows++;
            prefIndex[((+row[0]) / 1000) | 0] = 1;
            // break
            row.shift();
        };
        const option = { progress: console.warn, each: each };
        return jp_grid_square_master_1.all(option).then(rows => {
            assert(!rows, "result should not be returned when each() given");
            assert.strictEqual(validRows, totalRows);
            assert.strictEqual(Object.keys(prefIndex).length, 47);
        });
    });
});
