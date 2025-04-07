<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CENAI</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Roboto', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f9f9f9;
        }

        .container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 50%;
            max-width: 800px;
            position: relative;
            top: -50px; /* Moves everything slightly upward */
        }

        .left-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        h1 {
            font-size: 50px;
            font-weight: 900;
            margin-bottom: 15px;
        }

        .description {
            font-size: 20px;
            color: gray;
            white-space: nowrap;
            overflow: hidden;
            display: flex;
            align-items: center;
        }

        .cursor {
            display: inline-block;
            width: 10px;
            height: 24px;
            background-color: black;
            margin-left: 5px;
            animation: blink 0.8s infinite; /* Slower blinking */
        }

        @keyframes blink {
            50% { opacity: 0; }
        }

        .login-btn {
            padding: 15px 30px;
            font-size: 20px;
            border: 2px solid gray;
            background-color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .login-btn:hover {
            background-color: #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="left-section">
            <h1>CENAI</h1>
            <p class="description" id="typing-text"><span id="cursor" class="cursor"></span></p>
            </div>
            <a href="login.php">
        <button class="login-btn">Log In</button>
    </a>
</div>


    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const text = "Useful for quick answers regarding CEN documentation.";
            let index = 0;
            const typingText = document.getElementById("typing-text");
            const cursor = document.getElementById("cursor");

            function typeText() {
                if (index < text.length) {
                    typingText.innerHTML = text.substring(0, index + 1) + '<span id="cursor" class="cursor"></span>';
                    index++;
                    setTimeout(typeText, 50);
                } else {
                    cursor.style.animation = "blink 0.8s infinite"; // Cursor keeps blinking after typing
                }
            }

            setTimeout(typeText, 500);
        });
    </script>
</body>
</html>
