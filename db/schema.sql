-- 红楼梦图谱 · SQLite schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS families (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  color TEXT,
  note  TEXT,
  sort  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS roles (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS items (
  id       TEXT PRIMARY KEY,
  cat      TEXT NOT NULL,           -- people / fate / poetry / place / event / chapter
  type     TEXT,                    -- 主子 / 丫鬟 / 亲戚 / 僧道 / 判词 / 曲 / 诗 ...
  name     TEXT NOT NULL,
  alias    TEXT,                    -- 别名、字、号
  family   TEXT REFERENCES families(id) ON UPDATE CASCADE,
  role     TEXT,                    -- 身份分组
  seq      INTEGER,                 -- 回目序号等
  summary  TEXT,
  detail   TEXT,
  quote    TEXT,                    -- 判词 / 诗句原文
  ending   TEXT,                    -- 结局（从详述【结局】段提取）
  comment  TEXT,                    -- 评析
  zhipi    TEXT,                    -- 脂评（有则显示）
  refs     TEXT,
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_items_cat    ON items(cat);
CREATE INDEX IF NOT EXISTS idx_items_family ON items(family);
CREATE INDEX IF NOT EXISTS idx_items_role   ON items(role);
CREATE INDEX IF NOT EXISTS idx_items_name   ON items(name);

-- 关系带标签：父女 / 夫妻 / 主仆 / 表亲 / 情人 / 主仆（陪房）…
CREATE TABLE IF NOT EXISTS relations (
  a      TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE ON UPDATE CASCADE,
  b      TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE ON UPDATE CASCADE,
  label  TEXT NOT NULL,
  PRIMARY KEY (a, b, label)
);
CREATE INDEX IF NOT EXISTS idx_rel_a ON relations(a);
CREATE INDEX IF NOT EXISTS idx_rel_b ON relations(b);

CREATE TABLE IF NOT EXISTS tags (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS item_tags (
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE ON UPDATE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS panels (
  id    INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  note  TEXT,
  kind  TEXT NOT NULL CHECK (kind IN ('bars','table')),
  payload TEXT NOT NULL,
  sort  INTEGER NOT NULL DEFAULT 0
);

CREATE VIEW IF NOT EXISTS v_items AS
SELECT i.*,
       f.name AS family_name,
       (SELECT group_concat(t.name, '|') FROM item_tags it JOIN tags t ON t.id = it.tag_id
         WHERE it.item_id = i.id) AS tags
FROM items i LEFT JOIN families f ON f.id = i.family;
-- 谱系（世代树）：同一人物可出现在多个家族视图中
-- item_id 允许以 vg- 开头的“名佚补位”节点，故不设外键
CREATE TABLE IF NOT EXISTS genealogy (
  family TEXT NOT NULL,
  item_id TEXT NOT NULL,
  parent_id TEXT,
  spouse_id TEXT,
  gen INTEGER NOT NULL,
  label TEXT,
  rk TEXT,
  title TEXT,
  inher INTEGER DEFAULT 0,
  house TEXT,
  ord INTEGER DEFAULT 0,
  PRIMARY KEY (family, item_id)
);
CREATE INDEX IF NOT EXISTS idx_gen_family ON genealogy(family, gen);

-- 隐语 / 谶语 / 府邸示意图这类“结构松散、前端一次加载”的内容统一放这里，
-- 加新类型不必改表结构（kind 由前端分发）。
CREATE TABLE IF NOT EXISTS lore (
  id      TEXT PRIMARY KEY,
  kind    TEXT NOT NULL,   -- wordplay / foreshadow / panel / room
  payload TEXT NOT NULL,   -- JSON
  sort    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_lore_kind ON lore(kind);

CREATE TABLE IF NOT EXISTS family_notes (
  family TEXT PRIMARY KEY,
  note   TEXT
);
