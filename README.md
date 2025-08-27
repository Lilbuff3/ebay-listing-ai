# eBay Listing Generator AI

An AI-powered web application that automatically generates optimized eBay listings from product images using Google Gemini Vision AI.

## 🚀 Features

- **AI Image Analysis**: Upload product photos and get instant AI-generated listings
- **Google Gemini Vision**: Advanced image recognition and description generation
- **eBay Integration**: Direct OAuth connection to your eBay seller account
- **Optimized Listings**: SEO-friendly titles, detailed descriptions, and pricing suggestions
- **Dark/Light Mode**: Beautiful responsive UI with theme switching
- **Copy to Clipboard**: Easy copying of generated content
- **TypeScript**: Fully typed for better development experience

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini 1.5 Flash Vision
- **Authentication**: eBay OAuth 2.0
- **Session Management**: Iron Session
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- Google Gemini API key
- eBay Developer account and API credentials

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ebay-listing-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
# Create .env.local file
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

4. Start development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🚀 Deployment

### Vercel Deployment

1. Fork/clone this repository
2. Deploy to Vercel
3. Configure environment variables in Vercel:
   - `API_KEY` - Your Google Gemini API key
   - `EBAY_CLIENT_ID` - eBay Developer Client ID
   - `EBAY_CLIENT_SECRET` - eBay Developer Client Secret  
   - `SESSION_SECRET` - Random 32+ character string
   - `EBAY_REDIRECT_URI` - Set to `https://your-app.vercel.app/api/ebay/callback`

### eBay Developer Setup

1. Visit [developer.ebay.com](https://developer.ebay.com)
2. Create an application
3. Set redirect URI to your deployed callback URL
4. Copy Client ID and Client Secret to Vercel environment variables

## 📝 How It Works

1. **Upload Images**: Drag and drop or select product images
2. **AI Analysis**: Google Gemini Vision analyzes the images
3. **Generate Listing**: AI creates optimized title, description, pricing, and categories
4. **eBay Integration**: Connect your eBay account via OAuth
5. **Post Listing**: Directly post to eBay or copy content manually

## 🔧 API Endpoints

- `POST /api/generateListing` - Analyze images and generate listing
- `GET /api/ebay/authUrl` - Get eBay OAuth authorization URL
- `GET /api/ebay/callback` - Handle eBay OAuth callback
- `GET /api/ebay/user` - Get connected eBay user info
- `POST /api/ebay/disconnect` - Disconnect eBay account
- `POST /api/ebay/postListing` - Post listing to eBay

## 🛡️ Security

- Environment variables for sensitive data
- Iron Session for secure session management
- Input validation and sanitization
- CORS configured for API endpoints

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## ⚡ Performance

- **Bundle Size**: ~158KB gzipped
- **Build Time**: ~500ms
- **First Load**: <2 seconds
- **AI Analysis**: 3-8 seconds per image set

## 🐛 Known Issues

- API folder requires Vercel environment for full functionality
- Some eBay API features are simplified for demonstration
- Rate limiting not implemented for AI calls

---

Made with ❤️ using React, TypeScript, and Google Gemini AI