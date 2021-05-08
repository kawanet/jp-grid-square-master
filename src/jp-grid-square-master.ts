/**
 * Japan Basic Grid Square Master CSV Data Parser
 *
 * @see https://github.com/kawanet/jp-grid-square-master
 */

import {promises as fs} from "fs"
import * as iconv from "iconv-cp932"
import {dirname, files} from "jp-data-mesh-csv";

import {JGSMColumns as C, JGSMOptions} from "../";

type Row = string[];

let cache: Row[];

const copyRow = <T>(row: T[]) => row.slice();

export async function all(options?: JGSMOptions): Promise<Row[]> {
    if (!options) options = {};
    let {each} = options;
    let result: Row[];
    const {progress} = options;
    const buffer: Row[] = [];

    if (!each) {
        result = [];
        each = row => result.push(row);
    }

    if (!cache) {
        // first time
        await readAll();
        cache = buffer;
    } else {
        // cache available
        cache.forEach(row => each(copyRow(row)));
    }

    return result;

    async function readAll(): Promise<void> {
        for (const name of files) {
            const file = `${dirname}/${name}`;
            if (progress) progress("reading: " + file);
            const binary = await fs.readFile(file);
            const data = iconv.decode(binary);
            data.split(/\r?\n/).forEach(eachLine);
        }
    }

    function eachLine(line: string): void {
        const row: Row = line.split(",").map(col => col.replace(/^"(.*)"$/, "$1"));
        if (!(+row[C.都道府県市区町村コード])) return;
        buffer.push(row);
        each(copyRow(row));
    }
}
