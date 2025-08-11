#!/usr/bin/env python3
"""
Paper Check - AI论文检测平台启动脚本
"""

import subprocess
import sys
import os
import webbrowser
import time
from pathlib import Path

def check_dependencies():
    """检查并安装依赖"""
    print("🔍 检查依赖包...")
    
    try:
        import flask
        import flask_cors
        import requests
        print("✅ 所有依赖包已安装")
        return True
    except ImportError:
        print("📦 正在安装依赖包...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
            print("✅ 依赖包安装完成")
            return True
        except subprocess.CalledProcessError:
            print("❌ 依赖包安装失败，请手动运行: pip install -r requirements.txt")
            return False

def start_server():
    """启动Flask服务器"""
    print("🚀 启动Paper Check服务...")
    
    # 设置环境变量
    os.environ['FLASK_ENV'] = 'development'
    
    try:
        # 启动Flask应用
        from app import app
        
        print("✅ 服务器启动成功!")
        print("🌐 访问地址: http://localhost:5000")
        print("📝 API文档: http://localhost:5000/api/health")
        print("⏹️  按 Ctrl+C 停止服务")
        
        # 自动打开浏览器
        time.sleep(1)
        webbrowser.open('http://localhost:5000')
        
        # 启动服务器
        app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
        
    except KeyboardInterrupt:
        print("\n👋 服务已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")

def main():
    """主函数"""
    print("=" * 50)
    print("🔍 Paper Check - AI论文检测平台")
    print("=" * 50)
    
    # 检查当前目录
    if not Path('app.py').exists():
        print("❌ 请在项目根目录下运行此脚本")
        return
    
    # 检查依赖
    if not check_dependencies():
        return
    
    # 启动服务器
    start_server()

if __name__ == '__main__':
    main()
