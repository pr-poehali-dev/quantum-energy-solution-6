import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import func2url from "../../backend/func2url.json";

const API = func2url["forum-api"];
const AUTH = func2url["forum-auth"];

interface Post {
  id: number;
  content: string;
  created_at: string | null;
  author: string | null;
  role: string | null;
  post_count: number;
}

interface Topic {
  id: number;
  title: string;
  is_locked: boolean;
  is_info: boolean;
  category_id: number;
}

interface User { id: number; username: string; role: string; token: string; }

export default function ForumTopic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("forum_user");
    if (saved) setUser(JSON.parse(saved));
    loadPosts();
  }, [id]);

  const loadPosts = () => {
    fetch(`${API}/?action=posts&topic_id=${id}`)
      .then((r) => r.json())
      .then((data) => { setTopic(data.topic); setPosts(data.posts); });
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

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": String(user!.id) },
      body: JSON.stringify({ action: "create_post", topic_id: Number(id), content: reply }),
    });
    const data = await res.json();
    setSending(false);
    if (data.post_id) { setReply(""); loadPosts(); }
    else setError(data.error || "Ошибка");
  };

  const roleLabel = (role: string | null) => {
    if (role === "admin") return <span className="rm-role rm-role-admin">Администратор</span>;
    if (role === "moderator") return <span className="rm-role rm-role-mod">Модератор</span>;
    return <span className="rm-role rm-role-user">Пользователь</span>;
  };

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
          <span onClick={() => navigate(`/forum/category/${topic?.category_id}`)} style={{ cursor: "pointer" }}>Раздел</span>
          {" › "}{topic?.title}
        </div>

        <div className="rm-topic-bar">
          <h1 className="rm-topic-h1">
            {topic?.is_info && <span className="rm-tag rm-tag-info" style={{ marginRight: 10, fontSize: 13 }}>ИНФОРМАЦИЯ</span>}
            {topic?.title}
          </h1>
          {topic?.is_locked && <span className="rm-tag rm-tag-lock" style={{ fontSize: 13 }}>🔒 Закрыта</span>}
        </div>

        {/* Posts */}
        <div className="rm-posts">
          {posts.map((post, idx) => (
            <div key={post.id} className="rm-post">
              <div className="rm-post-sidebar">
                <div className="rm-post-avatar">{(post.author || "?")[0].toUpperCase()}</div>
                <div className="rm-post-uname">{post.author || "Удалён"}</div>
                {roleLabel(post.role)}
                <div className="rm-post-msgs">Сообщений: {post.post_count}</div>
                {idx === 0 && <div className="rm-post-op">OP</div>}
              </div>
              <div className="rm-post-body">
                <div className="rm-post-text">{post.content}</div>
                <div className="rm-post-foot">{post.created_at}</div>
              </div>
            </div>
          ))}
          {posts.length === 0 && <div className="rm-empty">Сообщений пока нет.</div>}
        </div>

        {/* Reply */}
        {!topic?.is_locked && user && (
          <div className="rm-reply-box">
            <div className="rm-reply-title">Ответить</div>
            <textarea placeholder="Напишите ваш ответ..." value={reply}
              onChange={(e) => setReply(e.target.value)} rows={5} />
            {error && <div className="rm-error">{error}</div>}
            <button className="rm-btn-primary" onClick={sendReply} disabled={sending}>
              {sending ? "Отправляю..." : "Отправить ответ"}
            </button>
          </div>
        )}

        {topic?.is_locked && (
          <div className="rm-locked-notice">🔒 У вас недостаточно прав для ответа здесь.</div>
        )}

        {!user && !topic?.is_locked && (
          <div className="rm-locked-notice">
            <span onClick={() => { setAuthMode("login"); setShowAuth(true); }}
              style={{ cursor: "pointer", color: "#f5c518", textDecoration: "underline" }}>Войдите</span>{" "}
            или{" "}
            <span onClick={() => { setAuthMode("register"); setShowAuth(true); }}
              style={{ cursor: "pointer", color: "#f5c518", textDecoration: "underline" }}>зарегистрируйтесь</span>{" "}
            чтобы ответить.
          </div>
        )}
      </div>

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
