import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  getUsers,
  getClients,
  addUser,
  addClient,
  updateClient,
  deleteClient,
  updateUser,
  addSession,
  getSession,
  deleteSession,
  hashPassword,
} from "./server/db.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Express v4/v5 body size and parsing config
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. Token missing." });
    return;
  }

  const session = getSession(token);
  if (!session) {
    res.status(401).json({ error: "Session expired or invalid. Please login again." });
    return;
  }

  const user = getUsers().find((u) => u.id === session.userId);
  if (!user) {
    res.status(401).json({ error: "User associated with this session no longer exists." });
    return;
  }

  // Attach session and user objects to request for subsequent handlers
  req.user = user;
  req.token = token;
  next();
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register
app.post("/api/auth/register", (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ error: "All fields (fullName, email, password) are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email format." });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters long." });
    return;
  }

  const existing = getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    res.status(400).json({ error: "An account with this email already exists." });
    return;
  }

  const userId = "u-" + crypto.randomBytes(8).toString("hex");
  const passwordHash = hashPassword(password);

  const newUser = {
    id: userId,
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  addUser(newUser);

  // Auto-seed 5 premium sample client records for newly registered user so they don't start empty
  const defaultSampleLeads = [
    {
      fullName: "Sarah Connor",
      email: "sarah.connor@cyberdyne.com",
      phone: "+1 (555) 019-2834",
      companyName: "Cyberdyne Systems",
      status: "Active",
      priority: "High",
      dealValue: 75000,
      leadSource: "Referral",
      notes: "Interested in full digital systems upgrade and cloud transition."
    },
    {
      fullName: "Tony Stark",
      email: "tony@starkindustries.com",
      phone: "+1 (555) 382-9102",
      companyName: "Stark Industries",
      status: "Active",
      priority: "High",
      dealValue: 240000,
      leadSource: "Partner Referral",
      notes: "Evaluating dashboard enterprise subscription model."
    },
    {
      fullName: "Bruce Wayne",
      email: "bruce@wayneenterprises.com",
      phone: "+1 (555) 728-1192",
      companyName: "Wayne Enterprises",
      status: "Pending",
      priority: "Medium",
      dealValue: 125000,
      leadSource: "Direct Web",
      notes: "Evaluating system security metrics and active response indicators."
    },
    {
      fullName: "Peter Parker",
      email: "peter.parker@dailybugle.com",
      phone: "+1 (555) 918-2039",
      companyName: "Daily Bugle",
      status: "Inactive",
      priority: "Low",
      dealValue: 8500,
      leadSource: "Conference",
      notes: "Needs low-tier pricing plan. Scheduled callback next quarter."
    },
    {
      fullName: "Diana Prince",
      email: "diana.prince@themysis.org",
      phone: "+1 (555) 867-5309",
      companyName: "Themysis Exhibits",
      status: "Pending",
      priority: "Medium",
      dealValue: 48500,
      leadSource: "Website",
      notes: "Requested a prototype layout and contract by end of the week."
    }
  ];

  defaultSampleLeads.forEach((lead, index) => {
    addClient({
      id: "c-seed-" + index + "-" + crypto.randomBytes(4).toString("hex"),
      userId: userId,
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,
      status: lead.status,
      createdAt: new Date(Date.now() - (index + 1) * 3600000 * 24).toISOString(),
      priority: lead.priority,
      dealValue: lead.dealValue,
      leadSource: lead.leadSource,
      notes: lead.notes,
      photo: ""
    });
  });

  // Generate Session
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000 * 24).toISOString(); // 24 hours expiry
  addSession({ token, userId, expiresAt });

  res.status(201).json({
    message: "Registration successful!",
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      passwordHash: newUser.passwordHash,
    },
  });
});

// Sync endpoint to prevent data loss in ephemeral server environments (e.g. Render, server restarts)
app.post("/api/auth/sync", (req, res) => {
  const { users, clients, currentToken, currentUserId } = req.body;

  let restoredUsersCount = 0;
  let restoredClientsCount = 0;
  let sessionRestored = false;

  // 1. Restore missing users
  if (Array.isArray(users)) {
    const existingUsers = getUsers();
    users.forEach((u) => {
      if (u && u.id && u.email) {
        const uEmail = u.email.toLowerCase().trim();
        const exists = existingUsers.some(
          (eu) => eu.id === u.id || eu.email.toLowerCase().trim() === uEmail
        );
        if (!exists) {
          addUser({
            id: u.id,
            fullName: u.fullName || "Restored User",
            email: uEmail,
            passwordHash: u.passwordHash,
            createdAt: u.createdAt || new Date().toISOString(),
          });
          restoredUsersCount++;
        }
      }
    });
  }

  // 2. Restore missing client leads
  if (Array.isArray(clients)) {
    const existingClients = getClients();
    clients.forEach((c) => {
      if (c && c.id && c.userId) {
        const exists = existingClients.some((ec) => ec.id === c.id);
        if (!exists) {
          addClient({
            id: c.id,
            userId: c.userId,
            fullName: c.fullName || "Un-named Lead",
            email: c.email || "",
            phone: c.phone || "",
            companyName: c.companyName || "",
            status: c.status || "Pending",
            createdAt: c.createdAt || new Date().toISOString(),
            priority: c.priority || "Medium",
            dealValue: typeof c.dealValue === "number" ? c.dealValue : 0,
            leadSource: c.leadSource || "Website",
            notes: c.notes || "",
            photo: c.photo || "",
          });
          restoredClientsCount++;
        }
      }
    });
  }

  // 3. Re-create sessions if currentToken belongs to an existing user but session is gone
  if (currentToken && typeof currentToken === "string" && currentUserId) {
    const existingSession = getSession(currentToken);
    if (!existingSession) {
      const userExists = getUsers().find((u) => u.id === currentUserId);
      if (userExists) {
        addSession({
          token: currentToken,
          userId: currentUserId,
          expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString(), // extend session to 30 days
        });
        sessionRestored = true;
      }
    }
  }

  res.json({
    success: true,
    restoredUsersCount,
    restoredClientsCount,
    sessionRestored,
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    res.status(400).json({ error: "No account found with this email. You must register first before you can sign in!" });
    return;
  }

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    res.status(400).json({ error: "Incorrect password. Please verify your credentials and try again." });
    return;
  }

  // Generate Session
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000 * 24).toISOString(); // 24 hours expiry
  addSession({ token, userId: user.id, expiresAt });

  res.json({
    message: "Welcome back!",
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      passwordHash: user.passwordHash,
    },
  });
});

// Logout
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  const token = req.token;
  deleteSession(token);
  res.json({ success: true, message: "Logged out successfully." });
});

// Me (Get profile info)
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  });
});

// Update Profile
app.put("/api/auth/profile", authenticateToken, (req, res) => {
  const user = req.user;
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    res.status(400).json({ error: "Full Name and Email are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email format." });
    return;
  }

  // Check unique email (excluding themselves)
  const existing = getUsers().find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.id !== user.id
  );
  if (existing) {
    res.status(400).json({ error: "Email is already taken." });
    return;
  }

  updateUser(user.id, fullName.trim(), normalizedEmail);

  res.json({
    message: "Profile updated successfully!",
    user: {
      id: user.id,
      fullName: fullName.trim(),
      email: normalizedEmail,
    },
  });
});

// Change Password
app.put("/api/auth/change-password", authenticateToken, (req, res) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current and new passwords are required." });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters long." });
    return;
  }

  const currentPasswordHash = hashPassword(currentPassword);
  if (user.passwordHash !== currentPasswordHash) {
    res.status(400).json({ error: "Current password is incorrect." });
    return;
  }

  const newPasswordHash = hashPassword(newPassword);
  updateUser(user.id, user.fullName, user.email, newPasswordHash);

  res.json({ message: "Password updated successfully!" });
});

// ==========================================
// CLIENT LEADS ENDPOINTS
// ==========================================

// Get all client leads for authenticated user
app.get("/api/clients", authenticateToken, (req, res) => {
  const user = req.user;
  // Filters client leads mapped strictly to current user's ID
  const myClients = getClients().filter((c) => c.userId === user.id);
  res.json(myClients);
});

// Add Client
app.post("/api/clients", authenticateToken, (req, res) => {
  const user = req.user;
  const { fullName, email, phone, companyName, status, priority, dealValue, leadSource, notes, photo } = req.body;

  if (!fullName || !email || !phone || !companyName || !status) {
    res.status(400).json({ error: "All client fields are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email format." });
    return;
  }

  const validStatuses = ["Active", "Pending", "Inactive"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Status must be Active, Pending, or Inactive." });
    return;
  }

  const newClient = {
    id: "c-" + crypto.randomBytes(8).toString("hex"),
    userId: user.id,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    companyName: companyName.trim(),
    status: status,
    createdAt: new Date().toISOString(),
    priority: priority || "Medium",
    dealValue: Number(dealValue) || 0,
    leadSource: leadSource || "Direct Web",
    notes: notes || "",
    photo: photo || ""
  };

  addClient(newClient);

  res.status(201).json({
    message: "Client lead added successfully!",
    client: newClient,
  });
});

// Seed Sample Clients
app.post("/api/clients/seed", authenticateToken, (req, res) => {
  const user = req.user;

  const sampleLeads = [
    {
      fullName: "Anand Krishna",
      email: "anand.krishna@keralatech.co",
      phone: "+91 94470 12345",
      companyName: "Kerala Spices & Tech IT",
      status: "Active",
      priority: "High",
      dealValue: 75000,
      leadSource: "Referral",
      notes: "Interested in full digital systems upgrade and cloud transition."
    },
    {
      fullName: "Meera Nair",
      email: "meera.nair@malabargroup.com",
      phone: "+91 98460 54321",
      companyName: "Malabar Digital Ventures",
      status: "Pending",
      priority: "Medium",
      dealValue: 45000,
      leadSource: "Website",
      notes: "Requested a prototype layout by mid-week."
    },
    {
      fullName: "Elon Musk",
      email: "elon@spacex.com",
      phone: "+1 (555) 420-6900",
      companyName: "SpaceX Aerospace",
      status: "Active",
      priority: "High",
      dealValue: 990000,
      leadSource: "Cold Outbound",
      notes: "Trying to move Starshield software integrations onto our cloud CRM matrix."
    },
    {
      fullName: "Rahul Menon",
      email: "rahul.menon@cochinbuilders.in",
      phone: "+91 94460 98765",
      companyName: "Cochin Infrastructure Ltd",
      status: "Inactive",
      priority: "Low",
      dealValue: 12000,
      leadSource: "Direct Web",
      notes: "Follow up scheduled next month after quarterly earnings."
    },
    {
      fullName: "Siddharth Verma",
      email: "sid.verma@bangalorelabs.com",
      phone: "+91 80252 44321",
      companyName: "Bangalore AI Group",
      status: "Pending",
      priority: "High",
      dealValue: 150000,
      leadSource: "Partner Referral",
      notes: "LLM training pipeline hardware consulting deal."
    },
    {
      fullName: "Deepa Abraham",
      email: "deepa@indiasoftware.net",
      phone: "+91 90480 11223",
      companyName: "India Software Solutions",
      status: "Active",
      priority: "Medium",
      dealValue: 62000,
      leadSource: "Conference",
      notes: "Prefers communication over secure e-mails and voice notes."
    }
  ];

  const seededClients = [];
  sampleLeads.forEach((lead, index) => {
    const newClient = {
      id: "c-seed-" + index + "-" + crypto.randomBytes(4).toString("hex"),
      userId: user.id,
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,
      status: lead.status,
      createdAt: new Date(Date.now() - (index + 1) * 3600000 * 24).toISOString(), // Staggered days ago
      priority: lead.priority,
      dealValue: lead.dealValue,
      leadSource: lead.leadSource,
      notes: lead.notes,
    };
    addClient(newClient);
    seededClients.push(newClient);
  });

  res.status(201).json({
    message: "Successfully seeded 6 premium client leads!",
    clients: seededClients
  });
});

// Edit Client
app.put("/api/clients/:id", authenticateToken, (req, res) => {
  const user = req.user;
  const clientId = req.params.id;
  const { fullName, email, phone, companyName, status, priority, dealValue, leadSource, notes, photo } = req.body;

  if (!fullName || !email || !phone || !companyName || !status) {
    res.status(400).json({ error: "All client fields are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email format." });
    return;
  }

  const validStatuses = ["Active", "Pending", "Inactive"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Status must be Active, Pending, or Inactive." });
    return;
  }

  // Find client and verify it belongs to user
  const clientToEdit = getClients().find((c) => c.id === clientId);
  if (!clientToEdit) {
    res.status(404).json({ error: "Client lead not found." });
    return;
  }

  if (clientToEdit.userId !== user.id) {
    res.status(403).json({ error: "Unauthorized access to this client lead." });
    return;
  }

  const updatedClient = {
    id: clientId,
    userId: user.id,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    companyName: companyName.trim(),
    status: status,
    createdAt: clientToEdit.createdAt, // keep original date
    priority: priority || "Medium",
    dealValue: Number(dealValue) || 0,
    leadSource: leadSource || "Direct Web",
    notes: notes || "",
    photo: photo !== undefined ? photo : (clientToEdit.photo || ""),
  };

  const success = updateClient(updatedClient);
  if (success) {
    res.json({
      message: "Client lead updated successfully!",
      client: updatedClient,
    });
  } else {
    res.status(500).json({ error: "Failed to update client." });
  }
});

// Delete Client
app.delete("/api/clients/:id", authenticateToken, (req, res) => {
  const user = req.user;
  const clientId = req.params.id;

  // Find client and verify it belongs to user
  const clientToDelete = getClients().find((c) => c.id === clientId);
  if (!clientToDelete) {
    res.status(404).json({ error: "Client lead not found." });
    return;
  }

  if (clientToDelete.userId !== user.id) {
    res.status(403).json({ error: "Unauthorized access to this client lead." });
    return;
  }

  const success = deleteClient(clientId);
  if (success) {
    res.json({ message: "Client lead deleted successfully." });
  } else {
    res.status(500).json({ error: "Failed to delete client." });
  }
});

// ==========================================
// AI CORE PIPELINE ANALYTICS
// ==========================================
app.post("/api/analysis", authenticateToken, async (req, res) => {
  const user = req.user;
  
  // Fetch clients belonging to this user
  const userClients = getClients().filter((c) => c.userId === user.id);
  const total = userClients.length;

  if (total === 0) {
    res.json({
      analysis: `### 📊 CRM Pipeline Insights
 
**No Leads Registered Yet!** 

Your client database is currently empty. To generate a smart data analysis:
1. Navigate to the **Client Leads** tab.
2. Click **Seed Demo Leads** to instantly add 6 pre-configured records, or click **Add Custom Lead** to create manually.
3. Return to the Dashboard and click **Run Analysis** to check your pipeline performance!`,
    });
    return;
  }

  const active = userClients.filter((c) => c.status === "Active").length;
  const pending = userClients.filter((c) => c.status === "Pending").length;
  const inactive = userClients.filter((c) => c.status === "Inactive").length;

  const activeRatio = Math.round((active / total) * 100);
  const pendingRatio = Math.round((pending / total) * 100);
  const inactiveRatio = Math.round((inactive / total) * 100);

  const highPriority = userClients.filter((c) => c.priority === "High").length;
  const mediumPriority = userClients.filter((c) => c.priority === "Medium").length;
  const lowPriority = userClients.filter((c) => c.priority === "Low").length;

  const totalDealValue = userClients.reduce((acc, c) => acc + (c.dealValue || 0), 0);
  const averageDealValue = Math.round(totalDealValue / total);

  // Group lead sources
  const leadSources = {};
  userClients.forEach((c) => {
    const s = c.leadSource || "Direct Web";
    leadSources[s] = (leadSources[s] || 0) + 1;
  });
  const sourceSummary = Object.entries(leadSources)
    .map(([source, count]) => `* **${source}**: ${count} lead${count > 1 ? "s" : ""}`)
    .join("\n");

  const apiKey = process.env.AI_Api_Key || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful fallback with static highly tailored smart analytics when API key is missing
    res.json({
      missingKey: true,
      analysis: `### 📊 CRM Local Analysis Report (Offline Mode)
 
We have compiled an instant fallback analysis using your local CRM dataset metrics. Set up an **AI_API_KEY** in **Settings > Secrets** to activate deep AI-powered predictive forecasts!

#### 📈 Sales Funnel Metrics
* **Total Portfolio Value**: $${totalDealValue.toLocaleString()}
* **Average Lead Ticket Size**: $${averageDealValue.toLocaleString()}
* **Funnel Health Index**: **${activeRatio}%** of your prospects are currently actively engaged.
  * 🟢 **Active Leads**: ${active} (${activeRatio}%)
  * 🟡 **Pending Follow-up**: ${pending} (${pendingRatio}%)
  * 🔴 **Inactive Leads**: ${inactive} (${inactiveRatio}%)

#### 🎯 Priority Matrix
* **High-Value Actions Pending**: You have **${highPriority} high priority prospect${highPriority > 1 ? "s" : ""}** representing critical deals that should be prioritized in your daily outreach.
* **Medium Engagement Group**: **${mediumPriority} medium priority lead${mediumPriority > 1 ? "s" : ""}** are currently in your pipeline. Consistent follow-ups can help trigger action.
* **Low Engagement Group**: **${lowPriority} low priority lead${lowPriority > 1 ? "s" : ""}** require passive, light retargeting campaigns.

#### 📣 Core Acquisition Channels
${sourceSummary || "* No lead sources detected."}

*💡 Tip: Enable your AI API key in the platform to run smart AI forecasting with deeper recommendations!*`,
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const completion = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform an incredibly professional, analytical, and encouraging sales pipeline business analysis for ${user.fullName} using the following real-time data from their dashboard graph.

DATA SUMMARY:
- Total Leads Indexed: ${total}
- Active conversion/prospects: ${active} (ratio: ${activeRatio}%)
- Pending follow-up: ${pending} (ratio: ${pendingRatio}%)
- Inactive accounts: ${inactive} (ratio: ${inactiveRatio}%)
- High Priority leads: ${highPriority}
- Medium Priority leads: ${mediumPriority}
- Low Priority leads: ${lowPriority}
- Total Deal Value in Pipeline: $${totalDealValue.toLocaleString()}
- Average Deal Ticket: $${averageDealValue.toLocaleString()}
- Key Client Sources:
${leadSources ? Object.entries(leadSources).map(([src, val]) => `- ${src}: ${val}`).join('\n') : "Direct Web"}

INSTRUCTIONS:
1. Provide a stunning business development briefing in clean Markdown formatting. Use emojis nicely but keep a professional tone.
2. Structure the analysis with these exact sections:
   - ### 📊 Executive Pipeline Health Check
   - ### 🔍 Detailed Segment Observations
   - ### 💡 Actionable Growth Recommendations
3. Mention specific counts from the data. Be highly realistic, objective, and analytical with advice tailored to the ratio of High Priority leads (${highPriority}) versus active status (${active}) and deal values. Keep the tone inspiring and ready for action. Do not talk about system configurations or APIs. Just talk as their smart business AI analyst.`,
    });

    const responseText = completion.text || "Failed to generate AI analysis. Please try again.";
    res.json({ analysis: responseText });
  } catch (err) {
    console.error("AI API Error:", err);
    res.status(500).json({ error: "AI API call failed: " + err.message });
  }
});

// ==========================================
// FRONTEND ASSET ROUTING / VITE SERVICE
// ==========================================

async function startServer() {
  const { default: fs } = await import("fs");
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV !== "production" || !hasDist) {
    if (process.env.NODE_ENV === "production" && !hasDist) {
      console.warn("WARNING: NODE_ENV is set to production but 'dist/index.html' was not found. Falling back to Vite dev middleware to prevent 404 errors.");
    }
    // Inject Vite as development asset middleware
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static built files
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart CRM server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
