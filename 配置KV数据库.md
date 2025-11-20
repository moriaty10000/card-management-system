# 配置 Vercel KV 数据库

## 问题
您现在遇到的问题是：数据无法保存，刷新后就丢失了。

## 原因
Vercel 的 Serverless 函数是无状态的，临时存储会被清空。

## 解决方案：使用 Vercel KV（免费）

### 步骤1：在 Vercel 创建 KV 数据库

1. 访问您的 Vercel Dashboard：https://vercel.com/dashboard
2. 点击顶部的 "Storage" 标签
3. 点击 "Create Database"
4. 选择 "KV" (Key-Value Store)
5. 填写信息：
   - **Name**: `card-management-kv`
   - **Region**: Singapore 或 Hong Kong（离中国近）
6. 点击 "Create"

### 步骤2：连接 KV 到项目

1. 创建完成后，点击 "Connect Project"
2. 选择您的项目 `card-management-system`
3. 点击 "Connect"

### 步骤3：重新部署

KV 连接后，Vercel 会自动添加环境变量。您需要重新部署：

**方法1：通过 Git 推送**
```powershell
git add .
git commit -m "Add Vercel KV support"
git push
```
Vercel 会自动检测并重新部署。

**方法2：在 Vercel Dashboard 手动部署**
1. 进入您的项目页面
2. 点击 "Deployments" 标签
3. 点击右上角的 "Redeploy"

### 步骤4：验证

重新部署完成后：
1. 访问您的应用
2. 创建一些卡片
3. 刷新页面
4. 卡片应该还在！

## 如果还是不行

请告诉我，我会帮您检查配置。

## 免费额度

Vercel KV 免费版：
- ✅ 256 MB 存储空间
- ✅ 30,000 次请求/月
- ✅ 对个人使用完全够用
