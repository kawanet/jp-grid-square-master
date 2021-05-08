#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {all, JGSMColumns as C} from "../";

const FILE = __filename.split("/").pop();

describe(FILE, () => {
    let totalRows: number;

    const isValid = (row: string[]) => (+row[C.都道府県市区町村コード] && +row[C.基準メッシュコード]);

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
