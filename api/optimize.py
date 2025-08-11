from http.server import BaseHTTPRequestHandler
import json
import re
from urllib.parse import parse_qs

try:
    import requests
except ImportError:
    # 如果requests不可用，使用urllib作为备选
    import urllib.request
    import urllib.parse
    requests = None

# Gemini API配置
API_KEY = 'AIzaSyDy9pYAEW7e2Ewk__9TCHAD5X_G1VhCtVw'
MODEL_NAME = 'gemini-2.5-flash-lite-preview-06-17'
GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}'

# 文本优化的prompt模板
REFINE_PROMPT_TEMPLATE = """Assist me in revising the following passage to make it more human-like and reduce AI detection probability. Follow these requirements strictly:

Sentence Structure: Keep every sentence with a clear subject. Avoid long or complex sentences. Use short, direct sentences whenever possible.

Vocabulary Simplification: Replace all transition words and connectors with the most basic and commonly used ones (e.g., "but", "and", "so"). Avoid rare or overly academic words.

Synonym Replacement: Substitute uncommon or AI-typical words with more natural and frequently used alternatives while keeping the original meaning. Maintain consistent tone and style across the text.

Voice & Style: Convert passive voice into active voice where appropriate. Balance between formal academic writing and conversational expression. Inject occasional human-like touches such as first-person phrases ("I think", "It seems", "Perhaps") and mild uncertainty markers.

Phrase Expansion & Division: Break down overly long sentences into multiple short ones. Expand short phrases slightly to improve logical flow.

Remove Formulaic AI Phrases: Avoid AI-style endings like "In conclusion" or "Overall". If a transition is needed, use basic connectors such as "also", "therefore", "at the same time".

Target Length: Keep the output around {word_count} words.

Output Requirements:
- Present the rewritten passage in one block without explanations.
- Do not summarize or comment on the text.
- Preserve the meaning but improve readability and naturalness.

Text to Revise:
{text}"""

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """处理CORS预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """处理POST请求"""
        try:
            # 设置CORS头
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # 读取请求数据
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            text = data.get('text', '').strip()
            
            if not text:
                response = {'error': '文本内容不能为空'}
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
                return
            
            if len(text) < 50:
                response = {'error': '文本内容太短，至少需要50个字符'}
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
                return
            
            # 调用优化函数
            result = optimize_text(text)
            
            # 返回结果
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            # 错误处理
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'error': f'服务器错误: {str(e)}'}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

def optimize_text(text):
    """优化文本"""
    try:
        # 计算大致词数
        word_count = len(text.split())
        
        # 构建prompt
        prompt = REFINE_PROMPT_TEMPLATE.format(
            text=text,
            word_count=word_count
        )
        
        # 调用Gemini API
        api_result = call_gemini_api(prompt)
        
        if api_result['success']:
            optimized_text = api_result['text']
            
            # 计算优化前后的统计信息
            original_stats = get_text_stats(text)
            optimized_stats = get_text_stats(optimized_text)
            
            return {
                'success': True,
                'original_text': text,
                'optimized_text': optimized_text,
                'original_stats': original_stats,
                'optimized_stats': optimized_stats,
                'improvements': generate_improvements_summary(original_stats, optimized_stats)
            }
        else:
            return {'success': False, 'error': api_result['error']}
            
    except Exception as e:
        return {'success': False, 'error': f'优化过程中发生错误: {str(e)}'}

def call_gemini_api(prompt):
    """调用Gemini API"""
    try:
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }
        
        if requests:
            # 使用requests库
            headers = {
                'Content-Type': 'application/json'
            }
            response = requests.post(GEMINI_API_URL, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and len(result['candidates']) > 0:
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    return {'success': True, 'text': text.strip()}
                else:
                    return {'success': False, 'error': 'API返回数据格式错误'}
            else:
                error_msg = f'API调用失败，状态码: {response.status_code}'
                if response.text:
                    try:
                        error_data = response.json()
                        if 'error' in error_data:
                            error_msg = error_data['error'].get('message', error_msg)
                    except:
                        pass
                return {'success': False, 'error': error_msg}
        else:
            # 使用urllib作为备选
            import urllib.request
            import urllib.parse
            
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(GEMINI_API_URL, data=data)
            req.add_header('Content-Type', 'application/json')
            
            response = urllib.request.urlopen(req, timeout=30)
            result = json.loads(response.read().decode('utf-8'))
            
            if 'candidates' in result and len(result['candidates']) > 0:
                text = result['candidates'][0]['content']['parts'][0]['text']
                return {'success': True, 'text': text.strip()}
            else:
                return {'success': False, 'error': 'API返回数据格式错误'}
            
    except Exception as e:
        if 'timeout' in str(e).lower():
            return {'success': False, 'error': 'API调用超时，请稍后重试'}
        else:
            return {'success': False, 'error': f'API调用错误: {str(e)}'}

def get_text_stats(text):
    """获取文本统计信息"""
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    words = text.split()
    
    # 计算平均句长
    avg_sentence_length = len(words) / len(sentences) if sentences else 0
    
    # 检测被动语态（简单检测）
    passive_indicators = ['被', 'was', 'were', 'is', 'are', 'been', 'being']
    passive_count = sum(1 for word in words if any(indicator in word.lower() for indicator in passive_indicators))
    
    # 检测复杂词汇（长词）
    complex_words = [word for word in words if len(word) > 6]
    
    # 检测AI常用短语
    ai_phrases = [
        '总之', '综上所述', '总的来说', '总结', 'in conclusion', 'overall', 'in summary',
        '值得注意的是', 'it is worth noting', 'furthermore', 'moreover', 'additionally'
    ]
    ai_phrase_count = sum(1 for phrase in ai_phrases if phrase.lower() in text.lower())
    
    return {
        'char_count': len(text),
        'word_count': len(words),
        'sentence_count': len(sentences),
        'avg_sentence_length': round(avg_sentence_length, 1),
        'passive_count': passive_count,
        'complex_word_count': len(complex_words),
        'ai_phrase_count': ai_phrase_count
    }

def generate_improvements_summary(original, optimized):
    """生成改进总结"""
    improvements = []
    
    # 句子长度改进
    if optimized['avg_sentence_length'] < original['avg_sentence_length']:
        improvements.append(f"平均句长从 {original['avg_sentence_length']} 词缩短至 {optimized['avg_sentence_length']} 词")
    
    # 复杂词汇减少
    if optimized['complex_word_count'] < original['complex_word_count']:
        improvements.append(f"复杂词汇从 {original['complex_word_count']} 个减少至 {optimized['complex_word_count']} 个")
    
    # AI短语减少
    if optimized['ai_phrase_count'] < original['ai_phrase_count']:
        improvements.append(f"AI常用短语从 {original['ai_phrase_count']} 个减少至 {optimized['ai_phrase_count']} 个")
    
    # 被动语态减少
    if optimized['passive_count'] < original['passive_count']:
        improvements.append(f"被动语态使用从 {original['passive_count']} 次减少至 {optimized['passive_count']} 次")
    
    if not improvements:
        improvements.append("文本已进行人性化优化，提升自然度和可读性")
    
    return improvements
