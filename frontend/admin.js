async function fetchSessionIds() {
    try {
        console.log('Fetching sessions...');
        const response = await fetch('http://localhost:3000/api/logs');
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received data:', data);

        const sessionsList = document.getElementById("sessions-list");
        sessionsList.innerHTML = ""; 

        const uniqueSessions = new Set();

        if (!data.logs || data.logs.length === 0) {
            sessionsList.innerHTML = '<div class="info-message">No sessions found.</div>';
            return;
        }

        data.logs.forEach(log => {
            uniqueSessions.add(log.SessionID);
        });

        uniqueSessions.forEach(sessionId => {
            const sessionItem = document.createElement("div");
            sessionItem.className = "session-item";
            sessionItem.innerHTML = `Session ID: ${sessionId}`;
            sessionItem.onclick = () => fetchLogsForSession(sessionId);
            sessionsList.appendChild(sessionItem);
        });
    } catch (error) {
        console.error('Error details:', error);
        const sessionsList = document.getElementById("sessions-list");
        sessionsList.innerHTML = '<div class="error-message">Failed to load sessions. Please try again.</div>';
    }
}

let currentSessionId = null;  // To store the currently displayed session ID

// Fetch logs for a specific session when clicked
async function fetchLogsForSession(sessionId) {
    const messagesLog = document.getElementById("messages-log");
    messagesLog.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const response = await fetch(`http://localhost:3000/api/logs/${sessionId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
  
        //Clear the log area before adding new logs
        messagesLog.innerHTML = '';
  
        // Display logs for the selected session
        data.logs.forEach(log => {
            const logItem = document.createElement("div");
            logItem.className = "message-item";
            logItem.innerHTML = `
                <strong>Session ID: ${log.SessionID}</strong> <br>
                <strong>${log.dt}</strong>: ${log.UserQuery} <br>
                Response: ${log.Response}
            `;
            messagesLog.appendChild(logItem);
        });
  
        // Update the current session ID to the clicked session
        currentSessionId = sessionId;
  
    } catch (error) {
        console.error('Error:', error);
        messagesLog.innerHTML = '<div class="error-message">Failed to load logs. Please try again.</div>';
    }
}

// Call fetchSessionIds to load the sessions when the page is loaded
document.addEventListener("DOMContentLoaded", fetchSessionIds);
  
function goBack() {
    window.history.back(); 
}
  
async function deleteAllLogs() {
    try {
        const confirmation = confirm('Are you sure you want to delete all logs?');
        if (!confirmation) return;  
  
        const response = await fetch('http://localhost:3000/api/deleteAllLogs', { method: 'DELETE' });
  
        if (response.ok) {
            alert('All logs have been deleted.');
            location.reload(); 
        } else {
            alert('Error deleting logs. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting logs. Please try again.');
    }
}