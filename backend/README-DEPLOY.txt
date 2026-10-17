# 部署用啟動說明（Render / 其他平台）

Start Command（在平台設定，不要寫在這裡）：

```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

環境變數建議：

- `CORS_ALLOW_ALL=true`（展示用）
- 或 `CORS_ORIGINS=https://your-frontend.vercel.app`

資料庫與上傳檔案在免費方案重啟後會重置。
