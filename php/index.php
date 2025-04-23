<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
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
      padding: 20px;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 800px;
      position: relative;
      top: -50px;
      gap: 40px;
      flex-wrap: wrap;
    }

    .left-section {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1 1 300px;
    }

    h1 {
      font-size: 50px;
      font-weight: 900;
      margin-bottom: 15px;
    }

    .description {
      font-size: 20px;
      color: gray;
      display: flex;
      align-items: center;
      min-height: 28px;
    }

    #typed-text {
      white-space: nowrap;
      overflow: hidden;
    }

    .cursor {
      display: inline-block;
      width: 10px;
      height: 24px;
      background-color: black;
      margin-left: 5px;
      animation: blink 0.8s infinite;
    }

    @keyframes blink {
      50% { opacity: 0; }
    }

    .button-stack {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex: 1 1 200px;
    }

    .login-btn {
      padding: 15px 30px;
      font-size: 20px;
      border: 2px solid gray;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 10px;
    }

    .login-btn:hover {
      background-color: #ddd;
    }

    .guest-btn {
      padding: 10px 20px;
      font-size: 16px;
      border: 2px solid gray;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .guest-btn:hover {
      background-color: #eee;
    }

    a {
      text-decoration: none;
    }


    @media (max-width: 768px) {
      .container {
        flex-direction: column;
        align-items: flex-start;
        top: 0;
        gap: 20px;
      }

      .button-stack {
        align-items: flex-start;
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="left-section">
      <h1>CENAI</h1>
      <p class="description">
        <span id="typed-text"></span>
        <span class="cursor"></span>
      </p>
    </div>
    <div class="button-stack">
      <a href="login.php">
        <button class="login-btn">Log In</button>
      </a>
      <a href="guest.php">
        <button class="guest-btn">Guest Login</button>
      </a>
    </div>
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", function () {
      const text = "Useful for quick answers regarding CEN documentation.";
      let index = 0;
      const typedText = document.getElementById("typed-text");

      function typeText() {
        if (index < text.length) {
          typedText.textContent += text.charAt(index);
          index++;
          setTimeout(typeText, 50);
        }
      }

      setTimeout(typeText, 500);
    });
  </script>
</body>
</html>
