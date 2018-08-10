"use strict";
// parser.ts
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const fs = require("fs");
const iconv = require("iconv-lite");
const promisen = require("promisen");
const os_1 = require("os");
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
const PKG_NAME = require("../package.json").name;
const TEMP_DIR = os_1.tmpdir() + "/" + PKG_NAME;
let cache;
function all(option) {
    const copyRow = row => row.slice();
    let each = option.each;
    let result;
    const progress = option.progress;
    const buffer = [];
    if (!each) {
        result = [];
        each = row => result.push(row);
    }
    if (cache) {
        return promisen.resolve()
            .then(() => cache.forEach(row => each(copyRow(row))))
            .then(() => result);
    }
    else {
        return promisen.resolve()
            .then(promisen.eachSeries(NAMES, it))
            .then(() => cache = buffer)
            .then(() => result);
    }
    function it(name) {
        return loadFile(name)
            .then(decodeCP932)
            .then(parseCSV)
            .then(rows => rows.forEach(row => {
            buffer.push(row);
            each(copyRow(row));
        }));
    }
    function loadFile(name) {
        const endpoint = option.endpoint || ENDPOINT;
        const suffix = option.suffix || CSV_SUFFIX;
        const dir = option.tmpdir || TEMP_DIR;
        const file = dir.replace(/\/*$/, "/") + name + suffix;
        // check whether local cache file available
        return access(file).then(fromLocal, fromRemote);
        // read from local cache when unavailable
        function fromLocal() {
            if (progress)
                progress("reading: " + file);
            return readFile(file);
        }
        // fetch from remote when cache unavailable
        function fromRemote() {
            const url = endpoint + name + CSV_SUFFIX;
            if (progress)
                progress("loading: " + url);
            return fetchFile(url).then(data => {
                return saveLocal(data).then(() => data);
            });
        }
        function saveLocal(data) {
            // check whether local cache directory exists
            return access(dir).catch(() => {
                if (progress)
                    progress("mkdir: " + dir);
                return mkdir(dir);
            }).then(() => {
                // save to local cache
                progress("writing: " + file + " (" + data.length + " bytes)");
                return writeFile(file, data);
            });
        }
    }
}
exports.all = all;
/**
 * fetch CSV file from remote
 */
function fetchFile(url) {
    const req = {
        method: "GET",
        url: url,
        responseType: "arraybuffer"
    };
    return axios_1.default(req).then(res => res.data);
}
/**
 * decode CP932
 */
function decodeCP932(data) {
    return iconv.decode(data, "CP932");
}
/**
 * parse CSV file
 */
function parseCSV(data) {
    return data.split(/\r?\n/)
        .filter(line => !!line)
        .map(line => line.split(",")
        .map(col => col.replace(/^"(.*)"/, "$1")))
        .filter(row => +row[0]);
}
