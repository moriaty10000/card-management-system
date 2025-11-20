# 部署到 Render.com 指南

## 准备工作

✅ 所有配置文件已创建完成！

## 部署步骤

### 第一步：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建一个新仓库（比如命名为 `card-management-system`）
3. **不要**勾选 "Initialize this repository with a README"

### 第二步：上传代码到 GitHub

在项目目录 `e:\playground\AIprogram01` 打开命令行，运行：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/card-management-system.git
git push -u origin main
```

**注意：** 将 `YOUR_USERNAME` 替换为您的 GitHub 用户名

### 第三步：部署到 Render

1. 访问 https://render.com/ 并注册/登录
2. 点击 "New +" → "Web Service"
3. 连接您的 GitHub 账号
4. 选择刚才创建的仓库 `card-management-system`
5. 配置如下：
   - **Name**: `card-management-system`（或任意名称）
   - **Environment**: `Python 3`
   - **Build Command**: `bash build.sh`
   - **Start Command**: 留空（会自动使用 Procfile）
   - **Plan**: 选择 `Free`
6. 点击 "Create Web Service"

### 第四步：等待部署完成

- 首次部署需要 5-10 分钟
- 部署完成后，Render 会提供一个公网地址（类似 `https://card-management-system.onrender.com`）

### 第五步：访问您的应用

使用 Render 提供的地址访问，输入密码 `moriaty10000` 即可登录。

## 注意事项

⚠️ **免费版限制：**
- 15分钟无访问会自动休眠
- 再次访问时需要等待 20-30 秒唤醒
- 数据会持久化保存，不会丢失

✅ **优点：**
- 24小时在线（休眠后可唤醒）
- 不需要电脑一直开着
- 手机随时随地访问

## 如果遇到问题

1. 检查 Render 的 Logs 查看错误信息
2. 确保所有文件都已正确上传到 GitHub
3. 确保 `build.sh` 有执行权限

## 更新应用

以后如果修改了代码，只需：
```bash
git add .
git commit -m "Update"
git push
```

Render 会自动检测并重新部署。
