#!/usr/bin/env python3
"""导出静态站点到 dist/，供 GitHub Pages / 任意静态托管使用。

    python3 tools/build_static.py

结构：
    dist/index.html
    dist/css/style.css  dist/js/app.js
    dist/api/bootstrap.json         全量数据（前端一次加载）
    dist/404.html
"""
import json
import os
import shutil
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, "db", "honglou.db")
OUT = os.path.join(ROOT, "dist")


def rows(conn, sql, args=()):
    return [dict(r) for r in conn.execute(sql, args)]


def build():
    if not os.path.exists(DB):
        sys.exit("数据库不存在，请先运行 python3 db/init_db.py")
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row

    tags = {}
    for r in conn.execute("SELECT item_id, name FROM item_tags JOIN tags ON tags.id=item_tags.tag_id"):
        tags.setdefault(r["item_id"], []).append(r["name"])

    items = []
    for r in conn.execute("SELECT * FROM v_items ORDER BY sort"):
        items.append({
            "id": r["id"], "cat": r["cat"], "type": r["type"], "name": r["name"],
            "alias": r["alias"], "family": r["family"], "familyName": r["family_name"],
            "role": r["role"], "seq": r["seq"], "summary": r["summary"],
            "detail": r["detail"], "quote": r["quote"],
            "refs": json.loads(r["refs"]) if r["refs"] and r["refs"].startswith("[") else ([r["refs"]] if r["refs"] else []),
            "tags": tags.get(r["id"], []),
        })

    rels = [{"a": r["a"], "b": r["b"], "label": r["label"]}
            for r in conn.execute("SELECT a,b,label FROM relations")]

    gen = [{"id": r["item_id"], "family": r["family"], "parent": r["parent_id"],
            "spouse": r["spouse_id"], "gen": r["gen"], "label": r["label"]}
           for r in conn.execute("SELECT * FROM genealogy")]

    notes = {r["family"]: r["note"] for r in conn.execute("SELECT * FROM family_notes")}

    panels = []
    for r in conn.execute("SELECT title,note,kind,payload FROM panels ORDER BY sort"):
        p = {"title": r["title"], "desc": r["note"], "kind": r["kind"]}
        p.update(json.loads(r["payload"] or "{}"))
        panels.append(p)

    data = {
        "title": "红楼梦图谱",
        "families": rows(conn, "SELECT id,name,color,note FROM families ORDER BY sort"),
        "roles": [r["name"] for r in conn.execute("SELECT name FROM roles ORDER BY sort")],
        "items": items, "relations": rels, "genealogy": gen,
        "genealogyNotes": notes, "panels": panels,
    }
    conn.close()

    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, "api"))

    for f in ("index.html",):
        shutil.copy2(os.path.join(ROOT, f), os.path.join(OUT, f))
    for d in ("css", "js"):
        shutil.copytree(os.path.join(ROOT, d), os.path.join(OUT, d))

    with open(os.path.join(OUT, "api", "bootstrap.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    # GitHub Pages 的 404 回退到首页（hash 路由不依赖服务端）
    notfound = os.path.join(OUT, "404.html")
    with open(os.path.join(ROOT, "index.html"), encoding="utf-8") as f:
        html = f.read()
    with open(notfound, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✓ 静态站点已生成：{OUT}")
    print(f"  条目 {len(items)} · 关系 {len(rels)} · 谱系 {len(gen)} · 数据 {round(os.path.getsize(os.path.join(OUT,'api','bootstrap.json'))/1024)} KB")


if __name__ == "__main__":
    build()
