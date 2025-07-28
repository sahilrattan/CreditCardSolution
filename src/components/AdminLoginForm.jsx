// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// const app = express();
// const PORT = 3001;

// // --- Middleware ---
// app.use(cors({
//   origin: "http://localhost:5173", // Frontend URL (Vite)
//   methods: ["GET", "POST"],
// }));
// app.use(bodyParser.json());

// // --- WhatsApp Credentials ---
// const WHATSAPP_ACCESS_TOKEN = 'EAAecAjDNyVQBPGr6vz1PQ6lYBAZBDwZC5XDZAjZBr0PLgpZBjQBhi6WiooS63JggRvAKyLuIAnZC82al50ORGwxIFPkLzqlDhQsBVZCAZA528se5aXwL4BtqGjI8p7qCJEcxOqvLgrbHW69eIHZBS5cgFypc3EfFKtQXWiEVQE2zzHbqcXYOJsLiphK1QpvRXkL8h3rjW30mXveGxV0Oxn8IjUWE0CliZCf6SMjNg228yZCXGqHhyY3';
// const PHONE_NUMBER_ID = '705049146032161';

// // --- View PDF API ---
// app.get("/api/view-pdf", async (req, res) => {
//   const fileUrl = req.query.url;

//   if (!fileUrl) {
//     return res.status(400).send("Missing 'url' query parameter");
//   }

//   try {
//     const response = await fetch(fileUrl);

//     if (!response.ok) {
//       return res.status(response.status).send("Failed to fetch file");
//     }

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", "inline; filename=preview.pdf");

//     response.body.pipe(res); // Stream PDF to client
//   } catch (error) {
//     console.error("Proxy error:", error);
//     res.status(500).send("Server error while fetching file");
//   }
// });

// // --- Send WhatsApp Message API ---
// app.post("/api/send-whatsapp", async (req, res) => {
//   const { phone, name } = req.body;

//   if (!phone || !name) {
//     return res.status(400).json({ error: "Phone and Name are required" });
//   }

//   const formattedPhone = phone.replace(/\D/g, ""); // Remove non-digits

//   const payload = {
//     messaging_product: "whatsapp",
//     to: formattedPhone,
//     type: "template",
//     template: {
//       name: "trigbit",
//       language: { code: "en" },
//       components: [
//         {
//           type: "body",
//           parameters: [
//             { type: "text", text: "Sir/Madam" },
//             { type: "text", text: name },
//           ],
//         },
//       ],
//     },
//   };

//   try {
//     const response = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     const result = await response.json();
//     console.log("WhatsApp API Response:", result);

//     if (response.ok) {
//       res.status(200).json({ message: "WhatsApp message sent successfully", result });
//     } else {
//       res.status(response.status).json({ error: "Failed to send WhatsApp message", details: result });
//     }
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // --- Start Server ---
// app.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}`);
// });




const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors({
  origin: "http://localhost:5173", // Frontend URL (Vite)
  methods: ["GET", "POST"],
}));
app.use(bodyParser.json());

// --- WhatsApp Credentials ---
const WHATSAPP_ACCESS_TOKEN = 'EAAecAjDNyVQBPE6tSjbpVo18bPwcwgeaBC3Tf1ySbAzy5ufpUda9bjEscwKzbrWHIR8nfdoBVnm8tNPk9jMRSrZCdz9bIUSHgFD5h5MZCmVE5epF1v8hWfQ0QkikNGx6RJlWLQJu4gozzZAlCrW8H2HAs0LhENZB722RSz92crRyGJ8WcM6iel8iAa634Q5ERg8BgtOV3gA6qjmVex5LvuAthzoDFZB8VTXzPwZCRN5ecwNQZDZD'; // Replace with your token
const PHONE_NUMBER_ID = '705049146032161';

// --- View PDF API ---
app.get("/api/view-pdf", async (req, res) => {
  const fileUrl = req.query.url;

  if (!fileUrl) {
    return res.status(400).send("Missing 'url' query parameter");
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch file");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=preview.pdf");

    response.body.pipe(res); // Stream PDF to client
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Server error while fetching file");
  }
});

// --- Send WhatsApp Message API ---
app.post("/api/send-whatsapp", async (req, res) => {
  const { phone, name } = req.body;

  if (!phone || !name) {
    return res.status(400).json({ error: "Phone and Name are required" });
  }

  const formattedPhone = phone.replace(/\D/g, ""); // Remove non-digits

  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "template",
    template: {
      name: "hello_world", // <-- Use your actual template name
      language: { code: "en_US" }, // <-- Match the template language exactly
    },
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("WhatsApp API Response:", result);

    if (response.ok) {
      res.status(200).json({ message: "WhatsApp message sent successfully", result });
    } else {
      res.status(response.status).json({ error: "Failed to send WhatsApp message", details: result });
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
