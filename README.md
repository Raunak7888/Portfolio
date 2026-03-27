# 🎯 Raunak Yadav's Portfolio

A modern, interactive full-stack portfolio website showcasing real-time chat applications, multiplayer game platforms, and algorithmic projects. Built with **Next.js**, **React**, and **TypeScript** for a seamless, production-grade experience.

---

## ✨ Features

- 🎨 **Dark Mode & Theme Switching** – Smooth accent color customization
- 📱 **Fully Responsive** – Mobile-first design with beautiful animations
- 🌐 **Interactive Skills Graph** – Visual tech stack relationships and connections
- 📧 **Contact Form Integration** – Email notifications with Gmail SMTP
- 🎬 **Smooth Animations** – GSAP-powered page transitions and interactions
- 🚀 **Project Showcase** – Detailed project pages with architecture diagrams and highlights
- 🔗 **Social Links** – GitHub, LinkedIn, Instagram, and email integration
- ⚡ **Performance Optimized** – Next.js with SSR and dynamic imports

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15.5.3** – React framework with SSR and ISR
- **React 19.1.0** – UI library with hooks and state management
- **TypeScript** – Type-safe development
- **Tailwind CSS 4** – Utility-first styling
- **GSAP** – Advanced animations and transitions
- **Shadcn/ui** – Reusable component library

### Backend (Contact API)
- **Next.js API Routes** – Serverless contact endpoint
- **Nodemailer** – Email delivery via Gmail SMTP
- **Zod** – Request validation

### Tools & Infrastructure
- **Git** – Version control
- **Docker** – Containerization support
- **ESLint** – Code quality

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org))
- **npm** v9+ or **yarn** v3+
- **Git** installed
- Gmail account with [2-Factor Authentication](https://myaccount.google.com/security) enabled
- Gmail [App Password](https://myaccount.google.com/apppasswords) generated

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Raunak7888/Portfolio.git
cd Portfolio
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Gmail SMTP Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Optional: API endpoint configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### How to Get Gmail App Password:

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Copy the 16-character password
4. Paste it as `EMAIL_PASS` in `.env.local`

> ⚠️ **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4️⃣ Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5️⃣ Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
.
├── app/
│   ├── api/
│   │   └── contact/route.ts          # Contact form API endpoint
│   ├── project/[projectId]/          # Dynamic project detail pages
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
│
├── components/
│   ├── section/                      # Page sections
│   │   ├── hero/                     # Hero section with intro
│   │   ├── about/                    # About me section
│   │   ├── skill/                    # Interactive skills graph
│   │   ├── project/                  # Projects showcase
│   │   ├── contact/                  # Contact section
│   │   ├── navbar/                   # Navigation bar
│   │   └── footer/                   # Footer
│   ├── ui/                           # Shadcn/ui components
│   ├── GridBackground.tsx            # Animated background
│   ├── PageTransition.tsx            # Page transition effects
│   └── ThemeToggle.tsx               # Dark/Light mode toggle
│
├── Data/
│   ├── Data.json                     # Portfolio data (hero, about, skills)
│   └── Project.json                  # Projects metadata
│
├── hooks/
│   └── useMounted.tsx                # Hydration-safe hook
│
├── lib/
│   ├── gsap.ts                       # GSAP utilities
│   └── utils.ts                      # Helper functions
│
├── .env.local                        # Environment variables (not committed)
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── next.config.ts                    # Next.js configuration
```

---

## 📝 Configuration Files

### `Data/Data.json`

Contains personal information and about section data:

```json
{
  "hero": {
    "firstName": "Raunak",
    "secondName": "Yadav",
    "email": "raunakyadav7888@gmail.com"
  },
  "heroSection": {
    "description": "Your professional tagline...",
    "socialLinks": {
      "githubUrl": "https://github.com/...",
      "linkedInUrl": "https://linkedin.com/...",
      "instagramUrl": "https://instagram.com/...",
      "gmailUrl": "mailto:..."
    }
  },
  "about": {
    "segments": [
      {
        "id": "01",
        "title": "Section Title",
        "label": "Label",
        "text": "Description..."
      }
    ]
  }
}
```

### `Data/Project.json`

Contains projects information:

```json
{
  "projects": [
    {
      "id": "project-id",
      "title": "Project Name",
      "category": "Category",
      "badge": "Active",
      "accent": "#COLOR",
      "iconKey": "icon-name",
      "highlights": ["Highlight 1", "Highlight 2"],
      "description": "Project description...",
      "tech": ["Tech1", "Tech2"],
      "github": "https://github.com/...",
      "images": ["image-url-1", "image-url-2"]
    }
  ]
}
```

---

## 📧 Contact Form Setup

The contact form uses Gmail SMTP to send emails. Ensure:

1. **Gmail 2FA is enabled** – Required for app passwords
2. **App password generated** – 16-character password from Google Account
3. **.env.local configured** – Both `EMAIL_USER` and `EMAIL_PASS` set

### Contact API Endpoint

**POST** `/api/contact`

Request body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}
```

Response:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## 🎨 Customization

### Change Theme Colors

Modify Tailwind CSS in `tailwind.config.ts`:

```ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#7C7CFF', // Purple accent
        secondary: '#22C55E', // Green accent
      }
    }
  }
}
```

### Update Personal Information

Edit `Data/Data.json`:
- Update hero name, email, social links
- Modify about section segments
- Add your own descriptions

### Add New Projects

Add entries to `Data/Project.json`:

```json
{
  "id": "my-project",
  "title": "My Awesome Project",
  "category": "Web Development",
  "description": "...",
  "tech": ["Next.js", "React"],
  "github": "https://github.com/...",
  "images": ["..."]
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" → Select your repository
4. Add environment variables:
   - `EMAIL_USER`
   - `EMAIL_PASS`
5. Click "Deploy"

### Deploy to Netlify

1. Push to GitHub
2. Connect repository to Netlify
3. Add environment variables in project settings
4. Deploy

### Docker Deployment

```bash
# Build Docker image
docker build -t portfolio .

# Run container
docker run -p 3000:3000 \
  -e EMAIL_USER=your-email@gmail.com \
  -e EMAIL_PASS=your-app-password \
  portfolio
```

---

## 🔧 Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Format code with Prettier
npm run format
```

---

## 📸 Screenshots

| Section | Preview |
|---------|---------|
| **Hero** | Engaging introduction with social links |
| **About** | Personal philosophy and approach |
| **Skills** | Interactive tech stack graph |
| **Projects** | Detailed project showcase |
| **Contact** | Email contact form |

---

## 🐛 Troubleshooting

### Contact form not sending emails?

**Problem:** `Error: Authentication failed`

**Solution:**
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env.local`
- Check app password is exactly 16 characters
- Ensure 2FA is enabled on Gmail account
- Restart dev server after updating `.env.local`

### Environment variables not loading?

**Solution:**
- Create `.env.local` in **root directory** (not in `app/` or other folders)
- Restart dev server: `npm run dev`
- Variables must start with `NEXT_PUBLIC_` to be accessible in browser

### Skills graph not displaying?

**Solution:**
- Clear browser cache (`Ctrl+Shift+Delete`)
- Check console for errors (`F12` → Console tab)
- Ensure `Data/Data.json` has proper structure

### Styles not applying?

**Solution:**
```bash
# Clear Tailwind cache
rm -rf .next
npm run dev
```

---

## 📚 Learning Resources

- **Next.js Docs** – [nextjs.org/docs](https://nextjs.org/docs)
- **React Docs** – [react.dev](https://react.dev)
- **Tailwind CSS** – [tailwindcss.com](https://tailwindcss.com/docs)
- **GSAP** – [gsap.com](https://gsap.com)
- **Shadcn/ui** – [ui.shadcn.com](https://ui.shadcn.com)

---

## 📄 License

This project is open source under the **MIT License** – see [LICENSE](Licence.txt) file for details.

---

## 🤝 Contributing

Found a bug or want to suggest improvements?

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Raunak Yadav**

- 🌐 Portfolio: [raunakyadav.dev](https://raunakyadav.dev)
- 💼 LinkedIn: [@RaunakYada51596](https://linkedin.com/in/raunakyadav7888)
- 🐙 GitHub: [@Raunak7888](https://github.com/Raunak7888)
- 📧 Email: [raunakyadav7888@gmail.com](mailto:raunakyadav7888@gmail.com)

---

## 📞 Support

Have questions or issues? Reach out:

- **Create an Issue** – GitHub Issues tab
- **Email** – raunakyadav7888@gmail.com
- **Contact Form** – Use the portfolio contact section

---

## 🎯 Roadmap

- [ ] Add blog section with markdown support
- [ ] Implement dark mode persistence
- [ ] Add project filtering by technology
- [ ] Create resume download functionality
- [ ] Add testimonials section
- [ ] Implement analytics tracking
- [ ] Add newsletter subscription

---

<div align="center">

**Made with ❤️ by Raunak Yadav**

⭐ If this portfolio template helped you, please consider giving it a star!

Everything's open source. Take it, build better.

</div>