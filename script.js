// DOM元素
const textTab = document.querySelector('[data-tab="text"]');
const fileTab = document.querySelector('[data-tab="file"]');
const textInput = document.getElementById('text-input');
const fileInput = document.getElementById('file-input');
const textContent = document.getElementById('textContent');
const charCount = document.getElementById('charCount');
const fileInputElement = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadedFile = document.getElementById('uploadedFile');
const removeFileBtn = document.getElementById('removeFile');
const detectButton = document.getElementById('detectButton');
const resultsSection = document.getElementById('resultsSection');
const newDetectionBtn = document.getElementById('newDetection');
const optimizeTextBtn = document.getElementById('optimizeText');

// 优化功能元素
const optimizationSection = document.getElementById('optimizationSection');
const optimizeTextInput = document.getElementById('optimizeTextInput');
const optimizedTextOutput = document.getElementById('optimizedTextOutput');
const startOptimizeBtn = document.getElementById('startOptimize');
const backToResultsBtn = document.getElementById('backToResults');
const copyOptimizedBtn = document.getElementById('copyOptimized');
const downloadOptimizedBtn = document.getElementById('downloadOptimized');
const outputActions = document.getElementById('outputActions');
const improvementsSection = document.getElementById('improvementsSection');
const improvementsList = document.getElementById('improvementsList');

// 统计元素
const originalCharCount = document.getElementById('originalCharCount');
const originalWordCount = document.getElementById('originalWordCount');
const optimizedCharCount = document.getElementById('optimizedCharCount');
const optimizedWordCount = document.getElementById('optimizedWordCount');

// 全局变量
let currentFile = null;
let currentText = '';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateCharCount();
    checkDetectButtonState();
});

// 事件监听器初始化
function initializeEventListeners() {
    // 选项卡切换
    textTab.addEventListener('click', () => switchTab('text'));
    fileTab.addEventListener('click', () => switchTab('file'));
    
    // 文本输入
    textContent.addEventListener('input', handleTextInput);
    textContent.addEventListener('paste', handleTextPaste);
    
    // 文件上传
    uploadArea.addEventListener('click', () => fileInputElement.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    fileInputElement.addEventListener('change', handleFileSelect);
    removeFileBtn.addEventListener('click', removeFile);
    
    // 检测按钮
    detectButton.addEventListener('click', startDetection);
    
    // 操作按钮
    newDetectionBtn.addEventListener('click', resetDetection);
    optimizeTextBtn.addEventListener('click', showOptimization);
    
    // 优化功能按钮
    startOptimizeBtn.addEventListener('click', startOptimization);
    backToResultsBtn.addEventListener('click', backToResults);
    copyOptimizedBtn.addEventListener('click', copyOptimizedText);
    downloadOptimizedBtn.addEventListener('click', downloadOptimizedText);
    
    // 优化文本输入
    optimizeTextInput.addEventListener('input', handleOptimizeTextInput);
    
    // 导航平滑滚动
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}

// 选项卡切换
function switchTab(tab) {
    // 更新按钮状态
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // 显示对应内容
    textInput.classList.toggle('hidden', tab !== 'text');
    fileInput.classList.toggle('hidden', tab !== 'file');
    
    // 重置状态
    if (tab === 'text') {
        currentFile = null;
        uploadedFile.classList.add('hidden');
        uploadArea.classList.remove('hidden');
    } else {
        currentText = '';
        textContent.value = '';
        updateCharCount();
    }
    
    checkDetectButtonState();
}

// 文本输入处理
function handleTextInput() {
    currentText = textContent.value;
    updateCharCount();
    checkDetectButtonState();
}

function handleTextPaste(e) {
    // 延迟执行以确保粘贴内容已经插入
    setTimeout(() => {
        handleTextInput();
    }, 10);
}

function updateCharCount() {
    const count = textContent.value.length;
    charCount.textContent = count;
    
    // 字符数颜色提示
    if (count < 50) {
        charCount.style.color = '#ef4444';
    } else if (count < 100) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#22c55e';
    }
}

// 文件上传处理
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // 检查文件类型
    const allowedTypes = [
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
    ];
    
    const allowedExtensions = ['.txt', '.doc', '.docx', '.pdf'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        showNotification('不支持的文件格式，请选择 .txt, .doc, .docx 或 .pdf 文件', 'error');
        return;
    }
    
    // 检查文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('文件大小不能超过10MB', 'error');
        return;
    }
    
    currentFile = file;
    showUploadedFile(file);
    checkDetectButtonState();
    
    // 如果是文本文件，读取内容
    if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentText = e.target.result;
        };
        reader.readAsText(file);
    }
}

function showUploadedFile(file) {
    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    
    uploadArea.classList.add('hidden');
    uploadedFile.classList.remove('hidden');
    uploadedFile.querySelector('.file-name').textContent = `${fileName} (${fileSize})`;
}

function removeFile() {
    currentFile = null;
    fileInputElement.value = '';
    uploadedFile.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    checkDetectButtonState();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 检测按钮状态
function checkDetectButtonState() {
    const hasText = textContent.value.length >= 50;
    const hasFile = currentFile !== null;
    const isTextTab = !textInput.classList.contains('hidden');
    
    const canDetect = (isTextTab && hasText) || (!isTextTab && hasFile);
    detectButton.disabled = !canDetect;
}

// 开始检测
async function startDetection() {
    if (detectButton.disabled) return;
    
    // 设置加载状态
    setDetectionLoading(true);
    
    try {
        // 准备检测数据
        let textToDetect = '';
        
        if (currentFile) {
            // 文件上传模式
            if (currentFile.type === 'text/plain') {
                textToDetect = currentText;
            } else {
                // 对于其他文件类型，这里应该调用后端API来提取文本
                showNotification('文件文本提取功能正在开发中，请使用文本输入模式', 'info');
                setDetectionLoading(false);
                return;
            }
        } else {
            // 文本输入模式
            textToDetect = textContent.value;
        }
        
        if (!textToDetect || textToDetect.length < 50) {
            showNotification('文本内容太短，至少需要50个字符', 'error');
            setDetectionLoading(false);
            return;
        }
        
        // 模拟API调用 - 在实际项目中这里会调用后端API
        const result = await simulateDetection(textToDetect);
        
        // 显示结果
        displayResults(result);
        
    } catch (error) {
        console.error('检测过程中发生错误:', error);
        showNotification('检测过程中发生错误，请稍后重试', 'error');
    } finally {
        setDetectionLoading(false);
    }
}

// 设置检测加载状态
function setDetectionLoading(loading) {
    if (loading) {
        detectButton.classList.add('loading');
        detectButton.innerHTML = '<i class="fas fa-spinner"></i> 检测中...';
        detectButton.disabled = true;
    } else {
        detectButton.classList.remove('loading');
        detectButton.innerHTML = '<i class="fas fa-search"></i> 开始检测';
        checkDetectButtonState();
    }
}

// 模拟检测API调用
async function simulateDetection(text) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    // 模拟检测结果
    const textLength = text.length;
    const wordCount = text.split(/\s+/).length;
    
    // 基于文本特征生成模拟分数
    let humanScore = Math.random() * 30 + 20; // 20-50%
    let machineScore = Math.random() * 40 + 30; // 30-70%
    let humanizedScore = Math.random() * 20 + 5; // 5-25%
    let polishedScore = Math.random() * 15 + 5; // 5-20%
    
    // 归一化分数
    const total = humanScore + machineScore + humanizedScore + polishedScore;
    humanScore = (humanScore / total) * 100;
    machineScore = (machineScore / total) * 100;
    humanizedScore = (humanizedScore / total) * 100;
    polishedScore = (polishedScore / total) * 100;
    
    // AI生成可能性 = 机器生成 + 机器生成后人工润色
    const aiProbability = machineScore + humanizedScore;
    
    return {
        aiProbability: Math.round(aiProbability),
        humanScore: Math.round(humanScore),
        machineScore: Math.round(machineScore),
        humanizedScore: Math.round(humanizedScore),
        polishedScore: Math.round(polishedScore),
        textLength: textLength,
        wordCount: wordCount,
        detectionTime: new Date().toLocaleString('zh-CN')
    };
}

// 显示检测结果
function displayResults(result) {
    // 更新总体分数
    document.getElementById('overallScore').textContent = `${result.aiProbability}%`;
    document.getElementById('detectionTime').textContent = result.detectionTime;
    
    // 更新状态描述
    const scoreStatus = document.getElementById('scoreStatus');
    const scoreDetail = document.getElementById('scoreDetail');
    
    if (result.aiProbability < 30) {
        scoreStatus.textContent = '低AI生成可能性';
        scoreStatus.style.color = '#22c55e';
        scoreDetail.textContent = '文本显示出较强的人工撰写特征，AI生成的可能性较低。';
    } else if (result.aiProbability < 70) {
        scoreStatus.textContent = '中等AI生成可能性';
        scoreStatus.style.color = '#f59e0b';
        scoreDetail.textContent = '文本中存在一些AI生成的特征，建议进一步分析或人工审查。';
    } else {
        scoreStatus.textContent = '高AI生成可能性';
        scoreStatus.style.color = '#ef4444';
        scoreDetail.textContent = '文本显示出明显的AI生成特征，很可能由人工智能生成或大量使用AI辅助。';
    }
    
    // 更新分类分数
    document.getElementById('humanScore').textContent = `${result.humanScore}%`;
    document.getElementById('machineScore').textContent = `${result.machineScore}%`;
    document.getElementById('humanizedScore').textContent = `${result.humanizedScore}%`;
    document.getElementById('polishedScore').textContent = `${result.polishedScore}%`;
    
    // 更新建议内容
    updateSuggestions(result);
    
    // 显示结果区域
    resultsSection.classList.remove('hidden');
    
    // 平滑滚动到结果区域
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// 更新建议内容
function updateSuggestions(result) {
    const suggestionsContent = document.getElementById('suggestionsContent');
    let suggestions = '';
    
    if (result.aiProbability < 30) {
        suggestions = `
            <div class="suggestion-item">
                <h5><i class="fas fa-check-circle" style="color: #22c55e;"></i> 检测结果良好</h5>
                <p>您的文本显示出较强的人工撰写特征，通过大多数AI检测系统的可能性很高。</p>
            </div>
            <div class="suggestion-item">
                <h5><i class="fas fa-lightbulb" style="color: #f59e0b;"></i> 优化建议</h5>
                <ul>
                    <li>保持当前的写作风格和表达方式</li>
                    <li>可以适当使用AI工具进行语法检查和润色</li>
                    <li>注意保持个人写作特色和观点的独特性</li>
                </ul>
            </div>
        `;
    } else if (result.aiProbability < 70) {
        suggestions = `
            <div class="suggestion-item">
                <h5><i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> 需要注意</h5>
                <p>您的文本中检测到一些AI生成的特征，建议进行适当的修改和优化。</p>
            </div>
            <div class="suggestion-item">
                <h5><i class="fas fa-magic" style="color: #667eea;"></i> 优化建议</h5>
                <ul>
                    <li>增加更多个人观点和独特见解</li>
                    <li>使用更加多样化的句式结构</li>
                    <li>添加具体的案例和个人经验</li>
                    <li>调整部分过于规整的表达方式</li>
                    <li>增强文本的情感色彩和个人风格</li>
                </ul>
            </div>
        `;
    } else {
        suggestions = `
            <div class="suggestion-item">
                <h5><i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> 高风险警告</h5>
                <p>您的文本显示出明显的AI生成特征，强烈建议进行大幅修改。</p>
            </div>
            <div class="suggestion-item">
                <h5><i class="fas fa-tools" style="color: #667eea;"></i> 重要优化建议</h5>
                <ul>
                    <li><strong>重新组织内容结构</strong>：避免过于标准化的段落组织</li>
                    <li><strong>增加人文色彩</strong>：加入个人思考、疑问和情感表达</li>
                    <li><strong>使用非正式语言</strong>：适当使用口语化表达和个人习惯用语</li>
                    <li><strong>添加具体细节</strong>：包含真实的数据、案例和个人经历</li>
                    <li><strong>变化句式结构</strong>：避免过于工整的句子排列</li>
                    <li><strong>表达不确定性</strong>：适当使用"可能"、"也许"等表达</li>
                </ul>
            </div>
        `;
    }
    
    suggestionsContent.innerHTML = suggestions;
}

// 重置检测
function resetDetection() {
    // 隐藏结果区域
    resultsSection.classList.add('hidden');
    
    // 清空文本输入
    textContent.value = '';
    currentText = '';
    updateCharCount();
    
    // 清空文件上传
    removeFile();
    
    // 切换到文本输入模式
    switchTab('text');
    
    // 滚动到顶部
    document.querySelector('.detection-section').scrollIntoView({ behavior: 'smooth' });
}

// 显示优化界面
function showOptimization() {
    // 获取当前检测的文本
    let textToOptimize = '';
    if (currentFile && currentFile.type === 'text/plain') {
        textToOptimize = currentText;
    } else if (textContent.value) {
        textToOptimize = textContent.value;
    }
    
    if (!textToOptimize || textToOptimize.length < 50) {
        showNotification('请先进行文本检测或输入足够长的文本内容', 'warning');
        return;
    }
    
    // 显示优化区域
    optimizationSection.classList.remove('hidden');
    
    // 填充原始文本
    optimizeTextInput.value = textToOptimize;
    updateOptimizeTextStats();
    
    // 清空优化结果
    optimizedTextOutput.value = '';
    outputActions.classList.add('hidden');
    improvementsSection.classList.add('hidden');
    
    // 滚动到优化区域
    optimizationSection.scrollIntoView({ behavior: 'smooth' });
}

// 返回检测结果
function backToResults() {
    optimizationSection.classList.add('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// 处理优化文本输入
function handleOptimizeTextInput() {
    updateOptimizeTextStats();
    checkOptimizeButtonState();
}

// 更新优化文本统计
function updateOptimizeTextStats() {
    const originalText = optimizeTextInput.value;
    const optimizedText = optimizedTextOutput.value;
    
    // 原始文本统计
    originalCharCount.textContent = originalText.length;
    originalWordCount.textContent = originalText.split(/\s+/).filter(word => word.length > 0).length;
    
    // 优化文本统计
    if (optimizedText) {
        optimizedCharCount.textContent = optimizedText.length;
        optimizedWordCount.textContent = optimizedText.split(/\s+/).filter(word => word.length > 0).length;
    } else {
        optimizedCharCount.textContent = '0';
        optimizedWordCount.textContent = '0';
    }
}

// 检查优化按钮状态
function checkOptimizeButtonState() {
    const hasText = optimizeTextInput.value.length >= 50;
    startOptimizeBtn.disabled = !hasText;
}

// 开始优化
async function startOptimization() {
    const textToOptimize = optimizeTextInput.value.trim();
    
    if (!textToOptimize || textToOptimize.length < 50) {
        showNotification('文本内容太短，至少需要50个字符', 'error');
        return;
    }
    
    // 设置加载状态
    setOptimizationLoading(true);
    
    try {
        // 调用后端API（适配Vercel部署）
        const apiUrl = window.location.hostname === 'localhost' 
            ? '/api/optimize' 
            : '/api/optimize';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: textToOptimize
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 显示优化结果
            optimizedTextOutput.value = result.optimized_text;
            updateOptimizeTextStats();
            
            // 显示操作按钮
            outputActions.classList.remove('hidden');
            
            // 显示改进总结
            displayImprovements(result.improvements);
            
            showNotification('文本优化完成！', 'success');
        } else {
            showNotification(result.error || '优化失败，请稍后重试', 'error');
        }
        
    } catch (error) {
        console.error('优化过程中发生错误:', error);
        showNotification('网络错误，请检查后端服务是否启动', 'error');
    } finally {
        setOptimizationLoading(false);
    }
}

// 设置优化加载状态
function setOptimizationLoading(loading) {
    if (loading) {
        startOptimizeBtn.classList.add('loading');
        startOptimizeBtn.innerHTML = '<i class="fas fa-spinner"></i> 优化中...';
        startOptimizeBtn.disabled = true;
    } else {
        startOptimizeBtn.classList.remove('loading');
        startOptimizeBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 开始优化';
        checkOptimizeButtonState();
    }
}

// 显示改进总结
function displayImprovements(improvements) {
    if (!improvements || improvements.length === 0) {
        improvementsSection.classList.add('hidden');
        return;
    }
    
    improvementsList.innerHTML = '';
    
    improvements.forEach(improvement => {
        const item = document.createElement('div');
        item.className = 'improvement-item';
        item.innerHTML = `
            <div class="improvement-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="improvement-text">${improvement}</div>
        `;
        improvementsList.appendChild(item);
    });
    
    improvementsSection.classList.remove('hidden');
}

// 复制优化文本
function copyOptimizedText() {
    const text = optimizedTextOutput.value;
    if (!text) {
        showNotification('没有可复制的内容', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('已复制到剪贴板', 'success');
        
        // 临时改变按钮文本
        const originalText = copyOptimizedBtn.innerHTML;
        copyOptimizedBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        setTimeout(() => {
            copyOptimizedBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动选择文本复制', 'error');
    });
}

// 下载优化文本
function downloadOptimizedText() {
    const text = optimizedTextOutput.value;
    if (!text) {
        showNotification('没有可下载的内容', 'warning');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `优化文本_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('文件下载已开始', 'success');
}

// 导航处理
function handleNavigation(e) {
    e.preventDefault();
    const target = e.target.getAttribute('href');
    
    if (target && target.startsWith('#')) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 关闭按钮事件
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // 自动关闭
    setTimeout(() => {
        if (document.body.contains(notification)) {
            removeNotification(notification);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'info': 'info-circle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'exclamation-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'info': '#3b82f6',
        'success': '#22c55e',
        'warning': '#f59e0b',
        'error': '#ef4444'
    };
    return colors[type] || '#3b82f6';
}

function removeNotification(notification) {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 300);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
    }
    
    .suggestion-item {
        margin-bottom: 1.5rem;
    }
    
    .suggestion-item h5 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .suggestion-itlai ji
        margin-left: 1.5rem;
        color: #555;
    }
    
    .suggestion-item li {
        margin-bottom: 0.5rem;
        line-height: 1.5;
    }
    
    .suggestion-item strong {
        color: #333;
    }
`;
document.head.appendChild(style);
