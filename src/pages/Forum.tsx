import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import func2url from "../../backend/func2url.json";

const API = func2url["forum-api"];
const AUTH = func2url["forum-auth"];

interface Category {
  id: number;
  title: string;
  description: string;
  topic_count: number;
  post_count: number;
  last_topic_title: string | null;
  last_user: string | null;
  last_post_at: string | null;
}

interface User {
  id: number;
  username: string;
  role: string;
  token: string;
}

export default function Forum() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("forum_user");
    if (saved) setUser(JSON.parse(saved));
    fetch(`${API}/?action=categories`).then((r) => r.json()).then(setCategories);
  }, []);

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

  return (
    <div className="rm-wrap">
      {/* Top nav */}
      <div className="rm-topnav">
        <div className="rm-topnav-inner">
          <div className="rm-logo" onClick={() => navigate("/")}>
            <span className="rm-logo-icon">⚡</span>
            <span className="rm-logo-text">JASMIN</span>
            <span className="rm-logo-sub">ONLINE</span>
          </div>
          <nav className="rm-nav">
            <a href="#" className="rm-nav-link active">💬 Форумы</a>
            <a href="#" className="rm-nav-link">🔥 Что нового?</a>
            <a href="#" className="rm-nav-link">👥 Пользователи</a>
          </nav>
          <div className="rm-nav-right">
            {user ? (
              <>
                <div className="rm-user-chip" onClick={() => {}}>
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

      {/* Main */}
      <div className="rm-main">
        <div className="rm-breadcrumb">
          <span className="rm-breadcrumb-home">🏠</span> Форумы
        </div>

        <div className="rm-section-title">Игровые сервера</div>

        <div className="rm-forum-block">
          <div className="rm-forum-block-header">
            JASMIN RolePlay
          </div>
          <div className="rm-categories">
            {categories.map((cat) => (
              <div key={cat.id} className="rm-cat-row" onClick={() => navigate(`/forum/category/${cat.id}`)}>
                <div className="rm-cat-left">
                  <div className="rm-cat-icon">💬</div>
                  <div>
                    <div className="rm-cat-name">
                      {cat.title}
                      {cat.last_topic_title && <span className="rm-new-dot" />}
                    </div>
                    <div className="rm-cat-counts">
                      <span>Тем <strong>{cat.topic_count.toLocaleString()}</strong></span>
                      <span>Сообщений <strong>{cat.post_count.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="rm-cat-right">
                  {cat.last_topic_title ? (
                    <>
                      <div className="rm-cat-last-avatar">{(cat.last_user || "?")[0].toUpperCase()}</div>
                      <div>
                        <div className="rm-cat-last-title">{cat.last_topic_title}</div>
                        <div className="rm-cat-last-meta">{cat.last_post_at} · <span className="rm-cat-last-user">{cat.last_user}</span></div>
                      </div>
                    </>
                  ) : <span className="rm-no-posts">Нет тем</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth modal */}
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
