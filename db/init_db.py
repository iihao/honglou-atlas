#!/usr/bin/env python3
"""由 db/seed.json 初始化 SQLite 数据库。

    python3 db/init_db.py            # 首次创建
    python3 db/init_db.py --force    # 删除重建
"""
import argparse
import json
import os
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA = os.path.join(ROOT, "db", "schema.sql")
SEED = os.path.join(ROOT, "db", "seed.json")
DB = os.path.join(ROOT, "db", "honglou.db")


def build(conn, seed):
    with open(SCHEMA, encoding="utf-8") as f:
        conn.executescript(f.read())

    conn.executemany(
        "INSERT INTO families(id,name,color,note,sort) VALUES(?,?,?,?,?)",
        [(f["id"], f["name"], f.get("color"), f.get("note"), i)
         for i, f in enumerate(seed.get("families", []))])
    conn.executemany(
        "INSERT INTO roles(id,name,sort) VALUES(?,?,?)",
        [(r, r, i) for i, r in enumerate(seed.get("roles", []))])

    for i, it in enumerate(seed["items"]):
        refs = it.get("refs")
        if isinstance(refs, (list, tuple)):
            refs = json.dumps(list(refs), ensure_ascii=False)
        conn.execute(
            """INSERT INTO items(id,cat,type,name,alias,family,role,seq,summary,detail,quote,refs,sort)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (it["id"], it["cat"], it.get("type"), it["name"], it.get("alias"),
             it.get("family"), it.get("role"), it.get("seq"), it.get("summary"),
             it.get("detail"), it.get("quote"), refs, i))
        for t in it.get("tags") or []:
            conn.execute("INSERT OR IGNORE INTO tags(name) VALUES(?)", (t,))
            tid = conn.execute("SELECT id FROM tags WHERE name=?", (t,)).fetchone()[0]
            conn.execute("INSERT OR IGNORE INTO item_tags(item_id,tag_id) VALUES(?,?)", (it["id"], tid))

    for r in seed.get("relations", []):
        if conn.execute("SELECT 1 FROM items WHERE id=?", (r["a"],)).fetchone() and \
           conn.execute("SELECT 1 FROM items WHERE id=?", (r["b"],)).fetchone():
            conn.execute("INSERT OR IGNORE INTO relations(a,b,label) VALUES(?,?,?)",
                         (r["a"], r["b"], r["label"]))

    for g in seed.get("genealogy", []):
        conn.execute("""INSERT OR REPLACE INTO genealogy(family,item_id,parent_id,spouse_id,gen,label)
                        VALUES(?,?,?,?,?,?)""",
                     (g["family"], g["id"], g.get("parent"), g.get("spouse"),
                      g["gen"], g.get("label") or ""))
    for fam, note in (seed.get("genealogy_notes") or {}).items():
        conn.execute("INSERT OR REPLACE INTO family_notes(family,note) VALUES(?,?)", (fam, note))

    for i, p in enumerate(seed.get("panels", [])):
        conn.execute("INSERT INTO panels(title,note,kind,payload,sort) VALUES(?,?,?,?,?)",
                     (p["title"], p.get("desc"), p["kind"],
                      json.dumps({k: p[k] for k in ("rows", "cols") if k in p}, ensure_ascii=False), i))

    conn.execute("INSERT OR REPLACE INTO meta(key,value) VALUES('title',?)", (seed.get("title", "红楼梦图谱"),))
    conn.commit()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=DB)
    ap.add_argument("--seed", default=SEED)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    if not os.path.exists(a.seed):
        sys.exit("缺少 seed.json，请先运行 python3 tools/build_seed.py")
    if os.path.exists(a.db):
        if not a.force:
            sys.exit(f"数据库已存在：{a.db}（重建请加 --force）")
        os.remove(a.db)
    seed = json.load(open(a.seed, encoding="utf-8"))
    conn = sqlite3.connect(a.db)
    try:
        build(conn, seed)
        n = conn.execute("SELECT count(*) FROM items").fetchone()[0]
        r = conn.execute("SELECT count(*) FROM relations").fetchone()[0]
        print(f"✓ 已建库 {a.db}")
        print(f"  条目 {n} · 关系 {r}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
