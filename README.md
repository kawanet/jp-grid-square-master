# Japan Basic Grid Square Master CSV Data Parser

[![Node.js CI](https://github.com/kawanet/jp-grid-square-master/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/kawanet/jp-grid-square-master/actions/)
[![npm version](https://badge.fury.io/js/jp-grid-square-master.svg)](https://badge.fury.io/js/jp-grid-square-master)

### Synopsis

```js
const GridMaster = require("jp-grid-square-master");

const option = {progress: console.warn};

GridMaster.all(option).then(rows => {
    rows.slice(0, 10).forEach(row => {
        const city = row[0];
        const name = row[1];
        const mesh = row[2];
        console.warn(city, name, mesh);
        // do something
    });
});
```

See TypeScript declaration
[jp-grid-square-master.d.ts](https://github.com/kawanet/jp-grid-square-master/blob/master/typings/jp-grid-square-master.d.ts)
for more details.

### Format

`all()` method returns `string[][]` which contains the following table:

|都道府県市区町村コード|市区町村名|基準メッシュコード|備考|
|---|---|---|---|
|01101|札幌市中央区|64413290||
|01101|札幌市中央区|64413291||
|01101|札幌市中央区|64414108||
|01101|札幌市中央区|64414109||
|01101|札幌市中央区|64414116||
|47382|八重山郡与那国町|36235052||
|47382|八重山郡与那国町|36235053||
|47382|八重山郡与那国町|36235060||
|47382|八重山郡与那国町|36235061||
|47382|八重山郡与那国町|36235062||

### Row-by-Row

`all()` method accepts `each` option to execute something for each row.

```js
await GridMaster.all({
    progress: console.warn,
    each: ([city, name, mesh]) => {
        // do something
    }
});
```

### GitHub

- https://github.com/kawanet/jp-grid-square-master

### See Also

- https://www.stat.go.jp/english/data/mesh/05-1s.html
- https://www.stat.go.jp/data/mesh/m_itiran.html
- https://kikakurui.com/x0/X0402-2010-01.html
- https://github.com/jp-mirror/jp-data-mesh-csv
- https://www.npmjs.com/package/jp-pref-lookup
- https://www.npmjs.com/package/jp-city-lookup

### The MIT License (MIT)

Copyright (c) 2018-2023 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
