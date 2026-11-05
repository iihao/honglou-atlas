# 参与贡献

欢迎补充人物、关系、判词、事件与地点。数据是纯文本（Python 结构），不需要数据库基础。

## 环境

- Python 3.8+（仅标准库）
- Node 18+（可选，只用来 `node --check` 校验前端语法）

## 工作流

```bash
git clone https://github.com/iihao/honglou-atlas.git
cd honglou-atlas
python3 tools/build_seed.py      # 生成 db/seed.json
python3 db/init_db.py --force    # 重建 SQLite
./start.sh                       # http://127.0.0.1:8600
```

改完数据后**两个命令都要重跑**，否则页面看到的还是旧库。

## 数据在哪

| 文件 | 内容 |
|---|---|
| `tools/build_seed.py` | 主体：人物、关系、谱系、判词、事件、回目 |
| `tools/enrich_data.py` | 富化：长文详述、别名、额外人物/事件/诗词、参考来源 |

## 新增人物

```python
person("pl-xxx", "姓名", alias="别号", family="rong", role="主子",
       summary="一句话提要。",
       detail="详细叙述，可分段落，用 \\n\\n 分隔。",
       tags=["标签"])
```

- `family` 用已有家族 id：`rong` `ning` `shi` `wang` `xue` `lin` `other`
- `role` 用：`主子` `妾室` `丫鬟` `仆役` `小厮` `清客` `僧道` `外人` `亲戚`
- 新人物请同时在 `EXTRA` 里补至少一条关系，否则会成为孤立节点

## 新增关系

```python
EXTRA = [
    ("pl-a", "pl-b", "父子"),   # a → b
]
```

关系**方向有意义**：`父子` 表示 a 是父、b 是子；前端在 b 的页面会自动显示成「父」。
常用标签：`父子 父女 母子 母女 夫妻 妾室 祖孙 兄弟 姐妹 主仆 陪房 小厮 知己 情人 师徒 镜像`

## 新增事件

```python
("ev-xxx", "事件名", "第X回", "一句话提要", "详细经过。")
```

并在 `EVENT_CAST` 里列出出场人物；未列的人会由构建脚本按正文自动补「涉及」关系。

## 新增谱系

在 `GENEALOGY` 里加一行：

```python
("pl-id", "显示名\n（说明）", "父id", "配偶id", 世代, "家族id"),
```

世代从 1 开始。配偶不必在本家族谱系里，只要词条存在即可。

## 提交前自检

```bash
python3 - <<'PY'
import json, collections
d = json.load(open('db/seed.json', encoding='utf-8'))
ids = [i['id'] for i in d['items']]
assert len(ids) == len(set(ids)), '重复 id'
idset = set(ids)
assert not [r for r in d['relations'] if r['a'] not in idset or r['b'] not in idset], '悬空关系'
assert not [g for g in d['genealogy'] if g['id'] not in idset], '谱系悬空'
print('OK', len(ids), '条目')
PY
node --check js/app.js
```

CI 也会跑同样的检查，并通过 `tools/build_static.py` 验证静态构建。

## 内容规范

- 判词、诗词取通行本（程乙本为主）文字，节选标注「节选」
- 有争议的结局写「一说」「探佚」，不要写成定论
- 参考来源写进 `refs`，优先原典回目 + 《红楼梦大辞典》
- 不要复制受版权保护的现代译注长文
