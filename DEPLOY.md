# Clove 抽卡平台 — 免費上線部署指南

這是一個 **React (Vite) 前端 + FastAPI 後端 + SQLite** 的完整網站。

## 重要提醒（免費方案限制）

大多數免費雲端主機的檔案系統是**暫時的**（重啟或休眠後資料會消失）。
- SQLite 資料庫（會員、點數、抽卡紀錄）會重置
- 上傳的圖片也會消失

適合：**展示、測試、個人練習**。
若要永久保存資料，建議之後改用免費的 Supabase / Neon Postgres。

---

## 推薦免費組合（最簡單）

| 部分   | 平台          | 費用 | 優點                  | 缺點                     |
|--------|---------------|------|-----------------------|--------------------------|
| 前端   | **Vercel**    | 免費 | 一鍵部署 Vite/React   | Hobby 僅限個人非商業使用 |
| 後端   | **Render**    | 免費 | 支援 FastAPI、GitHub  | 15 分鐘沒流量會休眠（冷啟動約 30-60 秒） |
| 資料   | SQLite（內建）| 免費 | 不用另外設定          | 重啟後資料消失           |

其他可選：
- 前端也可以用 **Cloudflare Pages** 或 **Netlify**（免費、流量較大）
- 後端也可以用 **Railway**（有免費額度，可加 Volume 保存 SQLite）

---

## 部署步驟

### 1. 把專案放到 GitHub

1. 到 [github.com](https://github.com) 註冊/登入。
2. 建立一個新的 **Public** Repository（例如 `clove-gacha`）。
3. 把這個資料夾裡的檔案上傳（**不要**包含 `node_modules`）。
   - 建議用 GitHub Desktop 或 `git` 指令。
   - 或直接在 GitHub 網頁拖曳上傳（檔案不多）。

已幫你清理過，只保留必要檔案。

### 2. 部署後端到 Render

1. 到 [render.com](https://render.com) 註冊（可用 GitHub 登入）。
2. 點 **New → Web Service**。
3. 選擇你的 GitHub Repository。
4. 設定：
   - **Root Directory**：`backend`
   - **Runtime**：Python 3
   - **Build Command**：`pip install -r requirements.txt`
   - **Start Command**：`uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 環境變數（Environment Variables）建議加：
   - `CORS_ALLOW_ALL` = `true`（展示用，允許所有前端連線）
   - 或 `CORS_ORIGINS` = `https://你的前端網址.vercel.app`
6. 建立後會得到一個網址，例如：`https://clove-gacha-xxxx.onrender.com`

> 第一次啟動可能要幾分鐘。休眠後第一次訪問會比較慢。

### 3. 部署前端到 Vercel

1. 到 [vercel.com](https://vercel.com) 用 GitHub 登入。
2. **Add New → Project** → 匯入同一個 Repository。
3. 設定：
   - **Framework Preset**：Vite
   - **Root Directory**：`frontend`
   - **Build Command**：`npm run build`（預設即可）
   - **Output Directory**：`dist`
4. 環境變數：
   - `VITE_API_URL` = `https://你的-render-後端網址`（**不要**結尾斜線）
5. Deploy。

完成後就會得到一個公開網址，例如 `https://clove-gacha.vercel.app`。

### 4. 測試

- 打開前端網址。
- 預設帳號：
  - 管理員：`admin` / `admin123`
  - 測試會員：`user` / `user123`（有 10000 點）

---

## 進階建議（想要資料不消失）

1. **改用 Supabase（免費 Postgres）**  
   把 `database.py` 從 SQLite 改成 Postgres（可用 `psycopg2` 或 `sqlalchemy`）。  
   Supabase 免費方案有 500MB 資料庫，資料會永久保存。

2. **圖片上傳改用 Cloudflare R2 或 Supabase Storage**（免費額度夠用）。

3. 若流量不大，也可以考慮 **Oracle Cloud Always Free** 的虛擬機器，自己架設，資料完全由你控制。

---

## 快速啟動（本機測試）

```bash
# 後端
cd backend
pip install -r requirements.txt
python main.py          # 或 uvicorn main:app --reload

# 前端
cd frontend
npm install
npm run dev
```

預設前端：http://localhost:5173  
後端 API：http://localhost:8000/docs

---

需要我幫你改成支援 Supabase（資料永久保存）的版本，或調整其他設定，再告訴我即可！
