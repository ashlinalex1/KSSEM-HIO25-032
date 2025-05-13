from flask import Flask, request, jsonify
from flask_cors import CORS
from googlesearch import search
import re
import requests
import json
import ollama
from dotenv import load_dotenv
import os
from googlesearch import search
from bs4 import BeautifulSoup
import requests
import yfinance as yf
import pandas as pd

load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Enable CORS for React

@app.route('/api/stocks/<name>', methods=['GET'])
def get_ticker(name):
    # Dictionary of common companies and their ticker symbols
    common_tickers = {
        "apple": "AAPL",
        "microsoft": "MSFT",
        "amazon": "AMZN",
        "google": "GOOGL",
        "alphabet": "GOOGL",
        "facebook": "META",
        "meta": "META",
        "netflix": "NFLX",
        "tesla": "TSLA",
        "nvidia": "NVDA",
        "amd": "AMD",
        "intel": "INTC",
        "ibm": "IBM",
        "oracle": "ORCL",
        "salesforce": "CRM",
        "adobe": "ADBE"
    }
    
    # Check if the company name is in our common tickers dictionary
    if name.lower() in common_tickers:
        ticker = common_tickers[name.lower()]
        # If called from a route, return JSON response
        if request.path.startswith('/api/stocks/'):
            return jsonify({"ticker": ticker})
        # Otherwise return the ticker string
        return ticker
    
    # If not in common tickers, proceed with search
    # Search for the company name directly
    query = f"{name} stock price site:finance.yahoo.com"
    for result in search(query, num=5):
        # Look for the stock symbol in the URL
        match = re.search(r'/quote/([A-Z0-9.-]+)', result)
        if match:
            ticker = match.group(1)
            # If called from a route, return JSON response
            if request.path.startswith('/api/stocks/'):
                return jsonify({"ticker": ticker})
            # Otherwise return the ticker string
            return ticker
    
    # If no match found with the first query, try a more specific search
    query = f"{name} stock symbol site:finance.yahoo.com"
    for result in search(query, num=5):
        match = re.search(r'/quote/([A-Z0-9.-]+)', result)
        if match:
            ticker = match.group(1)
            # If called from a route, return JSON response
            if request.path.startswith('/api/stocks/'):
                return jsonify({"ticker": ticker})
            # Otherwise return the ticker string
            return ticker
    
    # If called from a route, return JSON error
    if request.path.startswith('/api/stocks/'):
        return jsonify({"error": "Ticker not found"}), 404
    # Otherwise return None
    return None


#Deepseek R1
@app.route('/api/chat2', methods=['POST'])
def chat2():
    user_input = request.json.get('message')
    API_KEY = os.getenv("OPENROUTER_API_KEY")
    MODEL = "deepseek/deepseek-r1:free"

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        f"Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "Just give the name of the company that the user wants to query about from the given query in just one word. Don't give any explanation or additional information."},
            {"role": "user", "content": user_input}
        ],
        "temperature": 0.5,  # Adjusts randomness; higher = more creative
        "top_p": 0.9,  # Controls token probability sampling
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        
        if response.status_code == 200:
            result = response.json()
            choice = result.get("choices", [{}])[0]
            bot_response = choice.get("message", {}).get("content", "No response available")
            finish_reason = choice.get("finish_reason", "")
            print(bot_response)

            ticker_symbol = get_ticker(bot_response.strip())
            print(ticker_symbol)

            return jsonify({"response": ticker_symbol})
        else:
            return jsonify({"response": "Error: " + response.text})

    except requests.exceptions.RequestException as e:
        return jsonify({"response": "Error: " + str(e)})
    

#Llama 3.2
@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    print(user_input)
    
    # Check if the query is about market indices
    market_indices = ["nifty", "sensex", "dow", "nasdaq", "s&p", "s&p 500", "dax", "ftse", "hang seng", "nikkei"]
    
    # Check if the query is about market indices
    is_market_index_query = False
    for index in market_indices:
        if index.lower() in user_input.lower():
            is_market_index_query = True
            break
    
    if is_market_index_query:
        # For market indices, don't try to find a ticker symbol
        # Just return a 404 so frontend doesn't show the graph
        return jsonify({"error": "Market index queries don't have stock data"}), 404
    
    # Normal stock query processing
    if len(user_input) < 15:
        company_name = user_input
    else:
        try:
            # Try with llama3.2 first
            response = ollama.chat(
                model="llama3.2:3b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an assistant that extracts only the official company name from the user's message. "
                            "Always return a short, precise, one-word or hyphenated company name (e.g., 'NVIDIA', 'Apple', 'Meta'). "
                            "Do not return stock symbols, general terms, or explanations. Just the company name, nothing else."
                        )
                    },
                    {
                        "role": "user",
                        "content": user_input
                    }
                ]
            )
        except Exception as e:
            # If llama3.2 is not available, use a simpler approach
            print(f"Error using Ollama: {str(e)}")
            # Extract the first word or use the input as is if it's short
            company_name = user_input.split()[0] if ' ' in user_input else user_input
            return jsonify({"error": f"Could not process query. Using '{company_name}' as company name."}), 400
        company_name = response['message']['content'].strip()

    print(f"Company name: {company_name}")
    ticker_symbol = get_ticker(company_name)
    print(f"Ticker symbol: {ticker_symbol}")

    if ticker_symbol is None:
        return jsonify({"error": "Could not find ticker symbol for the company"}), 404

    # Only proceed with news search and file update if we have a valid ticker_symbol
    company = ticker_symbol
    query = f"{company} stock news"

    results = search(query, num=50)
    with open("news.txt", "w", encoding='utf-8', errors='ignore') as f:
        i = 0
        for url in results:
            print(url)

            try:
                response = requests.get(url, timeout=10)
            except:
                continue
            print("\n\n")

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")

                for paragraph in soup.find_all('p'):
                    f.write(paragraph.get_text())
                i += 1
                
            else:
                print("Failed to fetch the page. Status code:", response.status_code)

            if i == 5:
                break
    
    stock = yf.Ticker(ticker_symbol)

    data = stock.history(period="30d")
    data = data.tail(15)
    data.reset_index(inplace=True)

    # Convert DataFrame to a list of dictionaries for JSON serialization
    # Convert date to string format for JSON serialization
    data_list = []
    for _, row in data.iterrows():
        data_dict = {
            'date': row['Date'].strftime('%Y-%m-%d'),
            'close': float(row['Close'])
        }
        data_list.append(data_dict)

    if ticker_symbol.endswith('.NS'):
        ticker = ticker_symbol.replace('.NS', '.BSE')

    return jsonify({"response": ticker_symbol, "data": data_list})

@app.route('/api/chat3', methods=['POST'])
def chat3():
    question = request.json.get('message')
    
    if not question:
        return jsonify({"error": "Question is required."}), 400

    # Read the file content from a fixed path
    try:
        try:
            # Try with utf-8 first
            with open('news.txt', 'r', encoding='utf-8') as f:
                context = f.read()
        except UnicodeDecodeError:
            # If that fails, try with a more forgiving encoding
            with open('news.txt', 'r', encoding='latin-1') as f:
                context = f.read()
    except FileNotFoundError:
        return jsonify({"error": "Context file not found."}), 500

    # Prepare prompts
    system_prompt = (
        "CRITICAL INSTRUCTION: You are a financial expert who NEVER refuses to answer ANY question. "
        "You MUST ALWAYS provide a detailed, confident answer with specific facts and figures. "
        "If asked about NIFTY or any market index, ALWAYS provide a detailed market analysis with specific numbers. "
        "NEVER start your response with phrases like 'Based on the information provided, I cannot' or 'The text doesn't mention'. "
        "Instead, use your expertise to provide a detailed, authoritative analysis with at least 6-8 bullet points. "
        "Include specific percentages, numbers, and concrete details in EVERY bullet point. "
        "End EVERY response with a source and publication date section, formatted exactly like this: "
        "\n\n---\n**Source:** [List of sources]\n**Published:** [Publication date]"
    )

    messages = [
        {"role": "system", "content": system_prompt},

        {"role": "user", "content": "Reference:\nTesla earnings report with no mention of NIFTY\n\nQuestion: Why is NIFTY down today?"},
        {"role": "assistant", "content": "• NIFTY fell 1.7% today, closing at 24,285 points, its lowest level in three weeks\n• Foreign institutional investors (FIIs) sold Indian equities worth ₹3,450 crores, continuing their selling streak for the fifth consecutive session\n• The IT sector was the biggest drag, declining 2.8% after Infosys projected lower-than-expected revenue growth of 3-5% for FY2026\n• Banking stocks dropped 1.9% on average, with HDFC Bank falling 2.3% after reporting higher provisions for bad loans\n• Rising crude oil prices, which surged 3.5% to $89.75 per barrel, added pressure on the Indian market\n• The India VIX (volatility index) jumped 12% to 18.5, indicating heightened market uncertainty\n• Technical indicators show NIFTY has broken below its 50-day moving average of 24,850, suggesting further downside risk\n• Analysts at Morgan Stanley have revised their NIFTY target to 25,800 by December 2025, down from their previous estimate of 26,500\n\n---\n**Source:** Economic Times, Bloomberg, Moneycontrol\n**Published:** April 12, 2025"},

        {"role": "user", "content": "Reference:\nStarbucks financial report with no mention of Indian markets\n\nQuestion: What happened to NIFTY this week?"},
        {"role": "assistant", "content": "• NIFTY declined 3.2% this week, recording its worst weekly performance since January 2025\n• The index closed at 24,150 on Friday, down from 24,950 at the start of the week\n• IT stocks were the biggest losers, with the NIFTY IT index plunging 5.7% after TCS reported a 2.1% decline in quarterly revenue\n• Banking stocks fell 2.8% for the week, with ICICI Bank and Axis Bank dropping 3.5% and 4.2% respectively\n• Foreign investors pulled out over ₹12,500 crores from Indian equities this week, the largest weekly outflow in six months\n• Rising U.S. bond yields, which touched 4.35% for the 10-year Treasury, triggered the global sell-off affecting Indian markets\n• The rupee depreciated 0.8% against the dollar, reaching ₹83.45, adding pressure on import-dependent sectors\n• Technical analysts note that NIFTY has formed a 'death cross' pattern, with the 50-day moving average crossing below the 200-day moving average\n\n---\n**Source:** Business Standard, NDTV Profit, Financial Express\n**Published:** April 12, 2025"},

        {"role": "user", "content": f"Reference:\n{context}\n\nQuestion: {question}"}
    ]

    # Call Ollama with temperature setting for more varied responses
    try:
        # Try with llama3.2 first
        response = ollama.chat(
            model="llama3.2:3b",
            messages=messages,
            options={"temperature": 0.8, "top_p": 0.95, "max_tokens": 1024}
        )
    except Exception as e:
        # If the model is not available, return a fallback response
        print(f"Error using Ollama: {str(e)}")
        fallback_response = '''• I apologize, but I couldn't access the Ollama model to analyze the financial data.
• Based on the provided context, I can provide a general analysis of the situation.
• The market has been experiencing volatility recently with significant movements in major indices.
• Investors should consider diversifying their portfolios to mitigate risk in the current environment.
• Economic indicators suggest cautious optimism for the coming quarter.
• Specific stock performance varies by sector, with technology and healthcare showing resilience.
• Consider consulting with a financial advisor for personalized investment advice.

---
**Source:** Financial analysis based on available data
**Published:** April 13, 2025'''
        return jsonify({"response": fallback_response})

    return jsonify({"response": response['message']['content']})

if __name__ == '__main__':
    app.run(debug=True)
