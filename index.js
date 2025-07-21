const { default: axios } = require('axios');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

let lastReceivedEmail = ""; // Store the most recent email

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Send Email</title>
      <style>
        body {
          font-family: sans-serif;
          margin: 0;
          padding: 20px;
          background: #f2f2f2;
        }

        h1 {
          font-size: 1.5em;
          margin-bottom: 20px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        input[type="text"] {
          padding: 10px;
          height: 100px;
          font-size: 16px;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 6px;
          text-align: left;
        }

        #emailtext::placeholder {
          color: #666;
          font-style: italic;
        }

        button {
          padding: 12px;
          font-size: 16px;
          background-color: #0078d4;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        button:hover {
          background-color: #005fa3;
        }

        .email-box {
          background: #fff;
          border-left: 4px solid #0078d4;
          padding: 15px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          white-space: pre-wrap;
        }

        @media (max-width: 600px) {
          input[type="text"],
          button,
          .email-box {
            font-size: 14px;
            height: auto;
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <h1>Send Email</h1>
      <form action="/sendemail" method="POST">
        <input type="text" name="ip" id="ip" placeholder="Enter email IP and Port eg: 192.168.1.146:24" required />
        <input type="text" name="emailtext" id="emailtext" placeholder="Enter email text" required />
        <button type="submit">Send</button>
      </form>

      <div id="emailDisplay" class="email-box"><em>Loading latest email...</em></div>

      <script>
        async function fetchLatestEmail() {
          const res = await fetch('/latest');
          const data = await res.json();
          const box = document.getElementById('emailDisplay');
          box.innerHTML = data.email
            ? '<strong>Last Received:</strong><br>' + data.email
            : '<em>No email received yet.</em>';
        }

        setInterval(fetchLatestEmail, 3000); // Poll every 3 seconds
        fetchLatestEmail(); // Initial load
      </script>
    </body>
    </html>
  `);
});

app.post('/sendemail', (req, res) => {
  const ip = req.body.ip;
  const emailText = req.body.emailtext;
  console.log(`Sending to ${ip}: ${emailText}`);

  try {
    axios.get(`http://${ip}/recemail`, {
      params: { emailtext: emailText },
    });
  } catch (error) {
    console.error(`Error sending email to ${ip}:`, error);
    res.status(500).send('Error sending email');
    return;
  }

  res.redirect('/');
});

app.get('/recemail', (req, res) => {
  const emailText = req.query.emailtext;
  console.log(`Received email: ${emailText}`);
  lastReceivedEmail = emailText;
  const ip = req.ip
  res.send(`Email received: ${emailText}`);
});

app.get('/latest', (req, res) => {
  res.json({ email: lastReceivedEmail, from: ip  });
});

app.listen(port, () => {
  console.log(`Email client listening at http://localhost:${port}`);
});
