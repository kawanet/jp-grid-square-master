// parser.ts

import axios from "axios"
import * as fs from "fs"
import * as iconv from "iconv-lite"
import * as promisen from "promisen"
import {tmpdir} from "os";

type Row = string[];

interface PaserOption
{
	each?(row: Row): any;

	/// "http://www.stat.go.jp/data/mesh/csv/"
	endpoint?: string;

	/// console.warn
	progress?(message: any): void;

	/// ".csv"
	suffix?: string;

	/// os.tmpdir()
	tmpdir?: string;
}

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
const TEMP_DIR = tmpdir() + "/" + PKG_NAME;

let cache: Row[];

export function all(option?: PaserOption): Promise<Row[]> {
	const copyRow = row => row.slice();
	let each = option.each;
	let result: Row[];
	const progress = option.progress;
	const buffer: Row[] = [];

	if (!each) {
		result = [];
		each = row => result.push(row);
	}

	if (cache) {
		return promisen.resolve()
			.then(() => cache.forEach(row => each(copyRow(row))))
			.then(() => result);
	} else {
		return promisen.resolve()
			.then(promisen.eachSeries(NAMES, it))
			.then(() => cache = buffer)
			.then(() => result);
	}

	function it(name: string) {
		return loadFile(name)
			.then(decodeCP932)
			.then(parseCSV)
			.then(rows => rows.forEach(row => {
				buffer.push(row);
				each(copyRow(row));
			}));
	}

	function loadFile(name: string) {
		const endpoint = option.endpoint || ENDPOINT;
		const suffix = option.suffix || CSV_SUFFIX;
		const dir = option.tmpdir || TEMP_DIR;
		const file = dir.replace(/\/*$/, "/") + name + suffix;

		// check whether local cache file available
		return access(file).then(fromLocal, fromRemote);

		// read from local cache when unavailable
		function fromLocal() {
			if (progress) progress("reading: " + file);
			return readFile(file);
		}

		// fetch from remote when cache unavailable
		function fromRemote() {
			const url = endpoint + name + CSV_SUFFIX;
			if (progress) progress("loading: " + url);
			return fetchFile(url).then(data => {
				return saveLocal(data).then(() => data);
			});
		}

		function saveLocal(data) {
			// check whether local cache directory exists
			return access(dir).catch(() => {
				if (progress) progress("mkdir: " + dir);
				return mkdir(dir);
			}).then(() => {
				// save to local cache
				progress("writing: " + file + " (" + data.length + " bytes)");
				return writeFile(file, data);
			});
		}
	}
}

/**
 * fetch CSV file from remote
 */

function fetchFile(url: string) {
	const req = {
		method: "GET",
		url: url,
		responseType: "arraybuffer"
	};

	return axios(req).then(res => res.data);
}

/**
 * decode CP932
 */

function decodeCP932(data): string {
	return iconv.decode(data, "CP932");
}

/**
 * parse CSV file
 */

function parseCSV(data: string): Row[] {
	return data.split(/\r?\n/)
		.filter(line => !!line)
		.map(line => line.split(",")
			.map(col => col.replace(/^"(.*)"/, "$1")) as Row)
		.filter(row => +row[0]);
}
