```table cols="1,1,1,1" header-rows=1 header-cols=1
| Category
| Item
| Price
| Description

| くすり
| やくそう
| 10G
| たべるとたいりょくをすこしかいふくする

| つるぎ
| てつのつるぎ
| 1000G
| ここに少し長めの文章を書きたくなったとします。(X)

  このようにセルの開始ブロック (X) と同等のインデントを入れることで、  
  セル内のブロックを継続することができます。
  
  基本的な考え方はリストと同じで、マーカー文字幅 W とその後ろの空白幅 N に対して
  先頭に W+N 文字あるブロックは同一ブロックと見なします。

  このように段落以外の文法も使えます。

  - 123
  - 456
  - 789

  ~~~rust
  // use different marker than ``` here
  println!("Hello World!);
  ~~~

  | a | b | c |
  |---|---|---|
  | 1 | 2 | 3 |
  | 4 | 5 | 6 |

    この段落はインデントが4spですが、相対値は +2 なので、普通の段落として扱います

        この段落はインデントが8spで、相対値が +6 なので indented code block です

この段落はインデントが 0sp で、相対値は -2 です。本来は文法違反ですが、テーブルパーサは次のセル開始文字を探すので実は大丈夫だったりします。

c2r2| この行はセル開始行です。

    セル開始行は必ずしも | から始まりません。セル開始文字 | の先頭には列指定子が使えます。ブロック要素は、次の行が [有効な列指定子 + ] 区切り記号 |  から始まる場合まで続きます。

| 90G
| 木の板にどうぶつのかわをはったもの

| 180G
| 鉄でできたたて。かたい。


| 行を表す空行は見やすさのために設置するもので、必ずしも必要ではありません。

| このように書いても解析できますが

| みにくいだけなのでやめましょう。

| 1行の列数は `cols` で指定しますが、指定しなくても空行で挟まれたセル数を数えて推測できます。計算は複雑ですが。
```



```table format=csv
1,2,3
4,5,6
7,8,**9**
```