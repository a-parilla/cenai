# CenAI

This repository includes the source code for hosting the CenAI chatbot webpage. 
This includes the php server for login, and the node-based website.
Importantly, this repository does NOT include the resources for hosting the
Ollama instance, nor the resources to host the ChromaDB server.

## Installing dependencies

Below are the instructions for installing dependencies. If you add more dependencies,
please make sure to gitignore them (but include instructions for installing them here.)


1. *Install npm dependencies*: Use npm to install node dependencies:
```
npm install
``` 

2. *Install php*: Use the following commands to install php/php dependencies
(our vm uses apt instead of brew):
```
sudo apt-get install php composer
composer require jasig/phpcas
```

## Run the server

Use a tmux terminal (or equivalent) and serve the node and php servers.
On our vm, nginx is configured for php to run on :9000, and for
node to run on :10000. You will also have to host the LLM and ChromaDB servers.
```
sudo npm start 
cd php
sudo php -S localhost:9000
```
