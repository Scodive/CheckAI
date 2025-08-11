from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json
import os
import re

app = Flask(__name__)
CORS(app)

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

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/api/optimize', methods=['POST'])
def optimize_text():
    try:
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': '文本内容不能为空'}), 400
        
        if len(text) < 50:
            return jsonify({'error': '文本内容太短，至少需要50个字符'}), 400
        
        # 计算大致词数
        word_count = len(text.split())
        
        # 构建prompt
        prompt = REFINE_PROMPT_TEMPLATE.format(
            text=text,
            word_count=word_count
        )
        
        # 调用Gemini API
        response = call_gemini_api(prompt)
        
        if response['success']:
            optimized_text = response['text']
            
            # 计算优化前后的统计信息
            original_stats = get_text_stats(text)
            optimized_stats = get_text_stats(optimized_text)
            
            return jsonify({
                'success': True,
                'original_text': text,
                'optimized_text': optimized_text,
                'original_stats': original_stats,
                'optimized_stats': optimized_stats,
                'improvements': generate_improvements_summary(original_stats, optimized_stats)
            })
        else:
            return jsonify({'error': response['error']}), 500
            
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

def call_gemini_api(prompt):
    """调用Gemini API"""
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        
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
            
    except requests.exceptions.Timeout:
        return {'success': False, 'error': 'API调用超时，请稍后重试'}
    except requests.exceptions.RequestException as e:
        return {'success': False, 'error': f'网络请求错误: {str(e)}'}
    except Exception as e:
        return {'success': False, 'error': f'未知错误: {str(e)}'}

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

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Paper Check API'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
