
# markdown-it-adv-table

A [markdown-it](https://www.npmjs.com/package/markdown-it) plugin for advanced table rendering. 

This plugin adds custom table syntax to render complex tables easier. 

The "flat-table" syntax allows to:

- Set Rowspan and colspan for spanning cells
- Set column width
- Set horizontal text alignment
- Set css classes for table styling
- Define Header rows and columns
- Allow writing markdown inside the cells (nested document)

## Installation

```bash
npm install markdown-it-adv-table
```

```js 
import markdownit from "markdown-it";
import advTable from "markdown-it-adv-table";

const md = markdownit();
md.use(advTable);
const html = md.render("text...");
```


## Example

``````
```table cols=4 header-rows=2 header-cols=1
r2| Category
c3| Q1 Sales

| January
| February
| March

| Electronics
| $10,000
| $12,000
| $11,500

| Clothing
| $8,000
| $9,500
| $9,000

| Books
| $3,500
| $4,000
| $4,200
```
``````

<table>
  <thead>
    <tr>
      <th rowspan="2">Category</th>
      <th colspan="3">Q1 Sales</th>
    </tr>
    <tr>
      <th>January</th>
      <th>February</th>
      <th>March</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Electronics</th>
      <td>$10,000</td>
      <td>$12,000</td>
      <td>$11,500</td>
    </tr>
    <tr>
      <th>Clothing</th>
      <td>$8,000</td>
      <td>$9,500</td>
      <td>$9,000</td>
    </tr>
    <tr>
      <th>Books</th>
      <td>$3,500</td>
      <td>$4,000</td>
      <td>$4,200</td>
    </tr>
  </tbody>
</table>




## Documentation

The table is expressed in a fenced code block. 

- A line that starts with `|` starts a new cell.
- The cell content is parsed as Markdown.
- The cell content spans until the next cell marker.

A cell marker can include directives that control the cell’s properties.


### TableSpec (Table Definition)

The [info-string](https://spec.commonmark.org/0.31.2/#info-string) of the fenced code block is parsed as TableSpec.

<table>
<tr>
    <th>Key</th>
    <th>Type</th>
    <th>Value</th>
</tr>
<tr>
    <td>cols</td>
    <td>number | string</td>
    <td>
        <p>Define number of columns.</p>
        <p>If the value is a string literal, it is a <a href="#colspec"><code>ColSpec</code></a>.</p>
        <pre>cols=3           // 3 columns
cols="1,1,2"     // 3 columns, 1:1:2 ratio</pre>
  </td>
</tr>
<tr>
    <td>header-cols</td>
    <td>number</td>
  <td>Number of header columns (rendered as &lt;th&gt;)</td>
</tr>
<tr>
    <td>header-rows</td>
    <td>number</td>
  <td>Number of header rows (rendered as &lt;thead&gt; with &lt;th&gt;)</td>
</tr>
<tr>
    <td>class</td>
    <td>string</td>
  <td>Table class names (space- or comma-separated)</td>
</tr>
<tr>
    <td>width</td>
    <td>number | string</td>
  <td>Table width.</td>
</tr>
<tr>
    <td>format</td>
    <td>string</td>
    <td>
        <p>Use alternative table syntax. </p>
        <ul>
            <li><code>csv</code> : parse text as csv</li>
            <li><code>tsv</code> : parse text as tsv</li>
        </ul>
    </td>
</tr>
</table>

<h3 id="colspec">ColSpec (Column Definition)</h3>

<code>ColSpec</code> is a comma-separated set-of-directives to control the column's properties.

    "1,1,1"            3 columns, 1:1:1 ratio
    "30%,15,30,60"     4 columns, 3:1:2:4 ratio
    "<100px,,>25%"     3 columns, 100px-auto-25% with alignment directives

<table>
<tr>
    <th>Directive</th>
    <th>Description</th>
</tr>
<tr>
    <td>size[unit]</td>
    <td>
        <p>Set column width.  Any css units can be used.</p>
        <p>If the unit is omitted, the value represents the weight of the column. The plugin calculates the column width by dividing up the remaining space, based on its weight.</p>
        <pre>"1,1,2"     = "25%,25%,50%"       (Eq = calc(100% * x / 4))
"20%,1,1,2" = "20%,20%,20%,40%"   (Eq = calc( 80% * x / 4))</pre>
        <p>If the size is empty or invalid, the width is unset. The weight of the unsized(auto) column defaults to 1.</p>
        <p><small>NOTE: The actual width is calculated by the HTML engine, respecting the column's minimum content width.</small></p>
    </td>
</tr>
<tr>
    <td>&lt;<br>^<br>&gt;</td>
    <td>
    Left-aligned<br>
    Center-aligned<br>
    Right-aligned<br>
    </td>
</tr>
</table>



### Cell Directives (Cell Definition)

<table>
<tr>
    <th>Syntax</th>
    <th>Description</th>
</tr>
<tr>
    <td>c2, c{\d+}</td>
    <td>Set colspan</td>
</tr>
<tr>
    <td>r2, r{\d+}</td>
    <td>Set rowspan</td>
</tr>
<tr>
    <td>&lt;<br>^<br>&gt;</td>
    <td>Left align<br>Center align<br>Right align</td>
</tr>
<tr>
    <td>h</td>
  <td>Use &lt;th&gt; instead of &lt;td&gt;</td>
</tr>
</table>



## More Examples


``````
```table cols="12,12,12,64" header-rows=1 class=products-list
^| Category
^| Item Name
^| Price
^| Description

r3| Fruits
| Apple
>| $1.00 
| A smooth, round fruit with shiny red skin.

| Banana
>| $0.50
| A long, curved fruit with yellow peel

| Orange
>| $0.80
| A round fruit with dimpled bright orange rind

  **Country of origin**

  1. Brazil
  2. India
  3. China

  | Nutrient  | Per 100 g  |
  |-----------|------------|
  | Calories  |  47 kcal   |
  | Vitamin C |  53.2 mg   |
  | Sugar     |   9.0 g    |
```
``````

<table class="products-list">
  <colgroup>
    <col style="width: 12%">
    <col style="width: 12%">
    <col style="width: 12%">
    <col style="width: 64%">
  </colgroup>
  <thead>
    <tr>
      <th style="text-align: center">Category</th>
      <th style="text-align: center">Item Name</th>
      <th style="text-align: center">Price</th>
      <th style="text-align: center">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3">Fruits</td>
      <td>Apple</td>
      <td style="text-align: right">$1.00</td>
      <td>A smooth, round fruit with shiny red skin.</td>
    </tr>
    <tr>
      <td>Banana</td>
      <td style="text-align: right">$0.50</td>
      <td>A long, curved fruit with yellow peel</td>
    </tr>
    <tr>
      <td>Orange</td>
      <td style="text-align: right">$0.80</td>
      <td>
        <p>A round fruit with dimpled bright orange rind</p>
        <p><strong>Country of origin</strong></p>
        <ol>
          <li>Brazil</li>
          <li>India</li>
          <li>China</li>
        </ol>
        <table>
          <thead>
            <tr>
              <th>Nutrient</th>
              <th>Per 100 g</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Calories</td>
              <td>47 kcal</td>
            </tr>
            <tr>
              <td>Vitamin C</td>
              <td>53.2 mg</td>
            </tr>
            <tr>
              <td>Sugar</td>
              <td>9.0 g</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>