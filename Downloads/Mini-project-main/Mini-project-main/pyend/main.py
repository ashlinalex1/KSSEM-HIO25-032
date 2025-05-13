from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    
    if not user_input:
        return jsonify({"error": "Message is required."}), 400

    try:
        # Generate response using Ollama
        response = ollama.chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful, knowledgeable AI assistant specializing in resume writing and career advice. Provide thoughtful, detailed, and professional guidance to help users create strong, polished resumes that effectively showcase their skills, experience, and achievements."
                },
                {
                    "role": "user",
                    "content": user_input
                }
            ],
            options={
                "temperature": 0.7,
                "top_p": 0.95,
                "max_tokens": 1024
            }
        )
        
        return jsonify({
            "reply": response['message']['content']
        })

    except Exception as e:
        return jsonify({"error": f"Chat error: {str(e)}"}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    uploads_dir = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    file.save(file_path)

    return jsonify({'message': f'File {file.filename} uploaded successfully.'}), 200

if __name__ == '__main__':
    app.run(debug=True)