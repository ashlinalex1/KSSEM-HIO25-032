from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
from dotenv import load_dotenv
import os
import docx
import PyPDF2
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(filepath):
    text = ""
    with open(filepath, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(filepath):
    text = ""
    doc = docx.Document(filepath)
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.form.get('message')
    file = request.files.get('file')

    if not user_input and not file:
        return jsonify({"error": "Either message or file is required."}), 400

    extracted_text = ""

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        if filename.endswith('.pdf'):
            extracted_text = extract_text_from_pdf(filepath)
        elif filename.endswith('.docx'):
            extracted_text = extract_text_from_docx(filepath)
    else:
        if file:
            return jsonify({"error": "Unsupported file format. Only PDF and DOCX are allowed."}), 400

    try:
        # Prepare conversation context
        system_prompt = (
            "You are a helpful, knowledgeable AI assistant specializing in resume writing and career advice. "
            "Provide thoughtful, detailed, and professional guidance to help users create strong, polished resumes "
            "that effectively showcase their skills, experience, and achievements."
        )
        messages = [{"role": "system", "content": system_prompt}]
        
        if extracted_text:
            messages.append({
                "role": "user",
                "content": f"Here is my resume content:\n{extracted_text}\n\nPlease analyze it and provide suggestions for improvement."
            })
        if user_input:
            messages.append({
                "role": "user",
                "content": user_input
            })

        # Generate response using Ollama
        response = ollama.chat(
            model="llama3.2:3b",
            messages=messages,
            options={
                "temperature": 0.7,
                "top_p": 0.95,
                "max_tokens": 1024
            }
        )
        
        return jsonify({
            "response": response['message']['content']
        })

    except Exception as e:
        return jsonify({"error": f"Chat error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
