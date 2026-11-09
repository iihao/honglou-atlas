# 推广手册 · 红楼梦图谱

目标：让「读过红楼 / 做数字人文 / 喜欢可视化」的人看到它，并把看到的人转成 Star。
Star 的三个来源：**首页视觉冲击**、**可立刻上手的在线 Demo**、**社区里的一次有效曝光**。

## 一、已就绪的转化要素

- [x] README 首屏：截图 + 在线体验按钮 + 一句话定位 + Star 引导
- [x] 在线 Demo：https://iihao.github.io/honglou-atlas/（手机可用）
- [x] MIT 许可、贡献指南、数据可复现（一条命令重建）
- [x] GitHub topics / description（可被站内搜索命中）
- [ ] 社交预览图（Settings → Social preview 上传 docs/screenshot-graph.png，1280×640 裁切）

## 二、首发文案（可直接复制）

### 小红书（图 > 字，配 3–5 张截图）

**标题**：把《红楼梦》四百多号人做成了一张可以点的图

**正文**：
读红楼最痛苦的是什么？人物太多、关系太乱、看到后面忘了前面。

我把它做成了一个网页：
🔴 荣宁两府、四大家族，谁是谁家的人一眼看清
🔴 谁袭了爵、谁是嫡出庶出、谁住哪个院，全都标在谱系上
🔴 点一个人，他的判词、脂评、结局、相关事件全都出来
🔴 点一条线，能看到这两个人是什么关系、一起经历过什么
🔴 搜「蕉下客」也能直接定位到探春

纯网页，不用注册不用下载，手机也能开：
https://iihao.github.io/honglou-atlas/

开源在 GitHub，搜「红楼梦图谱」就能找到，喜欢的话点个 star ⭐

#红楼梦 #紅樓夢 #数据可视化 #数字人文 #读书笔记 #古典文学

### 知乎（回答「有哪些有意思的红楼梦数据可视化？」类问题）

做了一张《红楼梦》人物关系图谱，零依赖、纯静态，可以直接在浏览器里打开：
https://iihao.github.io/honglou-atlas/

几个自己比较满意的点：
1. **谱系不是简单的树**：标了排行、嫡庶、房分（长房/二房），袭爵的人有专门角标。贾赦袭爵却是二房掌家，这种细节在图上一眼能看出来。
2. **关系有权重**：宝玉和探春首先是同父异母兄妹，其次才是诗社发起人、诗社同人。同一对人多重关系只画一根线，取权重最高的那条，其余在卡片里并列。
3. **点线也能看内容**：点一条连线，会告诉你这两个人是什么关系、有没有共同出场的事件、判词里有没有交集。
4. **数据可复现**：`python3 tools/build_seed.py && python3 db/init_db.py --force`，SQLite + 标准库，没有任何 npm 依赖。

项目 MIT 开源：https://github.com/iihao/honglou-atlas

### V2EX（分享创造节点）

**标题**：做了个《红楼梦》人物关系图谱，纯静态零依赖

**正文**：
最近在读红楼，人物太多记不住，就顺手做了个可视化。

- 173 个人物、870 条关系、50 个谱系节点
- 关系分亲缘 / 情缘 / 主仆 / 同人 / 事件五类，跨族连线默认隐藏
- 点节点看词条（简介、判词、脂评、结局），点连线看两人关系与共同事件
- 前端原生 JS，后端 Python 标准库，数据在 SQLite，一条命令重建
- 部署在 GitHub Pages，手机端适配过

在线：https://iihao.github.io/honglou-atlas/
源码：https://github.com/iihao/honglou-atlas

欢迎提意见，尤其是红学细节上的错误。

### X / Twitter（英文，配 GIF 更好）

Built an interactive atlas of *Dream of the Red Chamber*: 173 characters, 870 relations, genealogy with 嫡/庶 & 爵位, and clickable poems/fates.

Zero dependencies. Static. MIT.

https://iihao.github.io/honglou-atlas/

#DigitalHumanities #ChineseLiterature #Dataviz #Hongloumeng

### Hacker News（Show HN）

**Title**: Show HN: An interactive atlas of Dream of the Red Chamber (zero-dependency, static)

**Body**:
Classical Chinese novels have hundreds of characters and the relationships are the hard part. I built a static site that turns the genealogy + relationship graph of 红楼梦 into something you can click, search and hover.

- 173 characters, 870 typed relations, 51 events, 28 poems
- SQLite as the data source, rebuilt from Python with no third-party deps
- Vanilla JS frontend, deployed as plain files (no server)
- Relation weights: sibling > marriage > servant > poetry club > event

https://iihao.github.io/honglou-atlas/

Happy to hear feedback on the data model or the layout algorithm.

### 豆瓣「红楼梦」小组 / 古典文学小组

标题：做了一个红楼梦人物关系图谱，欢迎挑错

正文：同上 V2EX 版本，强调「红学细节欢迎指正」，社区对考据错误最敏感，姿态放低。

## 三、渠道优先级与节奏

| 优先级 | 渠道 | 预期 | 备注 |
|---|---|---|---|
| P0 | 小红书 | 流量最大，图文化 | 3–5 张图，首图必须是关系图 |
| P0 | 知乎 | 长尾搜索 | 回答现成问题，别自问自答 |
| P1 | V2EX 分享创造 | 技术人群，Star 转化高 | 工作日 10:00–11:00 发 |
| P1 | 豆瓣红楼小组 | 精准用户 | 强调欢迎考据 |
| P2 | X / HN | 海外数字人文 | 英文，配 GIF |
| P2 | 即刻 / 少数派 Matrix | 泛文化人群 | 讲「做这件事的过程」 |

**节奏**：一次只发一个渠道，观察 24 小时的评论，改进后再发下一个。
首发后 48 小时内回复所有评论——GitHub 的 star 曲线和「作者是否回复」强相关。

## 四、可持续的曝光（比一次性发帖更重要）

1. **awesome 列表 PR**（一次合并，长期带量）
   - awesome-digital-humanities
   - awesome-chinese
   - awesome-dataviz
   - awesome-history
   搜索 `awesome + <关键词>`，找有 1k+ star、最近三个月有合并记录的仓库，按其 CONTRIBUTING 提 PR。
2. **周刊投稿**：HelloGitHub、GitHubDaily、阮一峰《科技爱好者周刊》、DataViz Weekly。
3. **Release**：打 tag `v1.0.0` 并写清更新点，Release 页面本身会被搜索引擎收录。
4. **持续提交**：GitHub 推荐与 trending 都看最近活跃度，半个月一次有内容的小更新比一次性爆发更有效。
5. **Issue 模板 + Discussions**：让「发现错别字/考据错误」的人有地方说话，讨论区活跃会提高仓库权重。

## 五、可以再做的高转化素材（待办）

- [ ] 15 秒录屏 GIF：搜索「蕉下客」→ 定位探春 → 点线看关系（放在 README 顶部）
- [ ] 一页「数据说明」：每个数字的来源与统计口径（红学读者最在意可信度）
- [ ] 英文 README 同步更新截图
- [ ] 社交预览图 1280×640
