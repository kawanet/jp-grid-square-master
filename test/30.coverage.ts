#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {all, JGSMColumns as C} from "../";

const FILE = __filename.split("/").pop();

describe(FILE, () => {
    it("city coverage", async () => {
        const cityIndex: { [cityId: string]: number } = {};

        await all({
            progress: console.warn,
            each: ((row) => {
                const cityId = row[C.都道府県市区町村コード];
                if (!cityIndex[cityId]) cityIndex[cityId] = 0;
                cityIndex[cityId]++;
            }),
        });

        assert.ok(cityIndex["01101"], "01101"); // 札幌市中央区
        assert.ok(cityIndex["13102"], "13102"); // 東京都中央区
        assert.ok(cityIndex["47201"], "47201"); // 那覇市
    });

    it("pref coverage", async () => {
        const prefIndex: { [prefId: string]: number } = {};

        await all({
            progress: console.warn,
            each: ((row) => {
                const cityId = row[C.都道府県市区町村コード];
                const prefId = cityId?.substring(0, 2);
                if (!prefIndex[prefId]) prefIndex[prefId] = 0;
                prefIndex[prefId]++;
            }),
        });

        for (let i = 1; i < 48; i++) {
            const prefId = (i < 10 ? "0" : "") + String(i);
            assert.ok(prefIndex[prefId] > 0);
        }

        assert.equal(Object.keys(prefIndex).length, 47);
    });
});
