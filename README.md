# Credlyst 🔗

A beautiful, privacy-focused link management web application with seamless cloud synchronisation powered by Supabase.

![Credlyst](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔗 **Save Links** - Add your frequently used URLs to a centralized list
- ☁️ **Cloud Sync** - Seamless cross-device synchronisation with Supabase
- 🔒 **Secure Authentication** - Personalised and secure user accounts
- 🔍 **Full-Text Search** - Quickly find links by title, URL, description, or keyword
- ✏️ **Edit/Delete Links** - Manage your saved links with ease
- 🌙 **Dark Mode** - Beautiful UI with dark mode support
- 📱 **Mobile Responsive** - Optimized for use on any device
- 🏷️ **Tags & Categories** - Organize links your way
- ⭐ **Favorites** - Quick access to your most important links

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com/) project (for the database and authentication)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables (add your Supabase credentials)
# Create a .env file and supply your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables
- **Icons**: Lucide Icons (via SVG)

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

### Authentication
- Register an account or log in securely to synchronise your links.

### Adding a Link

1. Click the "Add Link" button in the navbar
2. Fill in the link details (title, URL, description, keywords, category)
3. Click "Add Link" to save directly to the cloud

### Searching Links

- Use the search bar in the navbar
- Press `Ctrl+K` (or `Cmd+K` on Mac) to focus the search
- Results appear instantly as you type

### Managing Links

- Click the star icon to add/remove from favorites
- Click on a link card to view details (future feature)
- Edit or delete links from the link card menu (future feature)

## 🎨 Features in Detail

### Database Schema

Credlyst uses Supabase (PostgreSQL) with a `links` table containing the following fields:

- **id** - Unique identifier
- **user_id** - Foreign key to Supabase Auth
- **title** - Title of the link
- **url** - The URL string
- **description** - Optional description
- **keywords** - Optional keywords for searching
- **category** - Link category
- **favorite** - Boolean favorite status
- **created_at** - Creation timestamp
- **updated_at** - Last update timestamp

Contributions are welcome! Please feel free to submit a Pull Request.

**Credlyst** - Manage your links, effortlessly.
