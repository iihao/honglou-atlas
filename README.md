# 红楼梦图谱 · Dream of the Red Chamber Atlas

<p align="center">
  <img src="docs/demo.gif" alt="红楼梦图谱：搜索「蕉下客」定位探春，点连线看宝玉与探春的关系" width="820">
</p>

<p align="center">
  <a href="https://iihao.github.io/honglou-atlas/"><b>▶ 在线体验（免安装）</b></a>
  &nbsp;·&nbsp;
  <a href="README.en.md">English</a>
  &nbsp;·&nbsp;
  <img src="https://img.shields.io/github/license/iihao/honglou-atlas" alt="license">
  <img src="https://img.shields.io/github/last-commit/iihao/honglou-atlas" alt="last commit">
  <a href="https://github.com/iihao/honglou-atlas/stargazers"><img src="https://img.shields.io/github/stars/iihao/honglou-atlas?style=social" alt="stars"></a>
  <a href="https://github.com/iihao/honglou-atlas/graphs/traffic"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fiihao%2Fdevcheck%2Fmain%2Fmetrics%2Fbadges%2Fhonglou-atlas-visitors.json" alt="visitors"></a>
</p>

> 把《红楼梦》的人物、谱系、判词、事件与地点做成一张可以点、可以搜、可以顺着关系走的图。
> 纯静态、无需后端、手机可用；数据全部结构化为 SQLite，前端零依赖。

**如果这个项目对你有帮助，点一个 ⭐ Star 是最好的支持。**

<details>
<summary>更多截图</summary>

![人物关系图谱](docs/screenshot-graph.png)
![荣国府谱系](docs/screenshot-lineage.png)

</details>

## 运行

```bash
python3 tools/build_seed.py      # 由 tools/ 下的数据生成 db/seed.json
python3 db/init_db.py --force    # 由 seed.json 重建 SQLite
python3 server/app.py            # http://127.0.0.1:8600
```

打开 `http://127.0.0.1:8600`，不要直接双击 `index.html`。

## 内容

- **人物 173 条**：主子、妾室、丫鬟、仆役、小厮、清客、僧道、外人，含四大家族、贾府旁支与宁荣两府仆役网络。
- **谱系图注明爵位与身份**：每个节点标出排行（嫡长子 / 庶次女…）、爵位官职（袭荣国公 / 工部员外郎…）、
  房分（长房 / 二房 / 旁支）；承袭爵位者加「爵」角标，嫡出右侧朱条、庶出青灰条，兄弟姊妹按长幼自左向右排列。
- **关系 870 条**：带标签（父子/母女/夫妻/主仆/知己/镜像/魇魔法…），详情页自动把反向关系显示成对应称谓（如宝玉页面显示「父」而非「父子」）。
- **图谱内搜索**：输入姓名或别号（如「蕉下客」）回车，自动恢复全量筛选、居中放大并把该点位闪烁标出。
- **多重关系按权重取主关系**：同一对人物可能既是兄妹又是诗社同人，图上只画一根线并显示权重最高的一条（血缘 > 婚姻 > 主仆 > 诗社发起/社长 > 诗社同人 > 事件关联），其余在关系卡里以「同一对人物另有」并列。
- **地点 29 条**：大观园诸院落、贾府府邸、寺观、外宅等。
- **事件 51 条**：按回次排列，附出场人物与相关回目。
- **回目 64 条**：关键回目提要，与事件双向关联。
- **判词 15 条、诗词 28 条**：判词、十二支曲、葬花吟、芙蓉女儿诔等。
- **隐语 34 条**：谐音、拆字、反语与会意——甄士隐=真事隐、贾雨村=假语村言、元迎探惜=原应叹息、
  单聘仁=善骗人、戴权=带权……每条注明回目与“通行 / 一说 / 存疑”。
- **谶语 → 结局对照 16 条**：判词原文、所谶之事、书中结局、判定（前八十回已应验 / 程高本续书收束 / 诸说存疑），
  存疑条目附学界异说（如黛玉之死的“挂”“埋”之争、熙凤“一从二令三人木”的解法）。
- **府邸示意图**：宁荣二府与大观园的相对方位（街东宁府、街西荣府、园在荣府东北）。
  26 处院落以工笔符号绘制（朱顶为贾母、贾政、凤姐等主子居所，青灰顶为附属与客房），
  标注主人并可跳转词条；另有府墙瓦垄、沁芳溪水系、府门石狮、街面铺装与方向标。
  草木只画书里写过的（潇湘馆竹、栊翠庵松、稻香村杏、紫菱洲柳、蘅芜苑藤、怡红院芭蕉、会芳园梅），
  每处院落附书中文依据，无法可靠定位的景点单独列为“未定位”。
- **谱系 50 个节点**：含 4 个“名佚补位”节点，修正林家、王家、薛家、史家的世系与婚姻关系。
- **参考来源**：360 个词条均附来源，共 820 余条来源项；其中 44 个重点词条附维基百科、百度百科外链（共 88 条）。

## 交互

- **关系图**：连线按亲缘 / 情缘 / 主仆 / 同人 / 事件分类着色（实线、虚线区分），金圈人物有判词。
- **点人物**：弹出简介、谶语（判词原文与释义）、脂评（脂批）、结局，以及关系网与关联事件。
- **点连线**：弹出两人关系（含反向称谓）与两人共同出场/涉及的事件，可继续跳到判词或事件。
- **隐语一栏**：可切换“谐音 · 反语”与“谶语 · 结局对照”，后者按判定统计条数，读的是“预言兑现到什么程度”。
- **府邸一栏**：可只看荣国府 / 宁国府 / 大观园；点院落看主人，图下逐条列出依据回目。

## 数据与来源

`tools/enrich_data.py` 是词条富化数据层，`tools/lore_data.py` 存放谐音、谶语对照与府邸示意图数据，
`tools/build_seed.py` 负责合并、去重、补关系与生成 `db/seed.json`。词条文字为项目自撰，参考了：

- 《红楼梦》（庚辰本、程乙本）回目与原文；
- 冯其庸、李希凡主编《红楼梦大辞典》（文化艺术出版社）；
- 中国艺术研究院红楼梦研究所校注本《红楼梦》（人民文学出版社）；
- 蔡义江《红楼梦诗词曲赋鉴赏》（中华书局）；
- 俞平伯《红楼梦辨》、周汝昌《红楼梦新证》、王昆仑《红楼梦人物论》；
- 余英时《红楼梦的两个世界》、张爱玲《红楼梦魇》等研究著作。

对脂批、版本异文、探佚与“秦学”等有争议的内容，词条中均以“一说”“探佚”
“一家之言”等字样标明，不把推测当作定论。

在线参考链接指向维基百科（CC BY-SA 4.0）与百度百科；项目只取事实线索、
自行撰写词条文字，不直接复制百科原文。

## 结构

```
index.html          单页入口
css/style.css       样式
js/app.js           前端逻辑（谱系、关系图、词条、检索）
server/app.py       本地 API 与静态文件服务
db/schema.sql       SQLite schema
db/init_db.py       seed.json → SQLite
db/seed.json        生成的数据
tools/build_seed.py 数据构建脚本
tools/enrich_data.py 词条富化数据
```

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)：新增人物、关系、事件、谱系的写法与提交前自检。

## 许可

代码以 **MIT** 许可开源，见 [LICENSE](LICENSE)。

《红楼梦》原文已进入公有领域；本库的提要、评析、结构数据为项目自撰，
判词、诗词取通行本文字（程乙本为主），参考书目见各条目 `refs` 字段。

## 参与

- 数据在 `tools/build_seed.py` 与 `tools/enrich_data.py`，改完重建即可：
  ```bash
  python3 tools/build_seed.py && python3 db/init_db.py --force
  ```
- 新增人物请同时补关系与谱系；事件请补 `cast`，不要只写正文。
- 提交前建议跑一遍：`python3 -c "import json;json.load(open('db/seed.json'))"` 确认格式。

## 支持这个项目

如果它帮你省下了翻书查人的时间，点一个 **⭐ Star** 能让更多读红楼的人看到它。

- 把它分享给一个正在读原著的朋友
- 发现人物、判词或脂评有误，提一个 Issue
- 想补充数据（人物、事件、判词），欢迎 PR，格式见 `CONTRIBUTING.md`
