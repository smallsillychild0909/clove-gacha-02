-- ============================================================
-- Clove 抽卡平台 — Supabase (Postgres) 建表腳本
-- 請到 Supabase Dashboard → SQL Editor → 貼上整份後執行
-- ============================================================

-- 使用者（會員 + 管理員）
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 活動獎池
CREATE TABLE IF NOT EXISTS pools (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    intro_type TEXT DEFAULT 'image',
    cost_single INTEGER NOT NULL DEFAULT 100,
    cost_ten INTEGER NOT NULL DEFAULT 900,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    remaining_quantity INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 卡面
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    remaining_quantity INTEGER NOT NULL DEFAULT 0,
    original_probability DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 抽卡紀錄
CREATE TABLE IF NOT EXISTS draw_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    pool_id INTEGER NOT NULL REFERENCES pools(id),
    card_id INTEGER REFERENCES cards(id),
    draw_type TEXT NOT NULL,
    cost_points INTEGER NOT NULL,
    result_json TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 儲值 / 消費紀錄
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    note TEXT,
    operator_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引（加速查詢）
CREATE INDEX IF NOT EXISTS idx_cards_pool ON cards(pool_id);
CREATE INDEX IF NOT EXISTS idx_draw_records_user ON draw_records(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- 完成後程式啟動時會自動建立預設帳號：
--   admin / admin123
--   user  / user123（10000 點）
