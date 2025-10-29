# Streamfinitytv WhatsApp - Frontend

React-based frontend for managing WhatsApp sessions, messages, and automated bots.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3000

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── api.js            # API client
│   ├── pages/
│   │   ├── Dashboard.js      # Main dashboard
│   │   ├── Sessions.js       # Session management
│   │   ├── Messages.js       # Send messages
│   │   ├── Bots.js           # Bot automation
│   │   └── *.css             # Page styles
│   ├── App.js                # Main app component
│   ├── App.css               # App styles
│   ├── index.js              # Entry point
│   └── index.css             # Global styles
├── package.json
└── .env.example
```

## 🎨 Pages

### Dashboard
- Overview statistics
- Quick start guide
- Feature highlights

### Sessions
- Create WhatsApp sessions
- Scan QR codes
- View connection status
- Delete sessions

### Messages
- Send individual messages
- View message history
- Track sent/received messages
- Multi-session support

### Bots
- Create automated bots
- Schedule message sending
- Manage target recipients
- Edit/delete bots
- Manual triggering

## 🛠️ Technologies

- **React**: UI framework
- **React Router**: Navigation
- **Axios**: HTTP client
- **CSS3**: Styling with gradients and animations

## 📱 Responsive Design

The UI is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎨 Theme

The app uses a modern gradient theme:
- Primary: Purple gradient (#667eea to #764ba2)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)

## 🔄 Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `build/` folder to Netlify

### Environment Variables

Don't forget to set environment variables in your deployment platform:
- `REACT_APP_API_URL`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 🎯 Features

### Real-time Updates
- Auto-refresh session status (5s interval)
- Auto-refresh messages (10s interval)
- Live QR code updates

### User Experience
- Loading states
- Error handling
- Form validation
- Confirmation dialogs
- Success/error alerts

### Accessibility
- Semantic HTML
- Keyboard navigation
- Screen reader support
- Focus states

## 🐛 Troubleshooting

### CORS Issues
Ensure backend has CORS enabled for your frontend URL.

### API Connection Failed
Check `REACT_APP_API_URL` in `.env` and ensure backend is running.

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Code Style

- Use functional components with hooks
- Keep components focused and small
- Use CSS modules for component styles
- Follow React best practices

## 🔐 Security

- Never commit `.env` files
- Don't expose sensitive API keys
- Validate user inputs
- Use HTTPS in production

## 🤝 Contributing

When contributing:
1. Follow existing code style
2. Test on multiple screen sizes
3. Ensure no console errors
4. Update documentation

