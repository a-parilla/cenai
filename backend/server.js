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

const openai = new OpenAI({
	apiKey : process.env.OPENAI_API_KEY,
});

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

async function ollama_request(model, collection_name, input, res) {
	// First, query Chroma for relevant info:
	const client = new ChromaClient({
		path: "https://cenai.cse.uconn.edu/chroma/"
   	});
 	const t_colls = await client.listCollections();
	const collection = await client.getCollection({
		name: collection_name 
	});
	const results = await collection.query({
		queryTexts: input,
		nResults: 3,
	});
	console.log(results);

	// Then, send the full query to Ollama
	res.setHeader("Content-Type", "text/plain");
	res.setHeader("Transfer-Encoding", "chunked");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();
	userPrompt = `Use this context: ${results.documents[0]}\n To answer this prompt: ${input}`;
	const message = {role: 'user', content: input};

	const ollama = new Ollama({host: 'https://cenai.cse.uconn.edu/ollama/'})
	const assistantResponse = await ollama.chat({model:'gemma3:27b' , messages:[message], stream:true,});
	    
	for await (const chunk of assistantResponse) {
		console.log(chunk.message.content);
		res.write(chunk.message.content);
	}
	res.end();

}

async function chatGPT_request(input, res) {

	const thread = await openai.beta.threads.create();
	await openai.beta.threads.messages.create(
		thread.id,
		{ role: "user", content: input }
	);

	const run = await openai.beta.threads.runs.create(
		thread.id,
		{ assistant_id: process.env.ASSISTANT_ID }
    );

	let runStatus = await openai.beta.threads.runs.retrieve(
		thread.id,
		run.id
	);

	while (runStatus.status !== 'completed') {
		await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
		runStatus = await openai.beta.threads.runs.retrieve(
			thread.id,
			run.id
		);
	}

	const messages = await openai.beta.threads.messages.list(
		thread.id
	);

	for await (const chunk of messages) {
		console.log(chunk.data[0].content[0].text.value);
		res.write(chunk.data[0].content[0].text.value);
	}
	res.end();

	// TODO add logging	
}

app.post('/api/chat', async (req, res) => {
    try {	
        const userInput = req.body.message;
		const model = req.body.model;
		const implementation = req.body.implementation;
		const type = req.body.type;
		if (implementation == "ollama") {
			ollama_request(model, type, userInput, res);
		}
		if (implementation == "chatGPT") {
			chatGPT_request(userInput, res);
		}
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
