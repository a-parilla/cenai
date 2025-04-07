
# Frontend_Test Project

This project is a chatbot interface that utilizes the OpenAI API to handle user interactions. The project consists of a frontend (HTML, CSS, and JavaScript) and a backend server built with Node.js and Express, with OpenAI API integration for conversational responses.

## Prerequisites

1. **Node.js** (v14 or later)
2. **npm** (Node Package Manager)
3. **OpenAI API Key** – Set this up in a `.env` file (see below).
4. **Assistant ID** – If needed for specific OpenAI configurations.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tabouakar/Frontend_Test.git
   cd Frontend_Test
   ```

2. **Install dependencies:**
   Navigate to the project root directory and install the necessary packages.
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the project root directory and add your OpenAI API key along with any other necessary environment variables.

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ASSISTANT_ID=your_assistant_id_here
   ```

## Project Structure

- `index.html`: Main HTML file for the chatbot interface.
- `styles.css`: Styles for the frontend.
- `app.js`: Frontend JavaScript for handling user input and displaying messages.
- `server.js`: Backend server handling requests and communicating with the OpenAI API.
- `.env`: Environment variables for sensitive information like API keys (should not be shared).

## Running the Project

1. **Start the server:**
   Run the following command in the root directory:
   ```bash
   node server.js
   ```

2. **Access the app:**
   Open a browser and go to [http://localhost:3000](http://localhost:3000) to view the chatbot interface.

## Dependencies

The backend requires the following Node.js packages:

- `express`: Web framework for Node.js.
- `cors`: Middleware to allow cross-origin requests.
- `dotenv`: For loading environment variables from `.env`.
- `openai`: For interacting with the OpenAI API.

Install these packages by running:
```bash
npm install express cors dotenv openai
```

## Notes

- Ensure the `.env` file is added to `.gitignore` to prevent accidental sharing of sensitive information.
- You might need to adjust API configurations in `server.js` to suit your API settings.

## Acknowledgments

This project uses the OpenAI API for generating chatbot responses.


NEW DEPENDENCIES MAC/LINUX:
brew install php

curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

composer require jasig/phpcas  (check if phpcas is installed in the vendor/ folder before doing this, if its there skip this)

npm install cookie-parser

For local Testing:
php -S localhost:8000