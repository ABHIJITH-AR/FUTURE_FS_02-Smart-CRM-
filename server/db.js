import fs from "fs";
import path from "path";
import crypto from "crypto";

// Detect if running on Vercel or production serverless environments where root dir is read-only
const IS_VERCEL = process.env.VERCEL || process.env.NOW_BUILDER || !process.env.AIS_DEV;
let DB_FILE = path.join(process.cwd(), "data.json");
if (IS_VERCEL) {
  DB_FILE = path.join("/tmp", "data.json");
}

export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Ensure database file exists and is seeded
function initializeDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.users && parsed.clients && parsed.sessions) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse database, creating a fresh one...", e);
    }
  }

  // If we are on Vercel, we can try to copy/read the initial data.json from the build directory
  const rootDbFile = path.join(process.cwd(), "data.json");
  if (IS_VERCEL && fs.existsSync(rootDbFile)) {
    try {
      const data = fs.readFileSync(rootDbFile, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.users && parsed.clients && parsed.sessions) {
        try {
          fs.writeFileSync(DB_FILE, data, "utf-8");
        } catch (errWrite) {
          console.error("Failed to write copy to writable DB_FILE /tmp/data.json:", errWrite);
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to read root database:", e);
    }
  }

  // Raw initial default user password is Admin123
  const defaultAdminPasswordHash = hashPassword("Admin123");
  const adminId = "admin-user-id";

  const defaultSchema = {
    users: [
      {
        id: adminId,
        fullName: "CRM Manager",
        email: "demo@smartcrm.com",
        passwordHash: defaultAdminPasswordHash,
        createdAt: new Date().toISOString(),
      },
    ],
    clients: [
      {
        id: "c1",
        userId: adminId,
        fullName: "Sarah Connor",
        email: "sarah.connor@cyberdyne.com",
        phone: "+1 (555) 019-2834",
        companyName: "Cyberdyne Systems",
        status: "Active",
        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
      },
      {
        id: "c2",
        userId: adminId,
        fullName: "Tony Stark",
        email: "tony@starkindustries.com",
        phone: "+1 (555) 382-9102",
        companyName: "Stark Industries",
        status: "Active",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
      },
      {
        id: "c3",
        userId: adminId,
        fullName: "Bruce Wayne",
        email: "bruce@wayneenterprises.com",
        phone: "+1 (555) 728-1192",
        companyName: "Wayne Enterprises",
        status: "Pending",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
      },
      {
        id: "c4",
        userId: adminId,
        fullName: "Peter Parker",
        email: "peter.parker@dailybugle.com",
        phone: "+1 (555) 918-2039",
        companyName: "Daily Bugle",
        status: "Inactive",
        createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(), // 10 days ago
      },
      {
        id: "c5",
        userId: adminId,
        fullName: "Diana Prince",
        email: "diana.prince@themysis.org",
        phone: "+1 (555) 867-5309",
        companyName: "Themysis Exhibits",
        status: "Pending",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      },
    ],
    sessions: [],
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultSchema, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write default template DB:", err);
  }
  return defaultSchema;
}

let dbCache = initializeDatabase();

export function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
  } catch (err) {
    console.warn("Warning: Database persistence failed (likely read-only serverless environment).", err);
  }
}

export function getUsers() {
  return dbCache.users;
}

export function getClients() {
  return dbCache.clients;
}

export function getSessions() {
  return dbCache.sessions;
}

export function addUser(user) {
  dbCache.users.push(user);
  saveDatabase();
}

export function addClient(client) {
  dbCache.clients.push(client);
  saveDatabase();
}

export function updateClient(updated) {
  const index = dbCache.clients.findIndex((c) => c.id === updated.id);
  if (index !== -1) {
    dbCache.clients[index] = updated;
    saveDatabase();
    return true;
  }
  return false;
}

export function deleteClient(id) {
  const lengthBefore = dbCache.clients.length;
  dbCache.clients = dbCache.clients.filter((c) => c.id !== id);
  if (dbCache.clients.length < lengthBefore) {
    saveDatabase();
    return true;
  }
  return false;
}

export function updateUser(id, fullName, email, passwordHash) {
  const index = dbCache.users.findIndex((u) => u.id === id);
  if (index !== -1) {
    dbCache.users[index].fullName = fullName;
    dbCache.users[index].email = email;
    if (passwordHash) {
      dbCache.users[index].passwordHash = passwordHash;
    }
    saveDatabase();
    return true;
  }
  return false;
}

export function addSession(session) {
  // Remove any old sessions for this user
  dbCache.sessions = dbCache.sessions.filter((s) => s.userId !== session.userId);
  dbCache.sessions.push(session);
  saveDatabase();
}

export function deleteSession(token) {
  const lengthBefore = dbCache.sessions.length;
  dbCache.sessions = dbCache.sessions.filter((s) => s.token !== token);
  if (dbCache.sessions.length < lengthBefore) {
    saveDatabase();
    return true;
  }
  return false;
}

export function getSession(token) {
  const session = dbCache.sessions.find((s) => s.token === token);
  if (!session) return undefined;

  // Check if expired (e.g. 24 hour sessions)
  if (new Date() > new Date(session.expiresAt)) {
    deleteSession(token);
    return undefined;
  }
  return session;
}
