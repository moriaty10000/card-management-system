# Card Management System

一个简约、轻松风格的卡片管理系统，支持增删改查、收藏和自定义分类。

## 功能特性

- 🗂️ 卡片管理（创建、编辑、删除）
- ⭐ 收藏功能
- 🏷️ 自定义分类
- 🔐 密码保护
- 📱 响应式设计（支持手机和电脑）
- 💾 数据持久化（SQLite）

## 技术栈

- **后端**: FastAPI + SQLAlchemy + SQLite
- **前端**: React + Vite + Vanilla CSS
- **部署**: Render.com

## 本地运行

### 后端
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

## 部署到 Render

1. 将代码推送到 GitHub
2. 在 Render.com 创建新的 Web Service
3. 连接 GitHub 仓库
4. Render 会自动检测并部署

## 默认密码

登录密码在 `frontend/src/components/Login.jsx` 中设置。
