document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const chatContainer = document.getElementById('chat-container'); // Main chat area

    // Get the current page URL
    const currentPage = window.location.pathname;

    // Highlight the correct tab based on the current page
    if (document.getElementById("hr-tab") && currentPage.includes("hr.html")) {
        document.getElementById("hr-tab").classList.add("active");
    } else if (document.getElementById("cisco-tab") && currentPage.includes("cisco.html")) {
        document.getElementById("cisco-tab").classList.add("active");
    }

    if (document.getElementById("hrds-tab") && currentPage.includes("hrds.html")) {
        document.getElementById("hrds-tab").classList.add("active");
    } else if (document.getElementById("ciscods-tab") && currentPage.includes("ciscods.html")) {
        document.getElementById("ciscods-tab").classList.add("active");
    }
    

    // Dynamic Textarea Expansion
    userInput.addEventListener("input", function () {
        this.style.height = "auto"; // Reset height first
        this.style.height = Math.min(this.scrollHeight, 300) + "px"; // Expand up to 10 lines (300px)

        // Enable scrollbar if it reaches the max height
        if (this.scrollHeight > 300) {
            this.style.overflowY = "auto"; // Show scrollbar
        } else {
            this.style.overflowY = "hidden"; // Hide scrollbar
        }
    });

    // Determine which page the user is on (HR or Cisco)
    let category = currentPage.includes("cisco.html") ? "cisco" : "hr";

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Create a chat message container
        const chatEntry = document.createElement('div');
        chatEntry.classList.add('chat-entry');

        // Create and display the user message (right side)
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.textContent = message;
        chatEntry.appendChild(userMessageDiv);

        // Append user message to chat container
        chatContainer.appendChild(chatEntry);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to latest message

        // Clear input but keep focus
        userInput.value = '';
        userInput.style.height = "40px"; // Reset input size
        userInput.focus();

        try {
            // API endpoint for ChatGPT
            const chatgptAPI = `http://localhost:8000/api/chatgpt?category=${category}`;

            // Send request to ChatGPT model
            const response = await fetch(chatgptAPI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: message })
            });

            const data = await response.json();

            // Create and display the ChatGPT response (left side)
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot-message';
            botMessageDiv.textContent = data.response || "No response";
            chatEntry.appendChild(botMessageDiv);

        } catch (error) {
            console.error("Error fetching response:", error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = "Error fetching response.";
            chatEntry.appendChild(errorDiv);
        }

        // Scroll to the bottom after response
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Add click event listener to send button
    document.querySelector('.send-btn').addEventListener('click', sendMessage);

    // Add enter key event listener to input field
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
});

function logout() {
    // Redirect to logout.php
    window.location.href = "//cenai.cse.uconn.edu/logout.php";
}

 /*fetch('http://localhost:8000/php/netid.php') // Adjust path to your PHP endpoint
                   .then(response => response.json())
                   .then(data => {
                       // Set the netid in the DOM
                       document.getElementById("netid").innerText = data.netid;
                   })
                   
                   .catch(error => console.error('Error fetching NetID:', error));
                   */
document.getElementById('userInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const centerMessage = document.getElementById('center-message');
        centerMessage.classList.add('blink-out');
    }
});

document.querySelector('.send-btn').addEventListener('click', function() {
    const centerMessage = document.getElementById('center-message');
    centerMessage.classList.add('blink-out');
});
                
