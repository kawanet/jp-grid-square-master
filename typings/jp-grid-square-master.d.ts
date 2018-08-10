declare type Row = string[];
interface PaserOption {
    each?(row: Row): any;
    endpoint?: string;
    progress?(message: any): void;
    suffix?: string;
    tmpdir?: string;
}
export declare function all(option?: PaserOption): Promise<Row[]>;
export {};
