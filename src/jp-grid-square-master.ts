// parser.ts

import axios from "axios"
import * as fs from "fs"
import * as iconv from "iconv-lite"
import * as promisen from "promisen"

type Row = string[];

interface JGSMOptions {
	each?(row: Row): any;

	/// console.warn
	progress?(message: any): any;
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

const DATA_DIR = __dirname.replace(/[^\/]*\/*$/, "data/")

let cache: Row[];

const copyRow = row => row.slice();

export async function all(options?: JGSMOptions): Promise<Row[]> {
	if (!options) options = {};
	let each = options.each;
	let result: Row[];
	const progress = options.progress;
	const buffer: Row[] = [];
	let idx = 0;

	if (!each) {
		result = [];
		each = row => result.push(row);
	}

	if (!cache) {
		// first time
		await next();
		cache = buffer;
	} else {
		// cache available
		cache.forEach(row => each(copyRow(row)));
	}

	return result;

	async function next() {
		const name = NAMES[idx++];
		if (!name) return;
		await parseFile(name);
		return next();
	}

	async function parseFile(name: string) {
		const binary = await loadFile(name);
		const data = iconv.decode(binary, "CP932");
		const rows = parseCSV(data);
		rows.forEach(row => {
			buffer.push(row);
			each(copyRow(row));
		});
	}

	function loadFile(name: string) {
		const file = DATA_DIR + name + CSV_SUFFIX;
		const url = ENDPOINT + name + CSV_SUFFIX;

		// check whether local cache file available
		return access(file).then(fromLocal, fromRemote);

		// read from local cache
		function fromLocal() {
			if (progress) progress("reading: " + file);
			return readFile(file);
		}

		// fetch from remote
		async function fromRemote() {
			// fetch CSV file from remote
			if (progress) progress("loading: " + url);
			const res = await axios.get(url, {responseType: "arraybuffer"});
			const data = res.data;

			// check whether local cache directory exists
			await access(DATA_DIR).catch(() => {
				if (progress) progress("mkdir: " + DATA_DIR);
				return mkdir(DATA_DIR);
			});

			// save to local cache file
			progress("writing: " + file + " (" + data.length + " bytes)");
			await writeFile(file, data);

			return data;
		}
	}
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
