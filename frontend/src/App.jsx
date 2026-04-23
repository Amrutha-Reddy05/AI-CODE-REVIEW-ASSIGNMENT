import { useState } from "react";
import Editor from "react-simple-code-editor";
const CodeEditor = Editor?.default || Editor;

import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { Play, Code2, AlertCircle, CheckCircle2, Paintbrush, Loader2, Shield, Zap } from "lucide-react";



export default function App() {
  const [code, setCode] = useState(`function sayHello() {\n  console.log("Hello World")\n}`);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeCode = async () => {
  setLoading(true);
  setError(null);
  setResult(null);

  try {
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from backend");
    }

    if (data.error) {
      setError(data.error);
    } else {
      setResult(data);
    }

  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="app-container">
      <header className="header glass-header">
        <div className="header-title">
          <Code2 size={24} color="#a855f7" />
          AI Code Reviewer
        </div>
        <button 
          className="btn" 
          onClick={analyzeCode}
          disabled={loading || !code.trim()}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
          {loading ? "Analyzing..." : "Analyze Code"}
        </button>
      </header>

      <main className="main-content">
        <section className="editor-pane glass-panel">
          <div className="editor-header">
            <span>Input Code</span>
          </div>
          <CodeEditor
            value={code}
            onValueChange={setCode}
            highlight={(code) => highlight(code, languages.javascript, 'javascript')}
            padding={20}
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
              minHeight: '300px',
            }}
          />


        </section>

        <section className="results-pane glass-panel">
          <div className="editor-header">
            <span>AI Feedback</span>
          </div>

          <div className="results-content">
            {loading && (
              <div className="loader">
                <Loader2 size={40} className="spin" />
                <p>Analyzing...</p>
              </div>
            )}

            {error && (
              <div className="empty-state" style={{ color: "red" }}>
                <AlertCircle size={40} />
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && !result && (
              <div className="empty-state">
                <p>Paste code and click Analyze</p>
              </div>
            )}

            {result && (
              <>
                {result.bugs?.length > 0 && (
                  <div>
                    <h3><AlertCircle size={16}/> Bugs</h3>
                    <ul>{result.bugs.map((b, i) => <li key={i}>{b}</li>)}</ul>
                  </div>
                )}

                {result.improvements?.length > 0 && (
                  <div>
                    <h3><CheckCircle2 size={16}/> Improvements</h3>
                    <ul>{result.improvements.map((b, i) => <li key={i}>{b}</li>)}</ul>
                  </div>
                )}

                {result.style?.length > 0 && (
                  <div>
                    <h3><Paintbrush size={16}/> Style</h3>
                    <ul>{result.style.map((b, i) => <li key={i}>{b}</li>)}</ul>
                  </div>
                )}

                {result.security?.length > 0 && (
                  <div>
                    <h3><Shield size={16}/> Security</h3>
                    <ul>{result.security.map((b, i) => <li key={i}>{b}</li>)}</ul>
                  </div>
                )}

                {result.performance?.length > 0 && (
                  <div>
                    <h3><Zap size={16}/> Performance</h3>
                    <ul>{result.performance.map((b, i) => <li key={i}>{b}</li>)}</ul>
                  </div>
                )}
              
                {result && Object.values(result).every(arr => arr.length === 0) && (
                <p>No issues found 🎉</p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}