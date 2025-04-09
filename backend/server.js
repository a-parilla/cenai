const path = require('path');
const express = require('express');
const OpenAI = require('openai');
const sqlite3 = require('sqlite3');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { spawn } = require('child_process');
const { Ollama } = require('ollama');
const { ChromaClient } = require('chromadb');

console.log('Directory name:', __dirname);
console.log('Full .env path:', path.join(__dirname, '../.env'));
require('dotenv').config({ path: path.join(__dirname, '../.env') });
console.log('Environment variables loaded:', {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
    ASSISTANT_ID: process.env.ASSISTANT_ID ? 'Present' : 'Missing'
});

const app = express();
app.use(express.json());

// Session management for logging
app.use(session({
    secret: 'random_string', // TODO: Replace with a secure secret
    resave: false,
    saveUninitialized: true
}));

app.use(cookieParser());
app.use((req, res, next) => {
    const authUser = req.cookies.auth_user; // Read cookie from request

    if (!authUser) {
        return res.redirect('//cenai.cse.uconn.edu/');
    }

    // Store user in session
    req.session.user = authUser; 
    next();
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Configure sqlite
const db = new sqlite3.Database('chat.logs');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Logs (
        SessionID TEXT, 
        dt DATETIME DEFAULT CURRENT_TIMESTAMP, 
        UserQuery TEXT, 
        Response TEXT
    )`);
});

app.post('/api/chat', async (req, res) => {
    try {	
        const userInput = req.body.message;

	// First, query Chroma for relevant info:
	const client = new ChromaClient({
		path: "https://cenai.cse.uconn.edu/chroma/"
   	});
 	const t_colls = await client.listCollections();
	const collection = await client.getCollection({
		name: "ethics"
	});
	const results = await collection.query({
		queryTexts: userInput,
		nResults: 3,
	});
	console.log(results);

	// Then, send the full query to Ollama
	res.setHeader("Content-Type", "text/plain");
	res.setHeader("Transfer-Encoding", "chunked");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();
	userPrompt = `Use this context: ${results.documents[0]}\n To answer this prompt: ${userInput}`;
	const message = {role: 'user', content: userInput};

	const ollama = new Ollama({host: 'https://cenai.cse.uconn.edu/ollama/'})
	const assistantResponse = await ollama.chat({model:'gemma3:27b' , messages:[message], stream:true,});
	    
	for await (const chunk of assistantResponse) {
		console.log(chunk.message.content);
		res.write(chunk.message.content);
	}
	res.end();
	} catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/logs', (req, res) => {
    db.all("SELECT * FROM Logs ORDER BY dt DESC", (err, rows) => {
        if (err) {
            console.error('Error fetching logs:', err);
            return res.status(500).json({ error: 'Failed to fetch logs' });
        }
        res.json({ logs: rows });
    });
});

app.get('/api/logs/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    db.all("SELECT * FROM Logs WHERE SessionID = ? ORDER BY dt DESC", [sessionId], (err, rows) => {
        if (err) {
            console.error('Error fetching logs:', err);
            return res.status(500).json({ error: 'Failed to fetch logs' });
        }
        res.json({ logs: rows });
    });
});

app.delete('/api/deleteAllLogs', (req, res) => {
    db.run("DELETE FROM Logs", function(err) {
        if (err) {
            console.error('Error deleting logs:', err);
            return res.status(500).json({ error: 'Failed to delete logs' });
        }
        res.status(200).json({ message: 'All logs deleted' });
    });
});

const PORT = 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Langchain experiment API Post

app.post('/api/rag-chat', async (req, res) => {
    try {
        const userInput = req.body.message;
        const chatHistory = req.body.chatHistory || [];

        // Spawn Python process
        const pythonProcess = spawn('python', ['langchain_experiment.py']);
        
        let response = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            response += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                res.status(500).json({ error: error });
                return;
            }
            res.json({ response: response });
        });

        // Send the question to the Python process
        pythonProcess.stdin.write(userInput + '\n');
        pythonProcess.stdin.end();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});
