declare type Row = string[];
interface JGSMOptions {
    each?(row: Row): any;
    progress?(message: any): any;
}
export declare function all(options?: JGSMOptions): Promise<Row[]>;
export {};
