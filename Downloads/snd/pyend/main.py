from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import ollama
from dotenv import load_dotenv
import os
import fitz  # PyMuPDF for PDF
import docx  # python-docx for DOCX

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Path to store the conversation in a text file
CONVERSATION_FILE = "conversation_history.txt"

# ======== Resume Extraction Helpers ========

def extract_text_from_pdf(filepath):
    try:
        text = ""
        with fitz.open(filepath) as doc:
            for page in doc:
                text += page.get_text()
        return text.strip()
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def extract_text_from_docx(filepath):
    try:
        doc = docx.Document(filepath)
        return "\n".join([para.text for para in doc.paragraphs]).strip()
    except Exception as e:
        return f"Error reading DOCX: {str(e)}"

def extract_resume_content(filepath):
    if filepath.lower().endswith('.pdf'):
        return extract_text_from_pdf(filepath)
    elif filepath.lower().endswith('.docx'):
        return extract_text_from_docx(filepath)
    else:
        return "Unsupported file format."

# ======== Chat API with Text File Conversation Storage ========

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    session_id = request.json.get('session_id')  # Optional session id if you want to extend

    if not user_input:
        return jsonify({"error": "Message is required."}), 400

    # Start with the system message to define AI behavior
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful, knowledgeable AI assistant specializing in resume writing and career advice. "
                "Provide thoughtful, detailed, and professional guidance to help users create strong, polished resumes "
                "that effectively showcase their skills, experience, and achievements."
            )
        }
    ]

    # Read existing conversation from file if exists, and parse into messages
    if os.path.exists(CONVERSATION_FILE):
        try:
            with open(CONVERSATION_FILE, 'r', encoding='utf-8') as file:
                for line in file:
                    line = line.strip()
                    if line.startswith("User:"):
                        # Extract user content and append
                        content = line[len("User:"):].strip()
                        if content:
                            messages.append({"role": "user", "content": content})
                    elif line.startswith("Assistant:"):
                        # Extract assistant content and append
                        content = line[len("Assistant:"):].strip()
                        if content:
                            messages.append({"role": "assistant", "content": content})
        except Exception as e:
            app.logger.error(f"Failed to read conversation history: {str(e)}")
            # Optionally continue with empty conversation

    # Append current user input
    messages.append({"role": "user", "content": user_input})

    try:
        # Call the Ollama chat API with the full conversation
        response = ollama.chat(
            model="llama3.2:3b",
            messages=messages,
            options={
                "temperature": 0.7,
                "top_p": 0.95,
                "max_tokens": 1024
            }
        )

        ai_reply = response['message']['content']

        # Append the new messages to the conversation history file
        try:
            with open(CONVERSATION_FILE, 'a', encoding='utf-8') as file:
                file.write(f"User: {user_input}\nAssistant: {ai_reply}\n")
        except Exception as e:
            app.logger.error(f"Failed to save conversation history: {str(e)}")

        return jsonify({"reply": ai_reply})

    except Exception as e:
        app.logger.error(f"Chat error: {str(e)}")
        return jsonify({"error": f"Chat error: {str(e)}"}), 500


# ======== File Upload and Resume Analysis API ========

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    filename = file.filename

    if filename == '':
        return jsonify({'error': 'No file selected'}), 400

    uploads_dir = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, filename)
    file.save(file_path)

    # Extract and analyze resume content
    resume_text = extract_resume_content(file_path)

    if resume_text.startswith("Error") or resume_text == "Unsupported file format.":
        return jsonify({'error': resume_text}), 400

    try:
        response = ollama.chat(
            model="llama3.2:3b",
            messages=[
                 {
                    "role": "system",
"content": """
You are a powerful and strict resume-analyzing bot. Your job is to provide no-fluff, high-precision feedback. Be blunt, professional, and results-oriented.

Structure your response using the following format:

1. 📊 **Overall Impression**:
   - Write a 2–3 sentence summary of how effective this resume is for recruiters and ATS systems.
   - Include an estimated **ATS score out of 100** based on keyword relevance, formatting, structure, and clarity.

2. 🔴 **Critical Drawbacks**: Directly point out all major issues. Be specific and strict. Do not sugar-coat. Be brutally honest if necessary.

3. 🟡 **Weak Keywords to Replace**: List vague or overused terms that should be replaced with stronger, results-driven alternatives.

4. 🟢 **Must-Have Skills to Add**: Suggest relevant skills missing from the resume, based on current industry/job expectations.

5. ⚙️ **Direct Action Tips**: Provide concise and powerful improvement tips.

Be firm. Your goal is to prepare this resume to compete with the top 5% in the job market.
"""

                },
                {
                    "role": "user",
                    "content": resume_text
                }
            ],
            options={
                "temperature": 0.7,
                "top_p": 0.95,
                "max_tokens": 1024
            }
        )

        ai_reply = response['message']['content']
        with open(CONVERSATION_FILE, 'a', encoding='utf-8') as file:
            file.write(f"User: Uploaded file {filename}\n")
            file.write(f"Assistant: File {filename} uploaded and analyzed.\n")
            file.write(f"Assistant: {ai_reply}\n\n")
        return jsonify({
            'message': f'File {filename} uploaded and analyzed successfully.',
            'analysis': ai_reply
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to analyze resume: {str(e)}'}), 500

# (Optional) Serve uploaded files if needed for preview/download
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    uploads_dir = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(uploads_dir, filename)

# ======== Run App ========

if __name__ == '__main__':
    # Clear the conversation history file when the server starts
    if os.path.exists(CONVERSATION_FILE):
        os.remove(CONVERSATION_FILE)
    
    app.run(debug=True)
