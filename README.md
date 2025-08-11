# Paper Check - AI论文检测平台

一个专业的AI文本检测与优化平台，基于先进的机器学习算法，帮助用户检测文本的AI生成程度并提供优化建议。

## ✨ 功能特色

### 🔍 AI检测功能
- **四类精细检测**：
  - 人工撰写 (Human-Written)
  - 机器生成 (Machine-Generated)
  - 机器生成后人工润色 (Machine-Written Machine-Humanized)
  - 人工撰写后机器优化 (Human-Written Machine-Polished)

- **多种输入方式**：
  - 文本直接输入
  - 文件上传支持 (.txt, .doc, .docx, .pdf)
  - 最低50字符检测要求

### 🎨 AI率优化功能
- **智能文本优化**：使用Gemini 2.5 API进行文本人性化处理
- **详细改进分析**：提供具体的优化改进统计
- **一键操作**：复制、下载优化后的文本
- **实时统计**：字符数、词数等文本统计信息

## 🚀 快速开始

### 方法1：Vercel部署（推荐）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel --prod
```

### 方法2：本地开发
```bash
# 一键启动
python3 run.py

# 或手动启动
pip install -r requirements.txt
python3 app.py
```

### 方法3：GitHub + Vercel自动部署
1. Fork此仓库到您的GitHub
2. 在[Vercel](https://vercel.com)中导入项目
3. 设置`GEMINI_API_KEY`环境变量
4. 自动部署完成！

详细部署指南请查看 [DEPLOY.md](./DEPLOY.md)

## 📋 系统要求

- Python 3.7+
- 网络连接（用于调用Gemini API）
- 现代浏览器（Chrome、Firefox、Safari、Edge）

## 🔧 配置说明

### Gemini API配置
在 `app.py` 中配置您的API密钥：
```python
API_KEY = 'your_gemini_api_key_here'
MODEL_NAME = 'gemini-2.5-flash-lite-preview-06-17'
```

## 📖 使用方法

### 1. AI检测
1. 选择输入方式（文本输入或文件上传）
2. 输入或上传要检测的内容（至少50字符）
3. 点击"开始检测"
4. 查看详细的检测结果和分类分析

### 2. AI率优化
1. 完成AI检测后，点击"降低AI率"
2. 在优化界面中确认或修改原始文本
3. 点击"开始优化"等待处理
4. 查看优化结果和改进统计
5. 复制或下载优化后的文本

## 🛠️ 技术架构

### 前端技术
- **HTML5 + CSS3**：响应式设计，现代科技风格
- **Vanilla JavaScript**：原生JS实现，无框架依赖
- **Font Awesome**：图标库

### 后端技术
- **Flask**：轻量级Web框架
- **Flask-CORS**：跨域资源共享
- **Requests**：HTTP请求库
- **Gemini 2.5 API**：Google的先进语言模型

### AI检测算法
- 基于 [LLM-DetectAIve](https://github.com/mbzuai-nlp/LLM-DetectAIve) 的检测理念
- 目前使用模拟算法（演示版本）
- 支持四类精细化检测分类

## 📁 项目结构

```
CheckAI/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 前端JavaScript
├── app.py             # Flask后端服务
├── requirements.txt   # Python依赖
├── run.py            # 启动脚本
└── README.md         # 项目说明
```

## 🔮 未来规划

- [ ] 集成真实的LLM-DetectAIve检测模型
- [ ] 支持更多文档格式（PDF、Word等）
- [ ] 添加批量检测功能
- [ ] 用户账户系统
- [ ] 检测历史记录
- [ ] API接口文档
- [ ] 多语言支持

## 📄 许可证

本项目基于MIT许可证开源。

## 🙏 致谢

- [LLM-DetectAIve](https://github.com/mbzuai-nlp/LLM-DetectAIve) - AI检测算法参考
- [Google Gemini API](https://ai.google.dev/) - 文本优化服务
- [Font Awesome](https://fontawesome.com/) - 图标支持

## 📞 联系我们

如有问题或建议，请提交Issue或联系开发团队。

---

**Paper Check** - 让AI检测更简单，让文本优化更智能！