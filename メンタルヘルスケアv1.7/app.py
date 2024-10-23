# app.py
from flask import Flask, render_template, request, jsonify
import openai

app = Flask(__name__)

# OpenAI APIキーを設定
openai.api_key = 'YOUR_API_KEY'

@app.route('/')
def index():
    return render_template('index.html')  # index.htmlをレンダリング

@app.route('/ask', methods=['POST'])
def ask():
    question = request.form['question']  # フォームから質問を取得
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=question,
        max_tokens=150
    )
    answer = response.choices[0].text.strip()  # ChatGPTの回答を取得
    return jsonify({'answer': answer})  # 回答をJSON形式で返す

if __name__ == '__main__':
    app.run(debug=True)  # デバッグモードでアプリを実行
