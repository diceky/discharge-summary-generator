from openai import OpenAI
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

system_prompt = {
    "role": "system",
    "content": [
        {
            "type": "text",
            "text": "You are a helpful medical advisor. Follow the instructions and provide responses to the best of your knowledge."
        }
    ]
}

messages = []
messages.append(system_prompt)

def add_message(role, message, history):
    history.append({"role": role, "content": message})

def converse_with_chatGPT(messagesWithHistory):
    model_engine = "gpt-4o"
    response = client.chat.completions.create(
        model=model_engine,
        messages=messagesWithHistory,
        temperature=0,
        max_tokens = 2048, # this is the maximum number of tokens that can be used to provide a response.
        top_p = 1,
        frequency_penalty=0,
        presence_penalty=0,
    )
    message = response.choices[0].message.content
    return message.strip()

@app.route('/getResponse', methods=['POST'])
def get_response():
    if request.method == "POST":
        content = request.json
        if 'message' in content:
            allMessages = content['message']
            result = converse_with_chatGPT(allMessages)
        return jsonify(result)

@app.route('/getResponseWithHistory', methods=['POST'])
def get_response_with_history():
    global messages
    if request.method == "POST":
        content = request.json
        if 'message' in content:
            newMessage = content['message']
            add_message("user", newMessage, messages)
            result = converse_with_chatGPT(messages)
            add_message("assistant", result, messages)
        return jsonify(messages)
    

@app.route('/reset', methods=['GET'])
def reset():
    global messages
    messages.clear()
    messages.append(system_prompt)
    return jsonify({'response': "Server-side messages reset"})

if __name__ == "__main__":
    app.run() #add host='0.0.0.0' as parameter to access from other local PCs