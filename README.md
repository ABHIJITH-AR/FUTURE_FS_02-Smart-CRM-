# Smart CRM - Client Lead Management System

Smart CRM is a high-performance, full-stack, secure Customer Relationship Management (CRM) platform built on raw, pure JavaScript. It offers an elegant dark theme visual landscape, interactive SVG analytics, advanced lead pipeline management (CRUD), deep search filters, operator settings correction, and premium AI-powered predictive forecasting.

---

## 🌟 Key Features & Capabilities

- **Secure Session-Based Authentication**:
  - Secure registrars and logins utilizing concurrent, hashed credentials.
  - Automatic session boundaries, secure cookie indicators, and instant logout mechanisms.
  - Operator shortcut bypassing for easy pipeline test auditing.
- **Dynamic CRM Dashboard**:
  - Warm, personalized dynamic greeting headers (e.g., `"Welcome Back, Operator 👋"`).
  - High-performance, interactive SVG-native donut analytics charts representing real-time client statuses.
  - Quick-action shortcuts allowing immediate client acquisition.
- **Client Lead Management (Full CRUD)**:
  - Create, view, modify, and delete customer prospect records with pristine transition animations.
  - Rich lead properties: Full Name, Email, Phone, Company, Estimated Deal Value ($), Lead Acquisition Source, Priority Level (High/Medium/Low), and detailed Notes.
- **Advanced AI CRM Analysis**:
  - Deep predictive forecasting that reads your current directory's sales pipeline and translates performance metrics.
  - Generates beautiful, structure-tailored Markdown reports on executive pipeline health, segment observations, and business growth advice.
  - Smart automatic offline fallback if the API key is not yet configured.
- **Complete Modular Customization**:
  - User settings form for instantly correcting operator profiles and changing security passcodes.
  - Real-time success and error feedback indicators.

---

## 🏗️ Technical Architecture

- **Frontend**: React 19, JavaScript (JSX), Vite Client-Side Bundler, Tailwind CSS 4, Motion, Lucide Icons
- **Backend / Routing**: Node.js, Express.js server, direct CommonJS compilation bundle with `esbuild`
- **Database Indexing**: Secure, server-side concurrent JSON document engine (`data.json`) with automated seeding structures

---

## 📂 Project Structure

```bash
├── package.json         # Full-stack dependencies and build/dev runner scripts
├── vite.config.js       # Vite configuration serving SPA assets with path aliases
├── server.js            # Node Express server coordinating API endpoints & AI integrations
├── data.json            # Active database JSON storage document
├── server
│   └── db.js            # Database interaction methods (users, sessions, clients CRUD)
├── src
│   ├── main.jsx         # Web App entry initializer
│   ├── App.jsx          # Layout coordinator & Auth contextual management
│   ├── index.css        # Global CSS rules using Tailwind import standard
│   └── components       # Modular React presentation layers
│       ├── Logo.jsx     # Modern premium SaaS logo representation
│       ├── AuthView.jsx # Login / registration screen
│       ├── Sidebar.jsx  # Responsive mobile drawer and desktop sidebar
│       ├── Navbar.jsx   # Top status header & operators profile details
│       ├── DashboardView.jsx # Dynamic stats, SVG Donut charts, & recent activities
│       ├── ClientsView.jsx   # Leads grid, filters, and client database modifiers
│       ├── AnalysisView.jsx  # AI forecasting generator with fallbacks
│       └── SettingsView.jsx  # Operator profile parameters & passcode changes
└── schema.sql           # Production MySQL relational model backup
```

---

## 🛠️ Getting Started Locally

Follow these instructions to run the CRM locally on your computer:

### 1. Prerequisites
Install **Node.js (v18+)** and **npm** on your operating system.

### 2. Dependency Setup
Extract the package coordinates and run:
```bash
npm install
```

### 3. Smart AI Configuration (Optional)
To activate high-tier AI business forecasts, provide your API key in your system environment prior to running:
```bash
export AI_API_KEY="your-api-key"
```
*(If omitted, Smart CRM automatically activates its localized offline analyzer!)*

### 4. Running the Development Server
Launch the live responsive workspace:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🚢 Production Delivery Guides

The application is fully compatible with production cloud platforms or server bundles:

1. **Build Production Assets**:
   ```bash
   npm run build
   ```
2. **Start the Production Process**:
   ```bash
   npm start
   ```

*Crafted beautifully in pure, high-contrast, modern JavaScript.*
