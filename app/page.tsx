"use client";

import { useState } from "react";
import {
  Activity, ArrowUpRight, Bot, CheckCircle2, ChevronDown, CircleHelp,
  Command, FileImage, FolderGit2, Gauge, LayoutDashboard, Menu,
  MessageSquareText, Paperclip, Plus, Search, ShieldCheck, Sparkles,
  Workflow, X
} from "lucide-react";

const agents = [
  { name: "CEO Orchestrator", role: "Planning & delegation", status: "Ready", initials: "CO", tone: "violet" },
  { name: "Software Developer", role: "Code & implementation", status: "Ready", initials: "SD", tone: "blue" },
  { name: "UI/UX Designer", role: "Visual systems", status: "Ready", initials: "UX", tone: "pink" },
  { name: "Quality Engineer", role: "Testing & verification", status: "Ready", initials: "QA", tone: "green" },
  { name: "Security Engineer", role: "Risk & access review", status: "Ready", initials: "SE", tone: "amber" }
];

const workflow = [
  { title: "Understand the request", detail: "Interpret instructions and reference files", icon: MessageSquareText },
  { title: "Inspect the project", detail: "Review source, structure, and current behavior", icon: Search },
  { title: "Plan and execute", detail: "Delegate work and make isolated changes", icon: Workflow },
  { title: "Test and repair", detail: "Run checks, inspect browser, fix failures", icon: ShieldCheck },
  { title: "Save and report", detail: "Store evidence, artifacts, and decisions", icon: CheckCircle2 }
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attached, setAttached] = useState<string[]>([]);
  const [notice, setNotice] = useState("The execution engine is not connected yet. This console is the first UI foundation.");
  const [active, setActive] = useState("Overview");

  function addFiles(files: FileList | null) {
    if (!files) return;
    setAttached(Array.from(files).map(file => file.name));
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Command size={20} /></div>
          <div><strong>OPERATIONS HQ</strong><span>AI WORKSPACE</span></div>
          <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18}/></button>
        </div>
        <div className="workspace-switch"><div className="workspace-avatar">M</div><div><strong>Owner workspace</strong><span>Personal HQ</span></div><ChevronDown size={15}/></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {[
            ["Overview", LayoutDashboard], ["AI Team", Bot], ["Tasks & workflows", Workflow],
            ["Projects", FolderGit2], ["Results Vault", FileImage]
          ].map(([label, Icon]) => {
            const I = Icon as typeof LayoutDashboard;
            return <button key={label as string} className={`nav-item ${active === label ? "active" : ""}`} onClick={() => {setActive(label as string); setNotice(label === "Overview" ? "Workspace overview." : `${label} section is part of the next implementation phase.`);}}><I size={17}/><span>{label as string}</span>{label === "Tasks & workflows" && <span className="nav-count">0</span>}</button>;
          })}
        </nav>
        <div className="nav-label second-label">SYSTEM</div>
        <nav className="nav-list">
          <button className="nav-item" onClick={() => setNotice("System health and integrations will appear here after the backend is connected.")}><Gauge size={17}/><span>System health</span></button>
          <button className="nav-item" onClick={() => setNotice("Security and approvals will be wired to the policy engine.")}><ShieldCheck size={17}/><span>Security & approvals</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><div><strong>Need a hand?</strong><span>Learn how your AI team works.</span></div><ArrowUpRight size={15}/></div>
          <div className="profile"><div className="profile-avatar">M</div><div><strong>Workspace owner</strong><span>Administrator</span></div><button className="icon-button" aria-label="Profile menu"><ChevronDown size={16}/></button></div>
        </div>
      </aside>

      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20}/></button><span className="breadcrumb">Workspace</span><span className="crumb-slash">/</span><strong>{active}</strong></div>
          <div className="topbar-right"><div className="system-pill"><span className="status-dot"/>System foundation</div><button className="icon-button" aria-label="Search"><Search size={18}/></button><div className="top-avatar">M</div></div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div><div className="eyebrow"><Sparkles size={14}/> YOUR AI OPERATIONS CENTER</div><h1>Build with your <span>AI team.</span></h1><p>Give an instruction. Your team will plan, execute, test, and report.</p></div>
            <div className="date-chip"><Activity size={15}/> Owner-controlled workspace</div>
          </div>

          <section className="composer-card">
            <div className="composer-top"><div className="composer-icon"><Sparkles size={18}/></div><div><strong>What should your team work on?</strong><span>Describe the outcome. Add screenshots, designs, or project files.</span></div><span className="secure-tag"><ShieldCheck size={13}/> Owner controlled</span></div>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Example: Inspect my website, compare it with the attached design, update the code, then test mobile and desktop..." rows={3}/>
            {attached.length > 0 && <div className="attachment-list">{attached.map(name => <span key={name}><FileImage size={13}/>{name}</span>)}</div>}
            <div className="composer-footer"><label className="attach-button"><Paperclip size={16}/> Attach files<input type="file" multiple accept="image/*,.pdf,.txt,.md,.zip" onChange={e => addFiles(e.target.files)} /></label><span className="composer-hint">Reference images · documents · project files</span><button className="primary-button" onClick={() => setNotice(prompt.trim() ? "Task submission is not active yet. The task engine and secure file storage must be connected before this can execute." : "Enter a task instruction first.")}> <Plus size={16}/> Create task <ArrowUpRight size={15}/></button></div>
          </section>

          <div className="section-heading"><div><h2>Workspace overview</h2><p>Your control center for coordinated AI work.</p></div><span className="muted-label">INITIAL SETUP</span></div>
          <div className="metrics-grid">
            <div className="metric-card"><div className="metric-top"><span>Active tasks</span><Workflow size={17}/></div><strong>—</strong><small>Execution engine pending</small></div>
            <div className="metric-card"><div className="metric-top"><span>AI specialists</span><Bot size={17}/></div><strong>12</strong><small>Roles defined in project spec</small></div>
            <div className="metric-card"><div className="metric-top"><span>Verified runs</span><CheckCircle2 size={17}/></div><strong>—</strong><small>Verification pipeline pending</small></div>
            <div className="metric-card"><div className="metric-top"><span>System health</span><Activity size={17}/></div><strong className="health-text">Foundation</strong><small>Application UI scaffold</small></div>
          </div>

          <div className="lower-grid">
            <section className="panel-card workflow-card"><div className="panel-heading"><div><h3>How work gets done</h3><p>One accountable execution loop.</p></div><span className="step-count">5 STEPS</span></div><div className="workflow-list">{workflow.map((step,index) => {const Icon=step.icon;return <div className="workflow-step" key={step.title}><div className="step-icon"><Icon size={17}/></div><div className="step-copy"><strong>{step.title}</strong><span>{step.detail}</span></div><span className="step-number">0{index+1}</span></div>})}</div></section>
            <section className="panel-card team-card"><div className="panel-heading"><div><h3>Meet your AI team</h3><p>Specialist roles and responsibilities.</p></div><button className="text-button" onClick={() => {setActive("AI Team");setNotice("All 12 specialist roles are specified; live agent execution is not yet wired.")}}>View team <ArrowUpRight size={14}/></button></div><div className="agent-list">{agents.map(agent => <div className="agent-row" key={agent.name}><div className={`agent-avatar ${agent.tone}`}>{agent.initials}</div><div className="agent-copy"><strong>{agent.name}</strong><span>{agent.role}</span></div><span className="ready-tag">Defined</span></div>)}</div></section>
          </div>

          <div className="notice-bar"><div className="notice-symbol"><Activity size={16}/></div><div><strong>Build status</strong><span>{notice}</span></div></div>
          <footer><span>AI OPERATIONS HQ <i>·</i> FOUNDATION 0.1.0</span><span>Built for accountable AI execution</span></footer>
        </div>
      </section>
    </main>
  );
}
