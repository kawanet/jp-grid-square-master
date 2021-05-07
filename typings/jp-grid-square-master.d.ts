/**
 * Japan Basic Grid Square Master CSV Data Parser
 *
 * @see https://github.com/kawanet/jp-grid-square-master
 */

declare type Row = string[];

export declare interface JGSMOptions {
    each?(row: Row): any;

    progress?(message: any): any;
}

export declare function all(options?: JGSMOptions): Promise<Row[]>;
