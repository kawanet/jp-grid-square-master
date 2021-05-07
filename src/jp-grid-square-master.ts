/**
 * Japan Basic Grid Square Master CSV Data Parser
 *
 * @see https://github.com/kawanet/jp-grid-square-master
 */

import axios from "axios"
import {promises as fs} from "fs"
import * as iconv from "iconv-lite"
import {JGSMOptions} from "../";

type Row = string[];

const ENDPOINT = "http://www.stat.go.jp/data/mesh/csv/";
const CSV_SUFFIX = ".csv";

const NAMES = [
	"01-1", "01-2", "01-3", "02", "03", "04", "05", "06", "07", "08", "09",
	"10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
	"20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
	"30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
	"40", "41", "42", "43", "44", "45", "46", "47"
];

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
		const binary = await loadFile(name);
		const data = iconv.decode(binary, "CP932");
		data.split(/\r?\n/).forEach(eachLine);
		return next();
	}

	function eachLine(line: string) {
		const row: Row = line.split(",").map(col => col.replace(/^"(.*)"$/, "$1"));
		if (!(+row[0])) return;
		buffer.push(row);
		each(copyRow(row));
	}

	function loadFile(name: string) {
		const file = DATA_DIR + name + CSV_SUFFIX;
		const url = ENDPOINT + name + CSV_SUFFIX;

		// check whether local cache file available
		return fs.access(file).then(fromLocal, fromRemote);

		// read from local cache
		function fromLocal() {
			if (progress) progress("reading: " + file);
			return fs.readFile(file);
		}

		// fetch from remote
		async function fromRemote() {
			// fetch CSV file from remote
			if (progress) progress("loading: " + url);
			const res = await axios.get(url, {responseType: "arraybuffer"});
			const data = res.data;

			// check whether local cache directory exists
			await fs.access(DATA_DIR).catch(() => {
				if (progress) progress("mkdir: " + DATA_DIR);
				return fs.mkdir(DATA_DIR);
			});

			// save to local cache file
			progress("writing: " + file + " (" + data.length + " bytes)");
			await fs.writeFile(file, data);

			return data;
		}
	}
}
