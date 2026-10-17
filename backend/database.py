import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "clove.db"

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    # 使用者（會員 + 管理員）
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',  -- member / admin
        points INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )
    """)

    # 活動獎池
    cur.execute("""
    CREATE TABLE IF NOT EXISTS pools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        intro_type TEXT DEFAULT 'image',  -- image / text
        cost_single INTEGER NOT NULL DEFAULT 100,
        cost_ten INTEGER NOT NULL DEFAULT 900,
        total_quantity INTEGER NOT NULL DEFAULT 0,
        remaining_quantity INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )
    """)

    # 卡面
    cur.execute("""
    CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pool_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        image_url TEXT,
        total_quantity INTEGER NOT NULL DEFAULT 0,
        remaining_quantity INTEGER NOT NULL DEFAULT 0,
        original_probability REAL DEFAULT 0,  -- 原始設定概率 (0~1)
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE
    )
    """)

    # 抽卡紀錄
    cur.execute("""
    CREATE TABLE IF NOT EXISTS draw_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        pool_id INTEGER NOT NULL,
        card_id INTEGER,
        draw_type TEXT NOT NULL,  -- single / ten
        cost_points INTEGER NOT NULL,
        result_json TEXT,  -- 抽中結果 JSON
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (pool_id) REFERENCES pools(id),
        FOREIGN KEY (card_id) REFERENCES cards(id)
    )
    """)

    # 儲值 / 消費紀錄
    cur.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,  -- recharge / draw / admin_recharge / test_recharge
        amount INTEGER NOT NULL,  -- 正數為儲值，負數為消費
        balance_after INTEGER NOT NULL,
        note TEXT,
        operator_id INTEGER,  -- 管理員操作時記錄
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    # 預設管理員帳號 (admin / admin123)
    cur.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cur.fetchone():
        import bcrypt
        hashed = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
        cur.execute(
            "INSERT INTO users (username, email, password_hash, role, points) VALUES (?, ?, ?, ?, ?)",
            ("admin", "admin@clove.local", hashed, "admin", 0)
        )

    # 預設測試會員 (user / user123)
    cur.execute("SELECT id FROM users WHERE username = 'user'")
    if not cur.fetchone():
        import bcrypt
        hashed = bcrypt.hashpw(b"user123", bcrypt.gensalt()).decode()
        cur.execute(
            "INSERT INTO users (username, email, password_hash, role, points) VALUES (?, ?, ?, ?, ?)",
            ("user", "user@clove.local", hashed, "member", 10000)
        )

    conn.commit()
    conn.close()
    print("資料庫初始化完成")

if __name__ == "__main__":
    init_db()
