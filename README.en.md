# Honglou Atlas · Dream of the Red Chamber

A structured, searchable atlas of *Dream of the Red Chamber* (红楼梦): family trees, a character
relationship graph, the twelve beauties' fates (判词), poems, 51 plot events and 29 locations.

**Live demo:** https://iihao.github.io/honglou-atlas/
**中文说明:** [README.md](README.md)

## What's inside

| Category | Count |
|---|---:|
| Characters | 173 |
| Relations (labelled) | 829 |
| Genealogy nodes | 49 (five clans + servants) |
| Fates / poems | 14 / 28 |
| Events / chapters / places | 51 / 64 / 29 |

## Features

- **Genealogy** (`#lineage`): generation-by-generation trees for the Jia (Ning & Rong), Shi, Wang,
  Xue and Lin clans; spouses linked by dashed lines; unknown-name nodes are auto-generated.
- **Relationship graph** (`#graph`): graph **or list** view — the list groups every relation by kinship /
  service / romance / friendship, searchable and clickable; fullscreen mode (`F` to toggle, `ESC` to exit, floating toolbar for
  zoom); clustered layout by clan × master/servant, with optional event nodes; filters for kinship /
  service / romance / friendship; labels on hover.
- **Events**: every character page lists related events, split into *appears* (curated) and
  *mentioned* (auto-matched from event text).
- Works offline; runs on SQLite + Python standard library with a zero-dependency frontend.

## Quick start

```bash
python3 tools/build_seed.py     # build db/seed.json
python3 db/init_db.py --force   # build db/honglou.db
./start.sh                      # http://127.0.0.1:8600
```

Static export (for GitHub Pages / any CDN):

```bash
python3 tools/build_static.py   # -> dist/
```

## License

Code: MIT. The novel itself is in the public domain; summaries and analyses are original to this
project. See [LICENSE](LICENSE) and [CONTRIBUTING.md](CONTRIBUTING.md).
