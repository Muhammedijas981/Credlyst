# Credlyst 🔗

A practical, privacy-focused link management solution designed to free you from the browser tab overload that slows down low-spec systems. Manage essential URLs effortlessly across **Web App · Browser Extension · Mobile App**.

![Credlyst](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 The Problem We Solve

During my job hunt, I needed to organize complex portfolio URLs and keep track of multiple resources. But the real wake-up call came when an HR friend told me her low-spec computer was so laggy she had to keep 15 Chrome tabs open just to access her daily tools. That's when it clicked: **Credlyst fills a very practical gap in everyday productivity.**

Keeping dozens of tabs open doesn't just clutter your browser—it eats system memory, slows down your entire machine, and creates friction in your workflow. Whether you're a job seeker managing application links, a content creator curating resources, or anyone on limited hardware, **Credlyst solves the 'tab overload' problem** with a lightweight, synchronized ecosystem.

## ✨ Features

- 🔗 **Save Links** - Add your frequently used URLs to a centralized, organized list
- 🚀 **Lightning-Fast Extension** - Save any link instantly with `Ctrl+Shift+S` while browsing
- ⚡ **Instant Search** - Hit `Ctrl+Shift+F` to open a popup, search, and paste links right where you're typing
- ☁️ **Seamless Sync** - Your links sync across web, extension, and mobile app in real-time
- 🔒 **Privacy-Focused** - Secure authentication with end-to-end encrypted sync
- ⭐ **Favorites** - Quick access to your most important links
- 🏷️ **Smart Organization** - Custom categories (AI, Tools, Resources, etc.) for better structure
- 🌙 **Dark Mode** - Beautiful UI optimized for all lighting conditions
- 📱 **Multi-Platform** - Works seamlessly on web, extension, and mobile
- 👥 **Multi-Account** - Manage multiple accounts for different workflows

## 🚀 Platform Availability

### 🌐 Web App
Live and ready to use: **[credlyst.ijas.space](https://credlyst.ijas.space/)**

### 🧩 Chrome Extension
Built for speed and seamless integration. Save and search links without leaving your current tab.

### 📱 Mobile App
Coming soon with full offline support and optimized touch gestures.

> **Note:** While financial constraints have prevented publishing to public stores, I'm happy to share direct builds via email. Reach out if you'd like to try the extension or app!

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables
- **Icons**: Lucide Icons (via SVG)
- **AI Integration**: Claude API (planned for auto-categorization, smart summaries, tag suggestions)

## 📁 Project Structure

```
credlyst/
├── src/
│   ├── config/          # Configuration
│   │   └── constants.js
│   ├── lib/             # Third-party libraries
│   │   └── supabase.js
│   ├── services/        # Business Logic
│   │   ├── analytics.js
│   │   ├── authService.js
│   │   ├── linkManager.js
│   │   ├── searchEngine.js
│   │   └── tagManager.js
│   ├── styles/          # CSS Styles
│   │   ├── variables.css
│   │   └── main.css
│   ├── utils/           # Utility functions
│   │   ├── formatters.js
│   │   ├── helpers.js
│   │   ├── sanitizers.js
│   │   ├── toast.js
│   │   └── validators.js
│   ├── App.js           # Main app component
│   └── main.js          # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## 💡 Usage

### Browser Extension Workflow

**Save a link instantly:**
- While viewing any webpage, press `Ctrl+Shift+S` to save the current URL
- Add a quick title, description, and category
- Link syncs immediately to your account

**Retrieve a link instantly:**
- Press `Ctrl+Shift+F` to open the search popup
- Type a keyword to find your link
- Click to copy and auto-paste directly into your current field

### Web App Workflow

1. Log in securely to your Credlyst account
2. Use the search bar to find links by keyword
3. Press `Ctrl+K` (or `Cmd+K` on Mac) to focus search
4. Organize with categories and mark favorites
5. All changes sync across your devices instantly

### Mobile App
Access your entire link library on the go with optimized touch controls and offline support.

## 🎨 Database Schema

Credlyst uses Supabase (PostgreSQL) with a `links` table:

- **id** - Unique identifier
- **user_id** - Foreign key to Supabase Auth
- **title** - Title of the link
- **url** - The URL string
- **description** - Optional description
- **keywords** - Optional keywords for searching
- **category** - Link category for organization
- **favorite** - Boolean favorite status
- **created_at** - Creation timestamp
- **updated_at** - Last update timestamp

## 🚀 Getting Started (Development)

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com/) project (for database and authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/Muhammedijas981/Credlyst.git
cd Credlyst

# Install dependencies
npm install

# Setup environment variables
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤖 Future Development & AI Integration

I'm leveraging **Claude AI** to accelerate Credlyst's development with intelligent features:

- **Auto-Categorization**: Claude analyzes saved links and suggests smart categories
- **Smart Summaries**: Generate quick summaries for 'read later' articles saved from X or the web
- **Tag Suggestions**: Intelligent recommendations for organizing your bookmarks
- **Enhanced Search**: Natural language search across your entire link library

Claude is also essential to my daily workflow—helping with performant browser extension code, state synchronization, and complex UI debugging.

## 🤝 Contributing

Credlyst is fully open-source and community-driven. Contributions are welcome! Whether you want to:

- Report bugs or suggest features
- Improve the extension or mobile app
- Help with AI feature integration
- Optimize performance

Feel free to open an issue or submit a pull request.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Why Open Source?

My goal is to keep Credlyst free, accessible, and community-driven. Real-world productivity tools should be available to everyone—especially those struggling with low-spec hardware constraints or browser tab overload. By building in the open and integrating Claude AI, we can create something truly useful together.

---

**Credlyst** — Manage your links, free your memory, reclaim your productivity. 🚀

Have questions or want to try the beta builds? Reach out via email or open an issue on GitHub!
