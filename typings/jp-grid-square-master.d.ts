/**
 * Japan Basic Grid Square Master CSV Data Parser
 *
 * @see https://github.com/kawanet/jp-grid-square-master
 */

declare const enum JGSMColumns {
    都道府県市区町村コード = 0,
    市区町村名 = 1,
    基準メッシュコード = 2,
    備考 = 3,
}

export declare interface JGSMOptions {
    each?(row: string[]): any;

    progress?(message: any): any;
}

export declare function all(options?: JGSMOptions): Promise<string[][]>;
