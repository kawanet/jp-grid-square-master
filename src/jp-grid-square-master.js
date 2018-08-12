"use strict";
// parser.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const fs = require("fs");
const iconv = require("iconv-lite");
const promisen = require("promisen");
const ENDPOINT = "http://www.stat.go.jp/data/mesh/csv/";
const CSV_SUFFIX = ".csv";
const NAMES = [
    "01-1", "01-2", "01-3", "02", "03", "04", "05", "06", "07", "08", "09",
    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
    "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
    "40", "41", "42", "43", "44", "45", "46", "47"
];
const readFile = promisen.denodeify(fs.readFile.bind(fs));
const writeFile = promisen.denodeify(fs.writeFile.bind(fs));
const access = promisen.denodeify(fs.access.bind(fs));
const mkdir = promisen.denodeify(fs.mkdir.bind(fs));
const DATA_DIR = __dirname.replace(/[^\/]*\/*$/, "data/");
let cache;
const copyRow = row => row.slice();
function all(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options)
            options = {};
        let each = options.each;
        let result;
        const progress = options.progress;
        const buffer = [];
        let idx = 0;
        if (!each) {
            result = [];
            each = row => result.push(row);
        }
        if (!cache) {
            // first time
            yield next();
            cache = buffer;
        }
        else {
            // cache available
            cache.forEach(row => each(copyRow(row)));
        }
        return result;
        function next() {
            return __awaiter(this, void 0, void 0, function* () {
                const name = NAMES[idx++];
                if (!name)
                    return;
                const binary = yield loadFile(name);
                const data = iconv.decode(binary, "CP932");
                data.split(/\r?\n/).forEach(eachLine);
                return next();
            });
        }
        function eachLine(line) {
            const row = line.split(",").map(col => col.replace(/^"(.*)"$/, "$1"));
            if (!(+row[0]))
                return;
            buffer.push(row);
            each(copyRow(row));
        }
        function loadFile(name) {
            const file = DATA_DIR + name + CSV_SUFFIX;
            const url = ENDPOINT + name + CSV_SUFFIX;
            // check whether local cache file available
            return access(file).then(fromLocal, fromRemote);
            // read from local cache
            function fromLocal() {
                if (progress)
                    progress("reading: " + file);
                return readFile(file);
            }
            // fetch from remote
            function fromRemote() {
                return __awaiter(this, void 0, void 0, function* () {
                    // fetch CSV file from remote
                    if (progress)
                        progress("loading: " + url);
                    const res = yield axios_1.default.get(url, { responseType: "arraybuffer" });
                    const data = res.data;
                    // check whether local cache directory exists
                    yield access(DATA_DIR).catch(() => {
                        if (progress)
                            progress("mkdir: " + DATA_DIR);
                        return mkdir(DATA_DIR);
                    });
                    // save to local cache file
                    progress("writing: " + file + " (" + data.length + " bytes)");
                    yield writeFile(file, data);
                    return data;
                });
            }
        }
    });
}
exports.all = all;
