#!/usr/bin/env python3
"""红楼梦图谱 · 本地服务（仅标准库）

    python3 server/app.py            # http://127.0.0.1:8600
    python3 server/app.py --port 9000

API:
    GET /api/bootstrap   全量数据（家族/角色/条目/关系/谱系/面板）
    GET /api/items/<id>  条目详情（含关系、事件、判词、诗词）
    GET /api/search?q=   检索
"""
import argparse
import gzip
import json
import os
import posixpath
import re
import sqlite3
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlsplit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB = os.path.join(ROOT, "db", "honglou.db")
DB_PATH = DEFAULT_DB

STATIC_RE = re.compile(
    r"^/(?:(?:[A-Za-z0-9][A-Za-z0-9._-]*\.html)|favicon\.ico|"
    r"(?:css|js|assets)/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:css|js|png|jpe?g|svg|webp|gif|ico|woff2?))$")


def json_bytes(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def parse_refs(raw):
    """refs 以 JSON 数组存储；兼容早期以换行/分号分隔的纯文本。"""
    if not raw:
        return []
    try:
        val = json.loads(raw)
        if isinstance(val, list):
            return [str(x) for x in val if str(x).strip()]
        if isinstance(val, str):
            return [val]
    except (ValueError, TypeError):
        pass
    return [x.strip() for x in re.split(r"[\n；;]+", str(raw)) if x.strip()]


def row_item(r, tags=None):
    return {
        "id": r["id"], "cat": r["cat"], "type": r["type"], "name": r["name"],
        "alias": r["alias"], "family": r["family"], "familyName": r["family_name"],
        "role": r["role"], "seq": r["seq"], "summary": r["summary"],
        "detail": r["detail"], "quote": r["quote"], "refs": parse_refs(r["refs"]),
        "tags": tags or [],
    }


def resolve_static(raw):
    p = unquote(raw)
    if not p.startswith("/") or "\x00" in p or "\\" in p:
        return None
    p = posixpath.normpath(p)
    if p == "/":
        p = "/index.html"
    return p if STATIC_RE.match(p) else None


def load_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


class Handler(SimpleHTTPRequestHandler):
    server_version = "HonglouAtlas/1.0"

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def send_json(self, obj, status=200):
        body = json_bytes(obj)
        gz = len(body) > 1024 and "gzip" in self.headers.get("Accept-Encoding", "")
        if gz:
            body = gzip.compress(body, 6)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        if gz:
            self.send_header("Content-Encoding", "gzip")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlsplit(self.path)
        path = parsed.path
        q = {k: v[-1] for k, v in parse_qs(parsed.query).items()}

        if path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return

        if path.startswith("/api/"):
            try:
                if path.endswith(".json"):
                    path = path[:-5]
                return self.api(path, q)
            except BrokenPipeError:
                return
            except Exception as exc:  # noqa: BLE001
                self.log_message("API 错误: %s", exc)
                return self.send_json({"error": "server error"}, 500)

        target = resolve_static(path)
        if target is None:
            return self.send_error(404, "Not Found")
        self.path = target + (("?" + parsed.query) if parsed.query else "")
        super().do_GET()

    # ---------- API ----------
    def api(self, path, q):
        if path == "/api/bootstrap":
            return self.send_json(self.bootstrap())
        if path.startswith("/api/items/"):
            return self.item(unquote(path[len("/api/items/"):]))
        if path == "/api/search":
            return self.send_json(self.search(q.get("q", ""), q.get("cat")))
        return self.send_json({"error": "not found"}, 404)

    def bootstrap(self):
        conn = load_db()
        try:
            tags = {}
            for r in conn.execute("SELECT item_id, name FROM item_tags JOIN tags ON tags.id=item_tags.tag_id"):
                tags.setdefault(r[0], []).append(r[1])
            items = [row_item(r, tags.get(r["id"], [])) for r in conn.execute("SELECT * FROM v_items ORDER BY sort")]
            rels = [{"a": r[0], "b": r[1], "label": r[2]}
                    for r in conn.execute("SELECT a,b,label FROM relations")]
            gen = [{"id": r[0], "family": r[1], "parent": r[2], "spouse": r[3], "gen": r[4], "label": r[5]}
                   for r in conn.execute("SELECT item_id,family,parent_id,spouse_id,gen,label FROM genealogy")]
            notes = {r[0]: r[1] for r in conn.execute("SELECT family,note FROM family_notes")}
            panels = []
            for r in conn.execute("SELECT title,note,kind,payload FROM panels ORDER BY sort"):
                p = {"title": r[0], "desc": r[1], "kind": r[2]}
                p.update(json.loads(r[3] or "{}"))
                panels.append(p)
            return {
                "title": "红楼梦图谱",
                "families": [dict(r) for r in conn.execute("SELECT id,name,color,note FROM families ORDER BY sort")],
                "roles": [r[0] for r in conn.execute("SELECT name FROM roles ORDER BY sort")],
                "items": items, "relations": rels, "genealogy": gen,
                "genealogyNotes": notes, "panels": panels,
            }
        finally:
            conn.close()

    def item(self, iid):
        conn = load_db()
        try:
            r = conn.execute("SELECT * FROM v_items WHERE id=?", (iid,)).fetchone()
            if not r:
                return self.send_json({"error": "not found"}, 404)
            tags = [x[0] for x in conn.execute(
                "SELECT t.name FROM item_tags it JOIN tags t ON t.id=it.tag_id WHERE it.item_id=?", (iid,))]
            out = row_item(r, tags)
            out["related"] = [{"id": x[0], "name": x[1], "cat": x[2], "label": x[3], "dir": x[4]}
                              for x in conn.execute(
                """SELECT i.id, i.name, i.cat, r.label, 'out' FROM relations r JOIN items i ON i.id=r.b
                     WHERE r.a=? UNION ALL
                   SELECT i.id, i.name, i.cat, r.label, 'in' FROM relations r JOIN items i ON i.id=r.a
                     WHERE r.b=?""", (iid, iid))]
            return self.send_json(out)
        finally:
            conn.close()

    def search(self, q, cat=None):
        conn = load_db()
        try:
            like = f"%{q}%"
            sql = "SELECT * FROM v_items WHERE (name LIKE ? OR alias LIKE ? OR summary LIKE ? OR detail LIKE ?)"
            args = [like, like, like, like]
            if cat:
                sql += " AND cat=?"
                args.append(cat)
            sql += " ORDER BY (name LIKE ?) DESC, sort LIMIT 40"
            args.append(like)
            rows = conn.execute(sql, args).fetchall()
            return [row_item(r) for r in rows]
        finally:
            conn.close()


def main():
    global DB_PATH
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8600)
    ap.add_argument("--db", default=DEFAULT_DB)
    a = ap.parse_args()
    DB_PATH = os.path.abspath(a.db)
    if not os.path.exists(DB_PATH):
        sys.exit("数据库不存在，请先运行 python3 db/init_db.py")
    httpd = ThreadingHTTPServer((a.host, a.port), Handler)
    print(f"红楼梦图谱 → http://{a.host}:{a.port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()


if __name__ == "__main__":
    main()