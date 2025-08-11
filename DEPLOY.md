# 部署指南

## Vercel部署（推荐）

### 1. 准备工作
确保您的项目包含以下文件：
- `index.html` - 主页面
- `styles.css` - 样式文件  
- `script.js` - 前端脚本
- `api/optimize.py` - Vercel无服务器函数
- `vercel.json` - Vercel配置文件
- `requirements-vercel.txt` - Python依赖

### 2. 部署步骤

#### 方法1：通过Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel --prod
```

#### 方法2：通过GitHub集成
1. 将代码推送到GitHub仓库
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择您的GitHub仓库
5. 点击 "Deploy"

### 3. 环境配置
在Vercel Dashboard中设置环境变量：
- `GEMINI_API_KEY`: 您的Gemini API密钥

### 4. 自定义域名（可选）
在Vercel Dashboard的项目设置中添加自定义域名。

## 其他部署选项

### 1. Netlify部署
1. 将代码推送到GitHub
2. 在Netlify中连接GitHub仓库
3. 设置构建命令和发布目录
4. 部署

注意：Netlify需要使用Netlify Functions替代Vercel Functions。

### 2. GitHub Pages部署（仅静态功能）
1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择分支和目录

注意：GitHub Pages不支持后端功能，优化功能将不可用。

### 3. 本地开发
```bash
# 安装依赖
pip install -r requirements.txt

# 启动Flask服务器
python3 app.py

# 或使用启动脚本
python3 run.py
```

## 故障排除

### 常见问题

1. **API调用失败**
   - 检查Gemini API密钥是否正确
   - 确认网络连接正常
   - 查看浏览器开发者工具的网络面板

2. **CORS错误**
   - 确保`vercel.json`配置正确
   - 检查API函数的CORS头设置

3. **部署失败**
   - 检查`requirements-vercel.txt`文件
   - 确认Python版本兼容性
   - 查看Vercel构建日志

### 调试技巧

1. **查看日志**
   ```bash
   vercel logs [deployment-url]
   ```

2. **本地测试API函数**
   ```bash
   vercel dev
   ```

3. **检查函数状态**
   在Vercel Dashboard的Functions页面查看函数执行状态。

## 性能优化

1. **缓存策略**
   - 静态资源使用长期缓存
   - API响应使用适当的缓存头

2. **代码压缩**
   - 压缩CSS和JavaScript文件
   - 优化图片资源

3. **CDN加速**
   - 使用Vercel的全球CDN
   - 配置合适的缓存策略

## 安全考虑

1. **API密钥保护**
   - 使用环境变量存储敏感信息
   - 定期轮换API密钥

2. **输入验证**
   - 验证用户输入的文本长度和格式
   - 防止恶意请求

3. **速率限制**
   - 实现API调用频率限制
   - 监控异常使用模式
