import { useState } from "react";

const phases = [
  {
    id: 1,
    emoji: "🧠",
    label: "Phase 1",
    title: "Discovery & Planning",
    bigTechEquivalent: "Product Requirements & System Design",
    duration: "~2 days",
    color: "#6366f1",
    tasks: [
      { task: "Read and annotate the project spec (CS4092)", detail: "Highlight all entities, relationships, and actions required." },
      { task: "Define your app idea: Smart Grocery Shopping App", detail: "What makes it 'smart'? Filters by diet? Auto-reorder? Write it down." },
      { task: "Draw your ER Model (Deliverable 1)", detail: "Entities: Customer, Product, Order, Warehouse, Staff, CreditCard, DeliveryPlan. Use draw.io or Lucidchart." },
      { task: "List all your app's pages/screens", detail: "e.g., Home, Product Listing, Product Detail, Cart, Checkout, Account, Staff Dashboard." },
      { task: "Write your README.md skeleton", detail: "Add project title, tech stack, how to run locally. You'll fill it in as you go." },
    ],
    deliverable: "ER Diagram (due April 10) + README skeleton on GitHub",
  },
  {
    id: 2,
    emoji: "🗄️",
    label: "Phase 2",
    title: "Database Design",
    bigTechEquivalent: "Data Modeling & Schema Review",
    duration: "~3 days",
    color: "#0ea5e9",
    tasks: [
      { task: "Translate ER model into PostgreSQL schema (Deliverable 2)", detail: "Create tables: users, products, orders, order_items, warehouses, stock, credit_cards, delivery_plans." },
      { task: "Add constraints: PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE", detail: "This is what separates a real schema from a rough draft." },
      { task: "Add indexes on frequently queried columns", detail: "e.g., product name, category, customer email. Required by the spec." },
      { task: "Write seed data (sample data to test with)", detail: "At least 10 products, 2 warehouses, 3 customers, 2 staff members." },
      { task: "Test your SQL script — it must run without errors", detail: "Run it in psql or a local Postgres instance from scratch." },
    ],
    deliverable: "schema.sql committed to /database folder on GitHub (due April 10)",
  },
  {
    id: 3,
    emoji: "⚙️",
    label: "Phase 3",
    title: "Backend (API) Development",
    bigTechEquivalent: "Backend Engineering Sprint",
    duration: "~7 days",
    color: "#10b981",
    tasks: [
      { task: "Initialize Node.js + Express project", detail: "npm init, install express, prisma, cors, dotenv, bcrypt, jsonwebtoken." },
      { task: "Set up Prisma ORM connected to PostgreSQL", detail: "Run npx prisma init, define your schema.prisma to match your SQL schema." },
      { task: "Build Auth routes: POST /register, POST /login", detail: "Use bcrypt for passwords. Return JWT tokens. Separate customer vs staff roles." },
      { task: "Build Product routes: GET /products, GET /products/:id", detail: "Support filtering by category/name for the 'smart' search feature." },
      { task: "Build Cart & Order routes", detail: "POST /cart, DELETE /cart/:item, POST /orders — reduce stock on order placed." },
      { task: "Build Staff routes (protected)", detail: "POST/PUT/DELETE /products, POST /stock — guard with role middleware." },
      { task: "Build Account routes", detail: "CRUD for credit cards and addresses." },
      { task: "Test every route with Postman or Thunder Client", detail: "Document each endpoint. This is your internal API contract." },
    ],
    deliverable: "Working REST API committed to /backend folder",
  },
  {
    id: 4,
    emoji: "🎨",
    label: "Phase 4",
    title: "Frontend Development",
    bigTechEquivalent: "Frontend Engineering Sprint",
    duration: "~7 days",
    color: "#f59e0b",
    tasks: [
      { task: "Initialize Next.js project", detail: "npx create-next-app@latest. Set up folder structure: /pages, /components, /hooks, /context." },
      { task: "Build layout: Navbar, Footer, protected routes", detail: "Navbar shows cart count, login/logout, role-aware links." },
      { task: "Build Product Listing page with search/filter", detail: "Fetch from your GET /products API. Add category filter dropdowns." },
      { task: "Build Product Detail page", detail: "Show product info + 'Add to Cart' button." },
      { task: "Build Shopping Cart page", detail: "Show items, quantities, subtotal. Allow remove/update." },
      { task: "Build Checkout page", detail: "Select credit card, choose delivery type (standard/express), place order." },
      { task: "Build Account page", detail: "Manage addresses and credit cards." },
      { task: "Build Staff Dashboard", detail: "Add/edit/delete products, update stock — only visible if role = staff." },
    ],
    deliverable: "Working React frontend committed to /frontend folder",
  },
  {
    id: 5,
    emoji: "🔗",
    label: "Phase 5",
    title: "Integration & Testing",
    bigTechEquivalent: "QA / Integration Testing Sprint",
    duration: "~3 days",
    color: "#ec4899",
    tasks: [
      { task: "Connect frontend to backend (axios / fetch)", detail: "Make sure all pages call real API endpoints, not mock data." },
      { task: "Handle loading states and errors gracefully", detail: "Show spinners, error messages — this is what separates a demo from a real app." },
      { task: "Test the full user flow end-to-end", detail: "Register → Browse → Add to Cart → Checkout → Check order status." },
      { task: "Test the full staff flow", detail: "Login as staff → Add product → Update stock → View orders." },
      { task: "Fix bugs found during testing", detail: "Keep a simple bug list in your README or a GitHub Issue." },
    ],
    deliverable: "Fully integrated app running locally end-to-end",
  },
  {
    id: 6,
    emoji: "🚀",
    label: "Phase 6",
    title: "Demo Video & Submission",
    bigTechEquivalent: "Product Launch / Demo Day",
    duration: "~2 days",
    color: "#8b5cf6",
    tasks: [
      { task: "Record your 5-minute demo video", detail: "Show: product browsing, cart, checkout, staff dashboard. Use Loom or OBS." },
      { task: "Write the contribution PDF for your group", detail: "Required by the spec — list each member's specific contributions." },
      { task: "Clean up your GitHub repo", detail: "Check folder structure: /er-model, /database, /backend, /frontend. Add final README." },
      { task: "Final submission to group repository", detail: "Double-check all 4 deliverables are in the repo before April 26." },
    ],
    deliverable: "Video demo + contribution PDF + clean GitHub repo (due April 26)",
  },
];

export default function Roadmap() {
  const [open, setOpen] = useState(null);
  const [checked, setChecked] = useState({});

  const toggle = (id) => setOpen(open === id ? null : id);
  const toggleCheck = (phaseId, taskIdx, e) => {
    e.stopPropagation();
    const key = `${phaseId}-${taskIdx}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const phaseProgress = (phaseId, taskCount) => {
    let done = 0;
    for (let i = 0; i < taskCount; i++) {
      if (checked[`${phaseId}-${i}`]) done++;
    }
    return done;
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: 780, margin: "0 auto", padding: "24px 16px", background: "var(--bg-primary, #0f172a)", minHeight: "100vh", color: "var(--text-primary, #f1f5f9)" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#f1f5f9" }}>Smart Grocery App</h1>
        <p style={{ color: "#94a3b8", marginTop: 6, fontSize: 14 }}>Full-Stack Project Roadmap — CS4092 · Stack: Next.js + Express + PostgreSQL</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          {["ER Model: Apr 10", "SQL Schema: Apr 10", "App + Video: Apr 26"].map(d => (
            <span key={d} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#cbd5e1" }}>{d}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {phases.map((phase) => {
          const isOpen = open === phase.id;
          const done = phaseProgress(phase.id, phase.tasks.length);
          const total = phase.tasks.length;
          const pct = Math.round((done / total) * 100);

          return (
            <div key={phase.id} style={{ borderRadius: 14, border: `1px solid ${isOpen ? phase.color : "#1e293b"}`, background: "#1e293b", overflow: "hidden", transition: "border-color 0.2s" }}>
              {/* Header */}
              <div onClick={() => toggle(phase.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer", userSelect: "none" }}>
                <div style={{ fontSize: 26, minWidth: 36, textAlign: "center" }}>{phase.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, background: phase.color + "22", color: phase.color, borderRadius: 6, padding: "2px 8px" }}>{phase.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{phase.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>Big Tech: <span style={{ color: "#94a3b8" }}>{phase.bigTechEquivalent}</span> · <span style={{ color: "#64748b" }}>{phase.duration}</span></div>
                  {done > 0 && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 4, background: "#0f172a", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: phase.color, borderRadius: 4, transition: "width 0.3s" }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{done}/{total}</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 18, color: "#475569", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</div>
              </div>

              {/* Body */}
              {isOpen && (
                <div style={{ borderTop: `1px solid #0f172a`, padding: "16px 18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {phase.tasks.map((t, i) => {
                      const key = `${phase.id}-${i}`;
                      const isDone = !!checked[key];
                      return (
                        <div key={i} onClick={(e) => toggleCheck(phase.id, i, e)} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "10px 12px", borderRadius: 10, background: isDone ? phase.color + "11" : "#0f172a", border: `1px solid ${isDone ? phase.color + "44" : "#1e293b"}`, transition: "all 0.15s" }}>
                          <div style={{ minWidth: 20, height: 20, borderRadius: 6, border: `2px solid ${isDone ? phase.color : "#334155"}`, background: isDone ? phase.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, transition: "all 0.15s" }}>
                            {isDone && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? "#94a3b8" : "#e2e8f0", textDecoration: isDone ? "line-through" : "none" }}>{t.task}</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{t.detail}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background: phase.color + "18", border: `1px solid ${phase.color}44`, borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: 12, color: phase.color, fontWeight: 600 }}>📦 Deliverable: </span>
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>{phase.deliverable}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 28, background: "#1e293b", borderRadius: 14, padding: "16px 20px", border: "1px solid #334155" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
          💡 <strong style={{ color: "#94a3b8" }}>Recommended GitHub folder structure:</strong><br />
          <code style={{ color: "#7dd3fc" }}>/er-model</code> · <code style={{ color: "#7dd3fc" }}>/database</code> · <code style={{ color: "#7dd3fc" }}>/backend</code> · <code style={{ color: "#7dd3fc" }}>/frontend</code> · <code style={{ color: "#7dd3fc" }}>README.md</code> · <code style={{ color: "#7dd3fc" }}>contribution.pdf</code>
        </p>
      </div>
    </div>
  );
}
