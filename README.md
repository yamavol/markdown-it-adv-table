
# markdown-it-adv-table

A [markdown-it](https://www.npmjs.com/package/markdown-it) plugin to enable advanced table rendering in Markdown. The custom syntax allows to create complex tables supporting:

- Rowspan and colspan for merged cells
- Custom column widths
- Horizontal cell alignment
- Table styling with css classes
- Header rows and columns (using `<th>`)
- Multiple blocks and nested markdown within cells

## Install

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

## Documentation

To Be Documented

## Examples

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