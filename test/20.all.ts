#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {all} from "../";

const FILE = __filename.split("/").pop();

describe(FILE, () => {
    let totalRows: number;

    const isValid = (row: string[]) => (+row[0] && +row[2]);

    it("all() first time", function () {
        this.timeout(600000);

        const option = {progress: console.warn};
        return all(option).then(rows => {
            assert.ok(rows, "all() should return rows when each not given");

            totalRows = rows.length;
            assert.ok(totalRows);

            assert.equal(rows.filter(isValid).length, totalRows);

            // break
            rows.shift();
            rows.pop();
            rows[0].shift();
        });
    });

    it("all() second time", function () {
        const option = {progress: console.warn};
        return all(option).then(rows => {
            assert.ok(rows, "all() should return rows when each not given");

            assert.equal(rows.length, totalRows);

            assert.equal(rows.filter(isValid).length, totalRows);
        });
    });
});
