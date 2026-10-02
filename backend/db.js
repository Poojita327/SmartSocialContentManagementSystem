const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./social_media.db');

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','content_creator','marketing_manager')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','scheduled','published')),
    published_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS post_platforms (
    post_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    PRIMARY KEY(post_id, platform_id),
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(platform_id) REFERENCES platforms(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS scheduled_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    scheduled_at TEXT NOT NULL,
    published_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(platform_id) REFERENCES platforms(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_active_schedule
          ON scheduled_posts(platform_id, scheduled_at)
          WHERE published_at IS NULL`);
  db.run(`CREATE TABLE IF NOT EXISTS engagements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL UNIQUE,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS post_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER,
    action TEXT NOT NULL,
    old_content TEXT,
    new_content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);
  ['Instagram','Facebook','LinkedIn','X'].forEach(name => db.run('INSERT OR IGNORE INTO platforms(name) VALUES(?)',[name]));
});

const run=(sql,params=[])=>new Promise((resolve,reject)=>db.run(sql,params,function(e){e?reject(e):resolve({id:this.lastID,changes:this.changes})}));
const get=(sql,params=[])=>new Promise((resolve,reject)=>db.get(sql,params,(e,row)=>e?reject(e):resolve(row)));
const all=(sql,params=[])=>new Promise((resolve,reject)=>db.all(sql,params,(e,rows)=>e?reject(e):resolve(rows)));
const exec=sql=>new Promise((resolve,reject)=>db.exec(sql,e=>e?reject(e):resolve()));
module.exports={db,run,get,all,exec};
