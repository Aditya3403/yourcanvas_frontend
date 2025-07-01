# YOURCANVAS_FRONTEND 🖼️✨

This is the **frontend** for the YourCanvas web application. Built using **Next.js** and **TypeScript**, it allows users to upload images, select fonts, and interact with the canvas tool provided by the backend.

---

## 📁 Folder Structure

```
YOURCANVAS_FRONTEND/
│
├── client/
│   ├── .next/                   # Next.js build output (auto-generated)
│   ├── app/                     # Application entry (Next.js App Router)
│   │   ├── favicon.ico
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Homepage (main UI)
│   │
│   ├── components/
│   │   └── Dropzone.tsx         # File drop/upload component
│   │
│   ├── public/                  # Static assets
│   ├── .env                     # Environment variables
│   ├── .gitignore
│   ├── eslint.config.mjs       # ESLint configuration
│   ├── next.config.ts          # Next.js configuration
│   ├── postcss.config.mjs      # PostCSS configuration
│   ├── tailwind.config.ts      # Tailwind CSS configuration (if used)
│   ├── tsconfig.json           # TypeScript config
│   ├── package.json            # Project dependencies and scripts
│   └── README.md               # Project overview (you are here)
```

---

## ⚙️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS 
- PostCSS
- React Dropzone (for drag-and-drop uploads)
- .env for environment configuration

---

## 🧪 Setup & Installation

```bash
# Clone the repository
git clone [https://github.com/yourusername/YOURCANVAS_FRONTEND.git](https://github.com/Aditya3403/yourcanvas_frontend.git)

# Move into the directory
cd client

# Install dependencies
npm install
```

---

## 🏁 Running the Development Server

```
npm run dev
```

App will run on: `http://localhost:3000` by default.

---

## 🌐 Environment Variables

Create a `.env` file in the root with:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

---



## 💡 Features

- Drag and drop image uploads
- Connects to the backend to preview or generate canvas exports
- Responsive and styled using utility-first CSS
- Environment-based URL switching

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
