# 🍽️ Avadhut Bhel — POS System

A full-stack Point of Sale (POS) application for Avadhut Bhel shop.  
Built with **React + TypeScript + Vite** (frontend) and **Node.js + Express + TypeORM + PostgreSQL** (backend).

---

## 📁 Project Structure

```
Avadhut_bhel/
│
├── backend/                        ← Node.js API Server
│   ├── .env                        ← DB + SMTP credentials (DO NOT commit)
│   ├── .env.example                ← Template for .env
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                ← Express app entry point
│       ├── data-source.ts          ← TypeORM PostgreSQL connection
│       ├── entities/
│       │   ├── Bill.ts             ← Bill ORM entity
│       │   ├── BillItem.ts         ← Line-item ORM entity
│       │   └── Customer.ts         ← Customer ORM entity
│       ├── routes/
│       │   ├── bills.ts            ← POST/GET /api/bills
│       │   ├── customers.ts        ← CRUD /api/customers
│       │   └── reports.ts          ← GET /api/reports/daily & /summary
│       └── services/
│           └── emailService.ts     ← Nodemailer HTML email receipts
│
├── src/                            ← React Frontend (Vite + TypeScript)
│   ├── main.tsx                    ← React entry point
│   ├── App.tsx                     ← Root component + state management
│   ├── index.css                   ← Global styles + Tailwind
│   ├── components/
│   │   ├── Header.tsx              ← Top nav (POS / Reports tabs)
│   │   ├── CategoryTabs.tsx        ← Category filter tabs
│   │   ├── SearchBar.tsx           ← Menu search box
│   │   ├── FoodCard.tsx            ← Menu item card
│   │   ├── Cart.tsx                ← Right-side cart panel
│   │   ├── CartItem.tsx            ← Cart line item
│   │   ├── BillSummary.tsx         ← Subtotal / discount / total bar
│   │   ├── BillPreview.tsx         ← Printable bill + Send Email button
│   │   ├── CustomerModal.tsx       ← Saved / New customer selector
│   │   └── ReportsPage.tsx         ← Daily sales reports & analytics
│   ├── data/
│   │   └── foodItems.ts            ← Menu items & categories
│   └── services/
│       └── api.ts                  ← Typed fetch wrappers for backend API
│
├── public/
│   └── images/                     ← Food item images
│
├── index.html                      ← HTML shell for Vite
├── vite.config.ts
├── tailwind.config.js
├── package.json                    ← Frontend dependencies
├── run.bat                         ← One-click startup (DB + Backend + Frontend)
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** running locally

### 1. Configure environment
```
backend/.env        ← copy from backend/.env.example and fill in:
  DB_PASSWORD=      ← your PostgreSQL password
  SMTP_USER=        ← Gmail address
  SMTP_PASS=        ← Gmail App Password (16 chars, no spaces)
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### 3. Run everything
Double-click **`run.bat`** — it will:
- Auto-create the `avadhut_bhel` database if missing
- Start the backend API on `http://localhost:3001`
- Start the frontend on `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/bills` | Create bill + optional email |
| GET | `/api/bills` | List all bills |
| POST | `/api/bills/:id/send-email` | Re-send bill email |
| GET | `/api/customers` | List / search customers |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily sales report |
| GET | `/api/reports/summary` | 30-day summary |

---

## ✨ Features

- 🛒 **POS Interface** — add items to bill, manage quantities, apply discounts
- 👤 **Customer Management** — save customers, select from history, auto-fill details
- 📧 **Email Receipts** — send beautiful HTML bill directly to customer's Gmail
- 🖨️ **Print Bills** — thermal-printer friendly layout
- 📊 **Daily Reports** — revenue, top items, hourly chart, bills table
- 📅 **30-day Summary** — overall performance overview
- 💾 **PostgreSQL** — all bills and customers saved permanently
