"use strict";

import {all} from "../src/jp-grid-square-master";

const assert = require("assert");
const FILE = __filename.split("/").pop();

describe(FILE, () => {
	let totalRows;

	const isValid = row => (+row[0] && +row[2]);

	it("all() first time", function () {
		this.timeout(600000);

		const option = {progress: console.warn};
		return all(option).then(rows => {
			assert(rows, "all() should return rows when each not given");

			totalRows = rows.length;
			assert(totalRows);

			assert.strictEqual(rows.filter(isValid).length, totalRows);

			// break
			rows.shift();
			rows.pop();
			rows[0].shift();
		});
	});

	it("all() second time", function () {
		const option = {progress: console.warn};
		return all(option).then(rows => {
			assert(rows, "all() should return rows when each not given");

			assert.strictEqual(rows.length, totalRows);

			assert.strictEqual(rows.filter(isValid).length, totalRows);
		});
	});
});
