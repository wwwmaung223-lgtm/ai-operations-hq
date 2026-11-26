"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity, ArrowUpRight, Bot, CheckCircle2, ChevronDown, CircleHelp,
  Command, FileImage, FolderGit2, Gauge, LayoutDashboard, LogOut, Menu,
  MessageSquareText, Paperclip, Plus, Search, ShieldCheck, Sparkles,
  Workflow, X, LoaderCircle
} from "lucide-react";

const API = "https://ai-team-live.myintaung7432.workers.dev";
type Agent = { id: string; agent_key: string; name: string; agent_role: string; status: string };
type Task = { id: string; title: string; description: string; status: string; priority: string; created_at: string };
type UploadedAttachment = { path: string; title: string; mime_type: string };
type FeedEvent = { id: number; title: string; detail: string; status: "working" | "done" | "error" | "info" };

const workflow = [
  { title: "Understand the request", detail: "Interpret instructions and reference files", icon: MessageSquareText },
  { title: "Inspect the project", detail: "Review source, structure, and current behavior", icon: Search },
  { title: "Plan and execute", detail: "Delegate work and make isolated changes", icon: Workflow },
  { title: "Test and repair", detail: "Run checks, inspect browser, fix failures", icon: ShieldCheck },
  { title: "Save and report", detail: "Store evidence, artifacts, and decisions", icon: CheckCircle2 }
];

type JsonRecord = Record<string, unknown>;
type JsonPayload = JsonRecord | unknown[];
type StreamEvent = {
  event?: string;
  task_id?: string;
  agent?: { name?: string };
  step?: number;
  output?: string;
  error?: string;
  from?: string;
  to?: string;
  persisted?: boolean;
  completed?: number;
  total?: number;
  title?: string;
  access_token?: string;
  report?: string;
  aspect_ratio?: string;
};
function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJsonResponse(response: Response, context: string): Promise<JsonPayload> {
  const raw = await response.text();
  let body: unknown = {};
  if (raw) {
    try { body = JSON.parse(raw); }
    catch { body = raw; }
  }
  if (!response.ok) {
    const candidate = isRecord(body)
      ? body.message || body.msg || body.error_description || body.error
      : body;
    const message = String(candidate || raw || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280);
    throw new Error(message || context + " failed (HTTP " + response.status + ")");
  }
  if (isRecord(body) || Array.isArray(body)) return body;
  const preview = String(body || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  throw new Error(context + " returned an unexpected non-JSON response" + (preview ? ": " + preview : ""));
}

export default function Home() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attached, setAttached] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<UploadedAttachment[]>([]);
  const [notice, setNotice] = useState("Sign in to load your private AI workspace.");
  const [active, setActive] = useState("Overview");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [collectiveStatus, setCollectiveStatus] = useState<{
    router:string;
    test:{success:boolean;provider:string;model:string;fallbackReason:string|null;attempts:{provider:string;available:boolean;error?:string;latencyMs?:number}[]};
    primary:{provider:string;model:string;available:boolean};
    freeProviders:{provider:string;mode:string;keyRequired:boolean;model:string;rateLimit:string;status:string}[];
    optionalProviders:{provider:string;configured:boolean;paidModelsBlocked:boolean}[];
    automaticPaidFallback:boolean;
    quotaPolicy:string;
  } | null>(null);
  const [collectiveError, setCollectiveError] = useState("");

  const api = useCallback(async (path: string, options: RequestInit = {}, authToken = token) => {
    const headers = new Headers(options.headers || {});
    if (authToken) headers.set("Authorization", "Bearer " + authToken);
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(API + path, { ...options, headers });
    const type = response.headers.get("content-type") || "";
    if (type.includes("json") || !response.ok) return readJsonResponse(response, path);
    return response;
  }, [token]);

  const refreshWorkspace = useCallback(async (authToken: string) => {
    const [user, team, history] = await Promise.all([
      api("/api/auth/user", {}, authToken),
      api("/api/agents", {}, authToken),
      api("/api/tasks", {}, authToken)
    ]);
    const userData = isRecord(user) ? user : {};
    setUserEmail(typeof userData.email === "string" ? userData.email : "");
    setAgents(Array.isArray(team) ? team as Agent[] : []);
    setTasks(Array.isArray(history) ? history as Task[] : []);
  }, [api]);

  useEffect(() => {
    if (!token) { setCollectiveStatus(null); setCollectiveError(""); return; }
    let cancelled = false;
    setCollectiveError("");
    api("/api/collective/status").then(data => { if (!cancelled && isRecord(data)) setCollectiveStatus(data as NonNullable<typeof collectiveStatus>); })
      .catch(error => { if (!cancelled) setCollectiveError(error instanceof Error ? error.message : "Live provider check failed"); });
    return () => { cancelled = true; };
  }, [token, api]);

  useEffect(() => {
    const saved = window.localStorage.getItem("ai-ops-session");
    if (!saved) return;
    setToken(saved);
    refreshWorkspace(saved).then(() => setNotice("Workspace connected. Your task history and specialist roster are loaded."))
      .catch(() => { window.localStorage.removeItem("ai-ops-session"); setToken(""); setNotice("Session expired. Please sign in again."); });
  }, [refreshWorkspace]);

  async function authenticate() {
    setAuthBusy(true); setAuthError("");
    try {
      const response = await fetch(API + (authMode === "login" ? "/api/auth/login" : "/api/auth/signup"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const payload = await readJsonResponse(response, authMode === "login" ? "Sign in" : "Create account");
      if (!isRecord(payload)) throw new Error("Authentication returned an invalid response");
      const data = payload;
      if (!response.ok) throw new Error(String(data.message || data.msg || data.error_description || data.error || "Authentication failed"));
      if (typeof data.access_token !== "string" || !data.access_token) {
        setAuthError("Account request received. Check your email for confirmation, then sign in.");
        setAuthMode("login"); return;
      }
      window.localStorage.setItem("ai-ops-session", data.access_token);
      setToken(data.access_token);
      await refreshWorkspace(data.access_token);
      setNotice("Signed in. Private workspace data loaded from the Operations database.");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in");
    } finally { setAuthBusy(false); }
  }

  async function signOut() {
    window.localStorage.removeItem("ai-ops-session");
    setToken(""); setUserEmail(""); setAgents([]); setTasks([]); setFeed([]); setAttached([]); setUploadedAttachments([]);
    setNotice("Signed out. Your saved tasks remain in your private database.");
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);
    const maxBytes = 5 * 1024 * 1024;
    const accepted = incoming.filter(file => file.size <= maxBytes);
    const tooLarge = incoming.filter(file => file.size > maxBytes);
    const slots = Math.max(0, 8 - attached.length - uploadedAttachments.length);
    const selected = accepted.slice(0, slots);
    if (selected.length) setAttached(current => [...current, ...selected]);
    if (tooLarge.length || selected.length < accepted.length) {
      const messages: string[] = [];
      if (tooLarge.length) messages.push(tooLarge.length + " file(s) exceed the 5 MB limit");
      if (selected.length < accepted.length) messages.push("only 8 attachments can be queued per task");
      setNotice(messages.join("; ") + ". Remove or reduce files before starting the task.");
    }
  }

  async function createTask() {
    const objective = prompt.trim();
    if (!objective || running || !token) return;
    setRunning(true); setFeed([]);
    setNotice(attached.length ? "Uploading references to your private Results Vault..." : "The AI Team is processing your instruction. Agent messages are streamed below.");
    try {
      const taskAttachments: UploadedAttachment[] = [...uploadedAttachments];
      const totalReferences = uploadedAttachments.length + attached.length;
      for (const file of [...attached]) {
        const form = new FormData();
        form.append("file", file, file.name);
        const uploadResponse = await fetch(API + "/api/upload", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: form
        });
        const uploaded = await readJsonResponse(uploadResponse, "Upload " + file.name);
        const row = Array.isArray(uploaded) ? uploaded[0] : uploaded;
        if (!isRecord(row) || typeof row.storage_path !== "string" || !row.storage_path) {
          throw new Error("Upload response did not include a private storage path for " + file.name);
        }
        const metadata = isRecord(row.metadata) ? row.metadata : {};
        const reference: UploadedAttachment = {
          path: row.storage_path,
          title: String(row.title || file.name),
          mime_type: String(metadata.mime_type || file.type || "application/octet-stream")
        };
        taskAttachments.push(reference);
        setUploadedAttachments(current => [...current, reference]);
        setAttached(current => current.filter(item => item !== file));
        setNotice("Uploaded " + taskAttachments.length + " of " + totalReferences + " queued reference(s). Starting the AI Team...");
      }
      const response = await fetch(API + "/api/run", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ objective, attachments: taskAttachments })
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Task could not start");
      }
      if (!response.body) throw new Error("Streaming is not available in this browser");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let nextId = 0;
      const add = (title: string, detail: string, status: FeedEvent["status"] = "info") =>
        setFeed(items => [...items, { id: ++nextId, title, detail, status }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let event: StreamEvent;
          try {
            const parsed: unknown = JSON.parse(line);
            if (!isRecord(parsed)) continue;
            event = parsed as StreamEvent;
          } catch { continue; }
          if (event.event === "team_started") add("Team started", "Task ID: " + event.task_id, "working");
          else if (event.event === "agent_started") add(event.agent?.name || "Agent started", "Step " + event.step + " · Working", "working");
          else if (event.event === "agent_completed") add("✓ " + (event.agent?.name || "Agent completed"), String(event.output || "Contribution saved"), "done");
          else if (event.event === "agent_failed") add("⚠ " + (event.agent?.name || "Agent failed"), String(event.error || "Agent error"), "error");
          else if (event.event === "handoff_saved") add("Handoff saved", String(event.from) + " → " + String(event.to), "done");
          else if (event.event === "handoff_save_failed") add("Handoff save warning", String(event.error), "error");
          else if (event.event === "design_started") add("Design preview requested", "The team is preparing its design output.", "working");
          else if (event.event === "final_report") add("Final report", String(event.report || event.output || ""), "done");
          else if (event.event === "design_saved") add("Design preview saved", String(event.title || "SVG preview") + " · " + String(event.aspect_ratio || ""), "done");
          else if (event.event === "artifact_saved") add("Final report saved", String(event.title || "Report") + " · Results Vault", "done");
          else if (event.event === "team_finished") add("Team finished", String(event.completed) + "/" + String(event.total) + " agents · Result saved: " + String(event.persisted), "done");
          else add(String(event.event || "Team update"), JSON.stringify(event).slice(0, 1200), "info");
        }
      }
      setPrompt(""); setAttached([]); setUploadedAttachments([]);
      await refreshWorkspace(token);
      setNotice("Agent workflow finished. Review the streamed outputs; code edits and browser tests are not implied unless explicitly evidenced.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Task failed");
      setFeed(items => [...items, { id: Date.now(), title: "Task stopped", detail: error instanceof Error ? error.message : "Unknown error", status: "error" }]);
    } finally { setRunning(false); }
  }

  const activeTasks = tasks.filter(task => ["queued", "in_progress", "review"].includes(task.status)).length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;

  return (
    <main className="app-shell">
      {!token && <div className="auth"><form className="authbox" onSubmit={e => { e.preventDefault(); authenticate(); }}>
        <div className="brand-mark"><Command size={20}/></div><p className="auth-kicker">AI OPERATIONS HQ</p>
        <h2>{authMode === "login" ? "Welcome back." : "Create your owner account."}</h2>
        <p className="muted">Sign in to access your private workspace, AI team, and saved task history.</p>
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com"/></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={6} required placeholder="At least 6 characters"/></label>
        {authError && <p className="auth-error">{authError}</p>}
        <button className="primary-button auth-submit" disabled={authBusy}>{authBusy ? <LoaderCircle className="spin" size={16}/> : null}{authMode === "login" ? "Sign in" : "Create account"} <ArrowUpRight size={15}/></button>
        <button type="button" className="text-button auth-switch" onClick={() => {setAuthMode(authMode === "login" ? "signup" : "login");setAuthError("");}}>{authMode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
        <p className="note">Protected by Supabase Auth and owner-scoped database policies.</p>
      </form></div>}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Command size={20}/></div><div><strong>OPERATIONS HQ</strong><span>AI WORKSPACE</span></div><button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
        <div className="workspace-switch"><div className="workspace-avatar">M</div><div><strong>Owner workspace</strong><span>{userEmail || "Personal HQ"}</span></div><ChevronDown size={15}/></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">{[["Overview",LayoutDashboard],["AI Team",Bot],["Tasks & workflows",Workflow],["Projects",FolderGit2],["Results Vault",FileImage]].map(([label,Icon])=>{const I=Icon as typeof LayoutDashboard;return <button key={label as string} className={`nav-item ${active===label?"active":""}`} onClick={()=>{setActive(label as string);setMenuOpen(false);}}><I size={17}/><span>{label as string}</span>{label==="Tasks & workflows"&&<span className="nav-count">{tasks.length}</span>}</button>;})}</nav>
        <div className="nav-label second-label">SYSTEM</div><nav className="nav-list"><button className="nav-item" onClick={()=>setActive("System health")}><Gauge size={17}/><span>System health</span></button><button className="nav-item" onClick={()=>setActive("Security & approvals")}><ShieldCheck size={17}/><span>Security & approvals</span></button></nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><div><strong>Owner-controlled</strong><span>Approval gates for sensitive actions.</span></div><ArrowUpRight size={15}/></div><div className="profile"><div className="profile-avatar">M</div><div><strong>{userEmail || "Workspace owner"}</strong><span>Administrator</span></div><button className="icon-button" onClick={signOut} aria-label="Sign out"><LogOut size={16}/></button></div></div>
      </aside>
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={()=>setMenuOpen(false)}/>}
      <section className="main-panel">
        <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={()=>setMenuOpen(true)} aria-label="Open menu"><Menu size={20}/></button><span className="breadcrumb">Workspace</span><span className="crumb-slash">/</span><strong>{active}</strong></div><div className="topbar-right"><div className="system-pill"><span className="status-dot"/>{token?"Connected":"Sign in required"}</div><button className="icon-button" aria-label="Search"><Search size={18}/></button><div className="top-avatar">M</div></div></header>
        <div className="content">
          <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> YOUR AI OPERATIONS CENTER</div><h1>Build with your <span>AI team.</span></h1><p>Give an instruction. Your team will plan, coordinate, and report.</p></div><div className="date-chip"><Activity size={15}/> Owner-controlled workspace</div></div>
          <section className="panel-card collective-card">
            <div className="panel-heading">
              <div><h3><Bot size={17}/> Global AI Collective</h3><p>Anonymous free AI routes are tried first. Only verified responses are marked active.</p></div>
              <span className={collectiveStatus?.test?.success ? "ready-tag" : "step-count"}>{collectiveStatus?.test?.success ? "LIVE TEST PASSED" : token ? "CHECKING" : "SIGN IN"}</span>
            </div>
            {collectiveError && <p className="github-message">Provider check failed: {collectiveError}</p>}
            <div className="collective-grid">
              <div><strong>{collectiveStatus?.test?.provider || "Waiting for owner sign-in"}</strong><span>{collectiveStatus?.test?.model || "No model has been verified in this session"}</span></div>
              <div><strong>{collectiveStatus?.automaticPaidFallback === false ? "Paid fallback disabled" : "Policy not verified"}</strong><span>{collectiveStatus?.quotaPolicy || "Free-first routing policy"}</span></div>
            </div>
            <div className="metrics-grid">
              {(collectiveStatus?.freeProviders || [
                {provider:"Kilo Gateway",model:"kilo-auto/free",status:"not_verified",rateLimit:"200 requests/hour/IP"},
                {provider:"OVHcloud AI Endpoints",model:"gpt-oss-20b",status:"not_verified",rateLimit:"2 requests/minute/IP/model"}
              ]).map(provider => {
                const active = provider.status === "active";
                const attempt = collectiveStatus?.test?.attempts?.find(item => item.provider.toLowerCase().includes(provider.provider.split(" ")[0].toLowerCase()));
                return <div className="metric-card" key={provider.provider}>
                  <div className="metric-top"><span>{provider.provider}</span><span className={active ? "ready-tag" : "step-count"}>{active ? "ACTIVE" : "NOT VERIFIED"}</span></div>
                  <strong>{provider.model}</strong>
                  <small>{provider.rateLimit}{attempt?.latencyMs ? " · "+attempt.latencyMs+" ms" : ""}</small>
                  {!active && attempt?.error && <small>{attempt.error}</small>}
                </div>;
              })}
            </div>
            <p className="github-safety">The live test reports the provider actually selected. Anonymous providers can be rate-limited or unavailable; sensitive/private data should not be sent to public free endpoints.</p>
          </section>
          <section className="composer-card"><div className="composer-top"><div className="composer-icon"><Sparkles size={18}/></div><div><strong>What should your team work on?</strong><span>Describe the outcome. Add reference files for the next file-aware workflow stage.</span></div><span className="secure-tag"><ShieldCheck size={13}/> Owner controlled</span></div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Example: Analyze my website's current architecture and create a prioritized improvement plan..." rows={3} disabled={!token||running}/>
            {(attached.length>0||uploadedAttachments.length>0)&&<div className="attachment-list">{uploadedAttachments.map((file,i)=><span key={"uploaded-"+i}><FileImage size={13}/>{file.title} · ready</span>)}{attached.map((file,i)=><span key={"local-"+i}><FileImage size={13}/>{file.name} · waiting</span>)}</div>}
            <div className="composer-footer"><label className="attach-button"><Paperclip size={16}/> Attach files<input type="file" multiple accept="image/*,.pdf,.txt,.md,.zip,.csv,.json,.js,.ts,.tsx,.jsx,.py,.css,.html,.sql" onChange={e=>addFiles(e.target.files)} disabled={!token||running}/></label><span className="composer-hint">Files upload to your private Results Vault and are passed to the AI team. Images and text/code are read; PDF/ZIP are stored but not extracted yet.</span><button className="primary-button" onClick={createTask} disabled={!token||running||!prompt.trim()}>{running?<LoaderCircle className="spin" size={16}/>:<Plus size={16}/>} {running?"Team working":"Start AI Team"} <ArrowUpRight size={15}/></button></div>
          </section>
          {feed.length>0&&<section className="panel-card live-feed"><div className="panel-heading"><div><h3>Live task activity</h3><p>Streaming events from the AI Team runtime.</p></div><span className="step-count">{running?"RUNNING":"LATEST RUN"}</span></div><div className="feed-list">{feed.map(item=><div className="feed-event" key={item.id}><span className={`feed-dot ${item.status}`}/><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}</div></section>}
          <div className="section-heading"><div><h2>Workspace overview</h2><p>Your control center for coordinated AI work.</p></div><span className="muted-label">LIVE DATA</span></div>
          <div className="metrics-grid"><div className="metric-card"><div className="metric-top"><span>Active tasks</span><Workflow size={17}/></div><strong>{token?activeTasks:"—"}</strong><small>Saved task records</small></div><div className="metric-card"><div className="metric-top"><span>AI specialists</span><Bot size={17}/></div><strong>{token?agents.length:"—"}</strong><small>Loaded from owner roster</small></div><div className="metric-card"><div className="metric-top"><span>Completed tasks</span><CheckCircle2 size={17}/></div><strong>{token?completedTasks:"—"}</strong><small>Database status records</small></div><div className="metric-card"><div className="metric-top"><span>System health</span><Activity size={17}/></div><strong className="health-text">{token?"Connected":"Offline"}</strong><small>Worker + database session</small></div></div>
          <div className="lower-grid"><section className="panel-card workflow-card"><div className="panel-heading"><div><h3>How work gets done</h3><p>One accountable execution loop.</p></div><span className="step-count">5 STEPS</span></div><div className="workflow-list">{workflow.map((step,index)=>{const Icon=step.icon;return <div className="workflow-step" key={step.title}><div className="step-icon"><Icon size={17}/></div><div className="step-copy"><strong>{step.title}</strong><span>{step.detail}</span></div><span className="step-number">0{index+1}</span></div>;})}</div></section>
            <section className="panel-card team-card"><div className="panel-heading"><div><h3>Meet your AI team</h3><p>Specialists loaded from the database.</p></div><span className="step-count">{agents.length}/12</span></div><div className="agent-list">{agents.slice(0,6).map(agent=><div className="agent-row" key={agent.id}><div className="agent-avatar violet">{agent.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div className="agent-copy"><strong>{agent.name}</strong><span>{agent.agent_role}</span></div><span className="ready-tag">{agent.status}</span></div>)}{token&&agents.length===0&&<p className="note">No agent roster returned for this account.</p>}</div></section></div>
          <section className="panel-card history-card"><div className="panel-heading"><div><h3>Recent tasks</h3><p>Saved to your private Operations database.</p></div><span className="step-count">{tasks.length} RECORDS</span></div>{tasks.length===0?<p className="empty-state">{token?"No tasks yet. Start your first AI Team task above.":"Sign in to see your saved tasks."}</p>:<div className="task-list">{tasks.slice(0,8).map(task=><div className="task-row" key={task.id}><div className="task-copy"><strong>{task.title}</strong><span>{new Date(task.created_at).toLocaleString()} · {task.priority}</span></div><span className={`task-status ${task.status}`}>{task.status.replace("_"," ")}</span></div>)}</div>}</section>
          <div className="notice-bar"><div className="notice-symbol"><Activity size={16}/></div><div><strong>System status</strong><span>{notice}</span></div></div>
          <footer><span>AI OPERATIONS HQ <i>·</i> FOUNDATION 0.2.0</span><span>Evidence-led AI execution</span></footer>
        </div>
      </section>
    </main>
  );
}
