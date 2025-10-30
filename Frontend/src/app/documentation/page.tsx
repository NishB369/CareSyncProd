"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ChevronRight, Linkedin, Github, Mail } from "lucide-react";

interface OutputLine {
  type: "command" | "output" | "error" | "system";
  text: string;
}

interface Sections {
  [key: string]: string;
}

const TerminalDocs: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>("~/caresync");
  const [command, setCommand] = useState<string>("");
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const terminalBodyRef = React.useRef<HTMLDivElement>(null);

  const sections: Sections = {
    overview: `CareSync - Healthcare Management System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A comprehensive healthcare management platform for efficient 
patient appointment scheduling, doctor management, and queue 
organization.

🔗 Live: https://care-sync-prod.vercel.app/
📦 Repo: https://github.com/NishB369/CareSyncProd
📹 Demo: https://www.youtube.com/watch?v=jOoPzpE6Ytg

Deployments:
• Frontend → Vercel
• Backend  → Render`,

    features: `Features
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Authentication
   • JWT-based secure auth
   • Email/password login
   • Role-based access control

📊 Dashboard
   • Real-time clinic insights
   • Interactive data visualization
   • Comprehensive operations overview

👨‍⚕️ Doctor Management
   • Full CRUD operations
   • Availability slot management
   • Schedule tracking

📅 Appointment Management
   • Intuitive booking flow
   • Reschedule & cancel options
   • Auto conflict prevention

⏱️ Queue Management
   • Walk-in patient support
   • Pre-booked check-in with codes
   • Real-time queue status`,

    tech: `Tech Stack
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:
├─ Next.js 15.5.4
├─ React 19.1.0
├─ Tailwind CSS 4
├─ Recharts 3.2.1
├─ Axios
└─ TypeScript

Backend:
├─ Node.js + Express 5.1.0
├─ Prisma ORM 6.16.3
├─ JWT Authentication
├─ bcryptjs
├─ Multer (file upload)
├─ Resend (email)
├─ Cloudinary (storage)
└─ TypeScript`,

    structure: `Project Structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
caresync/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── alertpage/
│   │   │   ├── auth/login/manager/
|   |   |   ├── documentation/
|   |   |   ├── landingpage/
│   │   │   └── manager/
│   │   │       ├── appointments/
│   │   │       ├── doctors/
│   │   │       ├── help/
│   │   │       ├── home/
│   │   │       └── queue/
│   │   ├── public/
│   │   └── ...config files
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── db/
    │   ├── middlewares/
    │   ├── routes/
    │   ├── services/
    │   ├── types/
    │   ├── utils/
    │   └── index.ts
    ├── prisma/
    └── package.json`,

    install: `Installation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prerequisites:
• Node.js v18+
• PostgreSQL
• npm/yarn

Steps:

1️⃣ Clone repository
   $ git clone <repository-url>
   $ cd caresync

2️⃣ Setup Backend
   $ cd backend
   $ npm install
   $ cp .env.example .env
   $ npx prisma migrate dev
   $ npm run dev

3️⃣ Setup Frontend
   $ cd frontend
   $ npm install
   $ cp .env.example .env.local
   $ npm run dev

4️⃣ Access
   Frontend: http://localhost:3000
   Backend:  http://localhost:8000`,

    config: `Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend .env:
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
CLOUDINARY_CLOUD_NAME="your-name"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
PORT=8000

Frontend .env.local:
NEXT_PUBLIC_API_URL="http://localhost:8000"`,

    api: `API Endpoints
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Authentication:
POST   /api/auth/login
POST   /api/auth/logout

Dashboard:
GET    /api/home/

Doctors:
POST   /api/doctors/add
PUT    /api/doctors/edit/:id
GET    /api/doctors/all-doctors
DELETE /api/doctors/:id
DELETE /api/doctors/availability/:id
GET    /api/doctors/:id/slots

Appointments:
POST   /api/appointments/schedule
POST   /api/appointments/reschedule/:id
GET    /api/appointments/all-appointments
DELETE /api/appointments/:id
DELETE /api/appointments/doctor/:id

Queue:
GET    /api/queue/all

Note: All endpoints except /auth/login require JWT`,

    workflow: `Usage Flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Landing Page → Dashboard
2. Login → Authenticate
3. Dashboard → View stats
4. Doctor Management → Add/manage doctors
5. Appointment Booking → Schedule patients
6. Queue Management → Manage patient flow`,

    contact: `Contact & Links
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Author: Nishchay Bhatia

📧 Email:    nishbcodes@gmail.com
💼 LinkedIn: linkedin.com/in/nishchay-bhatia
🐙 GitHub:   github.com/nishb369

Project:
🌐 Live:     care-sync-prod.vercel.app
📦 Repo:     github.com/NishB369/CareSyncProd

License: ISC`,

    help: `Available Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
help       Show this help message
clear      Clear terminal
ls         List available sections
cat <sec>  Display section content

Sections:
• overview   • features   • tech
• structure  • install    • config
• api        • workflow   • contact

Examples:
$ cat overview
$ cat install
$ ls`,
  };

  const handleCommand = (cmd: string): void => {
    const trimmedCmd = cmd.trim();
    setCommandHistory([...commandHistory, trimmedCmd]);
    setHistoryIndex(-1);

    const newOutput: OutputLine[] = [
      ...output,
      { type: "command", text: `$ ${trimmedCmd}` },
    ];

    if (trimmedCmd === "clear") {
      setOutput([]);
      setCommand("");
      return;
    }

    if (trimmedCmd === "help") {
      newOutput.push({ type: "output", text: sections.help });
    } else if (trimmedCmd === "ls") {
      const list = Object.keys(sections)
        .filter((k) => k !== "help")
        .join("  ");
      newOutput.push({ type: "output", text: `Available sections:\n${list}` });
    } else if (trimmedCmd.startsWith("cat ")) {
      const section = trimmedCmd.split(" ")[1];
      if (sections[section]) {
        newOutput.push({ type: "output", text: sections[section] });
      } else {
        newOutput.push({
          type: "error",
          text: `Error: Section '${section}' not found. Type 'ls' to see available sections.`,
        });
      }
    } else if (trimmedCmd === "") {
    } else {
      newOutput.push({
        type: "error",
        text: `Command not found: ${trimmedCmd}\nType 'help' for available commands.`,
      });
    }

    setOutput(newOutput);
    setCommand("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleCommand(command);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  useEffect(() => {
    setOutput([
      { type: "system", text: "CareSync Documentation Terminal v1.0.0" },
      {
        type: "system",
        text: 'Type "help" for available commands or "cat overview" to get started.',
      },
      { type: "system", text: "" },
    ]);
  }, []);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-mono text-sm border-2 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Terminal Header */}
        <div className="bg-gray-800 rounded-t-lg border-b border-gray-700 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center gap-2 ml-4 text-gray-400">
            <Terminal size={16} />
            <span>CareSync Documentation</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalBodyRef}
          className="bg-black rounded-b-lg p-6 h-[550px] overflow-y-scroll"
        >
          {/* Output */}
          <div className="space-y-2 mb-4">
            {output.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === "command"
                    ? "text-green-400"
                    : line.type === "error"
                    ? "text-red-400"
                    : line.type === "system"
                    ? "text-blue-400"
                    : "text-gray-300"
                }
              >
                <pre className="whitespace-pre-wrap font-mono">{line.text}</pre>
              </div>
            ))}
          </div>

          {/* Input Line */}
          <div className="flex items-center gap-2">
            <span className="text-green-400">{currentPath}</span>
            <ChevronRight size={16} className="text-green-400" />
            <input
              type="text"
              value={command}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCommand(e.target.value)
              }
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-gray-100 outline-none caret-green-400"
              autoFocus
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-gray-500 text-xs">
          <p>Built with Next.js, TypeScript & Tailwind CSS</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a
              href="https://www.linkedin.com/in/nishchay-bhatia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-gray-400"
            >
              <Linkedin size={14} />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/nishb369"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-gray-400"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
            <a
              href="mailto:nishbcodes@gmail.com"
              className="flex items-center gap-1 hover:text-gray-400"
            >
              <Mail size={14} />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalDocs;
