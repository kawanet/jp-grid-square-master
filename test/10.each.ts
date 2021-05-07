#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {all} from "../";

const FILE = __filename.split("/").pop();

describe(FILE, () => {
	let totalRows = 0;

	const isValid = row => (+row[0] && +row[2]);

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
		const prefIndex = {};
		const each = (row: string[]) => {
			if (isValid(row)) validRows++;

			prefIndex[((+row[0]) / 1000) | 0] = 1;

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
