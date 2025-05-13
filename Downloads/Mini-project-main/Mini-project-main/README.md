# 🛡️ Chhava

**Chhava** is an AI-powered web application that provides concise, bullet-point financial insights based on user queries and contextual news data. It leverages the MERN stack for the frontend and backend, with a Python service handling AI-driven responses.

---

## 🧰 Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js, Python (Flask)
- **AI Service**: Python (Flask), Ollama with LLaMA 3.2 model

---

## 📁 Project Structure

```
Chhava/
├── backend/          # Express.js server
├── frontend/         # React.js application
├── pyend/            # Python AI service
├── news.txt          # News context file
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Python 3.8+
- Ollama installed with LLaMA 3.2 model

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ImAust1n/44Chaava.git
   cd 44Chaava
   ```

2. **Setup the Frontend**

   ```bash
   cd frontend
   npm install
   npm run start
   ```

3. **Setup the Backend**

   ```bash
   cd ../backend
   npm install
   npm run start
   ```

4. **Setup the .env file**

5. **Setup the Python AI Service**

   ```bash
   cd ../pyend
   pip install -r requirements.txt
   pip install googlesearch-python
   python app.py
   ```

---

**Example Format:**

```
Intel’s Q1 earnings fell short of analyst expectations due to weak PC demand...

Source: CNBC
Time: April 11, 2025
```

---

## 📬 API Endpoint

- POST `/api/email`
- POST `/api/chat`
- POST `/api/chat3`

**Request Body:**

```json
{
  "message": "Why is NIFTY down?"
}
```

**Response:**

```json
{
  "response": "• Global cues impacted Indian markets...\n• Investors cautious post Fed announcement...\n(Source: CNBC, Time: April 11, 2025)"
}
```

---

## 🧠 AI Service Details

The Python AI service reads the `news.txt` file and uses the Ollama API with the LLaMA 3.2 model to generate concise, bullet-point answers to user queries. It ensures that responses are contextually relevant and include the source and time of the news report.

---

## 📌 Notes

- Ensure that the Ollama service is running and accessible to the Python AI service.
- The `news.txt` file should be updated regularly with the latest news content to provide accurate responses.
# Mini-project
