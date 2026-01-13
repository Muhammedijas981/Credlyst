# Credlyst 🔗

A beautiful, privacy-focused link management web application with local SQL database storage.

![Credlyst](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔗 **Save Links** - Add your frequently used URLs to a centralized list
- 🔍 **Full-Text Search** - Quickly find links using SQLite FTS5 search
- ✏️ **Edit/Delete Links** - Manage your saved links with ease
- 🌙 **Dark Mode** - Beautiful UI with dark mode support
- 📱 **Mobile Responsive** - Optimized for use on any device
- 🔒 **100% Privacy** - All data stays on your device (IndexedDB)
- ⚡ **Lightning Fast** - No server latency, instant search
- 💾 **Offline First** - Works completely offline
- 🏷️ **Tags & Categories** - Organize links your way
- ⭐ **Favorites** - Quick access to your most important links

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript
- **Database**: SQL.js (SQLite in JavaScript)
- **Storage**: IndexedDB for persistence
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables
- **Icons**: Lucide Icons (via SVG)

## 📁 Project Structure

```
credlyst/
├── src/
│   ├── components/       # UI Components (future)
│   ├── pages/           # Page Components (future)
│   ├── services/        # Business Logic
│   │   ├── database.js
│   │   ├── linkManager.js
│   │   └── searchEngine.js
│   ├── styles/          # CSS Styles
│   │   ├── variables.css
│   │   └── main.css
│   ├── config/          # Configuration
│   │   └── schema.sql
│   ├── App.js           # Main app component
│   └── main.js          # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## 💡 Usage

### Adding a Link

1. Click the "Add Link" button in the navbar
2. Fill in the link details (title, URL, description, keywords, category)
3. Click "Add Link" to save

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

Credlyst uses SQLite (via SQL.js) with the following tables:

- **links** - Stores link information
- **tags** - Tag definitions
- **link_tags** - Many-to-many relationship between links and tags
- **link_history** - Track link usage
- **settings** - App settings

### Full-Text Search

Uses SQLite FTS5 (Full-Text Search) for blazing fast search across:
- Link titles
- URLs
- Descriptions
- Keywords

### Privacy & Data

- **100% Local** - All data stored in browser's IndexedDB
- **No Tracking** - No analytics or external requests
- **No Account Required** - No sign-up, no login
- **Portable** - Export/import your data anytime (coming soon)

## 🗺️ Roadmap

### Version 1.1
- [ ] Import/Export functionality
- [ ] Link editing
- [ ] Bulk operations
- [ ] Analytics dashboard

### Version 1.2
- [ ] Tag management UI
- [ ] Category management
- [ ] Link preview with metadata
- [ ] Keyboard shortcuts

### Version 2.0
- [ ] Browser extension
- [ ] Cloud sync (optional)
- [ ] Collaboration features
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by [Your Name]

## 🙏 Acknowledgments

- SQL.js for bringing SQLite to the browser
- Vite for the amazing build tool
- The open-source community

---

**Credlyst** - Manage your links, effortlessly.
