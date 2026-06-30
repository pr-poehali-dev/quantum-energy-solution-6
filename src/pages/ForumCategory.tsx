import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import func2url from "../../backend/func2url.json";

const API = func2url["forum-api"];
const AUTH = func2url["forum-auth"];

interface Topic {
  id: number;
  title: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_info: boolean;
  reply_count: number;
  view_count: number;
  last_post_at: string | null;
  author: string | null;
  last_user: string | null;
}

interface Category { id: number; title: string; }
interface User { id: number; username: string; role: string; token: string; }

export default function ForumCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [newTopic, setNewTopic] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("forum_user");
    if (saved) setUser(JSON.parse(saved));
    loadTopics();
  }, [id]);

  const loadTopics = () => {
    fetch(`${API}/?action=topics&category_id=${id}`)
      .then((r) => r.json())
      .then((data) => { setCategory(data.category); setTopics(data.topics); });
  };

  const handleAuth = async () => {
    setAuthError("");
    const res = await fetch(AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: authMode, ...form }),
    });
    const data = await res.json();
    if (!res.ok) { setAuthError(data.error); return; }
    localStorage.setItem("forum_user", JSON.stringify(data));
    setUser(data);
    setShowAuth(false);
    setForm({ username: "", password: "" });
  };

  const logout = () => { localStorage.removeItem("forum_user"); setUser(null); };

  const createTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;
    setCreating(true);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": String(user!.id) },
      body: JSON.stringify({ action: "create_topic", category_id: Number(id), ...newTopic }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.topic_id) {
      setShowCreate(false);
      setNewTopic({ title: "", content: "" });
      navigate(`/forum/topic/${data.topic_id}`);
    }
  };

  const pinned = topics.filter((t) => t.is_pinned);
  const regular = topics.filter((t) => !t.is_pinned);

  return (
    <div className="rm-wrap">
      <div className="rm-topnav">
        <div className="rm-topnav-inner">
          <div className="rm-logo" onClick={() => navigate("/")}>
            <span className="rm-logo-icon">⚡</span>
            <span className="rm-logo-text">JASMIN</span>
            <span className="rm-logo-sub">ONLINE</span>
          </div>
          <nav className="rm-nav">
            <a href="/" className="rm-nav-link">💬 Форумы</a>
            <a href="#" className="rm-nav-link">🔥 Что нового?</a>
            <a href="#" className="rm-nav-link">👥 Пользователи</a>
          </nav>
          <div className="rm-nav-right">
            {user ? (
              <>
                <div className="rm-user-chip">
                  <div className="rm-user-avatar">{user.username[0].toUpperCase()}</div>
                  <span>{user.username}</span>
                </div>
                <button className="rm-btn-ghost" onClick={logout}>Выйти</button>
              </>
            ) : (
              <>
                <button className="rm-btn-ghost" onClick={() => { setAuthMode("login"); setShowAuth(true); }}>Войти</button>
                <button className="rm-btn-primary" onClick={() => { setAuthMode("register"); setShowAuth(true); }}>Регистрация</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rm-main">
        <div className="rm-breadcrumb">
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>🏠</span>
          {" › "}
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Форумы</span>
          {" › "}{category?.title}
        </div>

        <div className="rm-topic-bar">
          <h1 className="rm-topic-h1">{category?.title}</h1>
          {user ? (
            <button className="rm-btn-primary" onClick={() => setShowCreate(true)}>+ Создать тему</button>
          ) : (
            <button className="rm-btn-primary" onClick={() => { setAuthMode("login"); setShowAuth(true); }}>Войти для ответа</button>
          )}
        </div>

        <div className="rm-topics-table">
          <div className="rm-topics-head">
            <span>Тема</span>
            <span className="rm-col-center">Ответы</span>
            <span className="rm-col-center">Просмотры</span>
            <span>Последнее сообщение</span>
          </div>

          {pinned.length > 0 && (
            <>
              <div className="rm-pinned-label">📌 Закреплённые темы</div>
              {pinned.map((t) => <TopicRow key={t.id} topic={t} onClick={() => navigate(`/forum/topic/${t.id}`)} />)}
            </>
          )}

          {regular.map((t) => <TopicRow key={t.id} topic={t} onClick={() => navigate(`/forum/topic/${t.id}`)} />)}

          {topics.length === 0 && (
            <div className="rm-empty">Тем пока нет. Создайте первую!</div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="rm-overlay" onClick={() => setShowCreate(false)}>
          <div className="rm-modal rm-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-logo">Новая тема</div>
            <input placeholder="Заголовок темы" value={newTopic.title}
              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })} />
            <textarea placeholder="Текст сообщения..." value={newTopic.content}
              onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })} rows={6} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="rm-btn-primary" onClick={createTopic} disabled={creating}>
                {creating ? "Создаю..." : "Создать тему"}
              </button>
              <button className="rm-btn-ghost" onClick={() => setShowCreate(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="rm-overlay" onClick={() => setShowAuth(false)}>
          <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-logo">⚡ JASMIN</div>
            <div className="rm-auth-tabs">
              <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Войти</button>
              <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Регистрация</button>
            </div>
            <input placeholder="Имя пользователя" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input type="password" placeholder="Пароль" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()} />
            {authError && <div className="rm-error">{authError}</div>}
            <button className="rm-btn-primary rm-btn-full" onClick={handleAuth}>
              {authMode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TopicRow({ topic, onClick }: { topic: Topic; onClick: () => void }) {
  return (
    <div className={`rm-topic-row ${topic.is_pinned ? "rm-pinned" : ""}`} onClick={onClick}>
      <div className="rm-topic-main">
        <div className="rm-topic-avatar">{(topic.author || "?")[0].toUpperCase()}</div>
        <div>
          <div className="rm-topic-tags">
            {topic.is_info && <span className="rm-tag rm-tag-info">ИНФОРМАЦИЯ</span>}
            {topic.is_locked && <span className="rm-tag rm-tag-lock">Закрыта</span>}
            {topic.is_pinned && <span className="rm-tag rm-tag-pin">Закреплено</span>}
          </div>
          <div className="rm-topic-name">{topic.title}</div>
          <div className="rm-topic-author">от {topic.author || "—"}</div>
        </div>
      </div>
      <div className="rm-col-center rm-topic-stat">{topic.reply_count}</div>
      <div className="rm-col-center rm-topic-stat">{topic.view_count}</div>
      <div className="rm-topic-last">
        {topic.last_post_at && <div className="rm-topic-last-time">{topic.last_post_at}</div>}
        {topic.last_user && <div className="rm-cat-last-user">{topic.last_user}</div>}
      </div>
    </div>
  );
}
