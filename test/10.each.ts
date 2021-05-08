#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {all, JGSMColumns as C} from "../";

const FILE = __filename.split("/").pop();

describe(FILE, () => {
	let totalRows = 0;

	const isValid = (row: string[]) => (+row[C.都道府県市区町村コード] && +row[C.基準メッシュコード]);

	it("each first time", function () {
		this.timeout(600000);

		let validRows = 0;
		const each = (row: string[]) => {
			totalRows++;

			if (isValid(row)) validRows++;

			// break
			row.shift();
		};

		const option = {progress: console.warn, each: each};
		return all(option).then(rows => {
			assert.ok(!rows, "result should not be returned when each() given");
			assert.ok(totalRows);
			assert.equal(validRows, totalRows);
		});
	});

	it("each second time", function () {
		let validRows = 0;
		const prefIndex = {} as { [id: string]: number };
		const each = (row: string[]) => {
			if (isValid(row)) validRows++;

			prefIndex[((+row[C.都道府県市区町村コード]) / 1000) | 0] = 1;

			// break
			row.shift();
		};

		const option = {progress: console.warn, each: each};
		return all(option).then(rows => {
			assert.ok(!rows, "result should not be returned when each() given");
			assert.equal(validRows, totalRows);
			assert.equal(Object.keys(prefIndex).length, 47);
		});
	});
});
