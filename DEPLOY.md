# Clove 抽卡平台 — 免費上線部署指南（含 Supabase）

已支援 **Supabase（免費 Postgres）**，線上資料不會因為服務重啟而消失。

## 技術架構

| 部分 | 平台 | 說明 |
|------|------|------|
| 前端 | Vercel / Cloudflare Pages | 免費靜態托管 |
| 後端 | Render（免費 Web Service） | 跑 FastAPI |
| 資料庫 | **Supabase**（免費 Postgres） | 資料永久保存 |
| 圖片 | 本機 uploads/（或之後改 R2） | 免費方案圖片仍可能消失 |

---

## 1. 建立 Supabase 資料庫與 Storage（約 5 分鐘）

1. 到 [supabase.com](https://supabase.com) 用 GitHub 登入，建立新專案。
2. **建表**：左側 **SQL Editor** → 貼上 `backend/supabase_schema.sql` → Run。
3. **建立圖片 Bucket**：
   - 左側 **Storage** → **New bucket**
   - Name：`gacha-images`
   - 勾選 **Public bucket**（讓前端可以直接顯示圖片）
   - 建立後，到 Policies 確認 Public 讀取已開啟（Public bucket 通常預設可讀）。
4. 取得連線資訊：
   - **Project Settings → Database → Connection string (URI)** → 複製為 `DATABASE_URL`
   - **Project Settings → API**：
     - `Project URL` → `SUPABASE_URL`
     - `service_role` secret key → `SUPABASE_SERVICE_KEY`（**不要**用 anon key）

---

## 3. 部署後端到 Render

1. [render.com](https://render.com) → New → Web Service → 選擇 Repository。
2. 設定：
   - **Root Directory**：`backend`
   - **Build Command**：`pip install -r requirements.txt`
   - **Start Command**：`uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Environment Variables** 必加：
   - `DATABASE_URL` = Supabase 資料庫連線字串
   - `SUPABASE_URL` = Project URL（例如 `https://xxxx.supabase.co`）
   - `SUPABASE_SERVICE_KEY` = service_role key
   - `SUPABASE_BUCKET` = `gacha-images`（可省略，預設就是這個）
   - `CORS_ALLOW_ALL` = `true`
4. 建立服務，等待部署完成，記下後端網址。

> 有設定 `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` 時，圖片會自動上傳到 Supabase Storage；沒設定則仍存本機（方便開發）。

---

## 4. 部署前端到 Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → 匯入 Repository。
2. Root Directory 設為 `frontend`。
3. Environment Variables：
   - `VITE_API_URL` = 你的 Render 後端網址（例如 `https://xxxx.onrender.com`）
4. Deploy。

---

## 預設帳號

| 角色 | 帳號 | 密碼 | 點數 |
|------|------|------|------|
| 管理員 | admin | admin123 | 0 |
| 測試會員 | user | user123 | 10000 |

---

## 本機測試

```bash
# 不設 DATABASE_URL → 自動使用本機 SQLite
cd backend
pip install -r requirements.txt
python main.py

# 前端
cd frontend
npm install
npm run dev
```

若要本機也連 Supabase，建立 `backend/.env`：

```
DATABASE_URL=postgresql://postgres:...@...supabase.com:5432/postgres
```

---

## 注意事項

- 免費 Render 服務會休眠，第一次訪問會慢一點。
- 圖片已改為優先上傳到 **Supabase Storage**（設定好環境變數後即生效），不會再因重啟消失。
- 正式上線前請更換 `auth.py` 裡的 `SECRET_KEY`。
- `SUPABASE_SERVICE_KEY` 是高權限金鑰，只放在後端環境變數，不要寫進程式碼或前端。

需要我再幫你改圖片上傳到 Supabase Storage，或調整其他部分，直接告訴我即可。
