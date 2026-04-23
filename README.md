# AI Code Reviewer

An AI-powered code review tool that analyzes code and provides actionable feedback on bugs, improvements, style, security, and performance.

## Project Setup Instructions

### Backend (FastAPI + Python)
1. Navigate to the `backend` directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file in the `backend` directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```
6. Start the server: `uvicorn main:app --reload`
   The backend will run at `http://127.0.0.1:8000`.

### Frontend (React + Vite)
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
   The frontend will run at `http://localhost:5173`.

## Architecture / Flow Explanation

- **Frontend**: A React application built with Vite. It features a code editor (using `react-simple-code-editor` and `prismjs` for syntax highlighting) where users can input code. Upon clicking "Analyze Code", it sends a REST POST request to the backend.
- **Backend**: A FastAPI application in Python. It receives the code, wraps it in a customized system prompt, and sends it to the OpenAI API using the official OpenAI Python SDK.
- **AI Processing**: The OpenAI model (GPT-4o-mini) evaluates the code and returns structured JSON containing various review categories.
- **Result Display**: The frontend receives the JSON payload and dynamically renders it into visual categories with corresponding icons and styling.

## AI Tools and Models Used
- **Model**: OpenAI `gpt-4o-mini`
- **SDK**: OpenAI Python SDK
- **Usage**: Used to process code snippets and generate structured, strict JSON responses for automated code review.

## Prompts Used
The following prompt is dynamically populated and sent to the model:

```text
You are a senior software engineer performing a code review.

Analyze the given code and return output in STRICT JSON format:

{
  "overall_quality": "Provide a brief summary and a score out of 10",
  "bugs": [],
  "improvements": [],
  "style": [],
  "security": [],
  "performance": []
}

Rules:
- Be concise
- Output must be exactly in the requested JSON format
- Highlight any security vulnerabilities
- Suggest performance improvements

Code:
<user_input_code_here>
```

## How Incorrect or Misleading Suggestions Were Handled
To minimize hallucinations and misleading advice, the prompt strictly defines the output format as JSON and instructs the AI to be concise and act as a senior software engineer. The use of `response_format={ "type": "json_object" }` enforces structural conformity, meaning if the AI is uncertain about an issue, it typically returns an empty list for that category rather than generating unstructured or speculative text.

## Limitations
- **Context Window Limits**: Can only analyze single snippets of code up to the token limit of the model. It lacks cross-file project context.
- **Latency**: API calls to OpenAI can introduce a few seconds of delay depending on network and model load.
- **Language Bias**: May perform better on widely-used languages (JavaScript, Python) compared to niche languages.

## Possible Improvements
- **Multi-file Support**: Allow uploading multiple files or a zip archive to provide better context.
- **Syntax Highlighting for Output**: Allow code snippets to be returned inside the feedback and highlight them in the UI.
- **User Authentication & History**: Add a database to save past code reviews for registered users.
- **Model Selection**: Let the user choose between different models (e.g., Claude, local Ollama models) based on their preference or data privacy needs.
