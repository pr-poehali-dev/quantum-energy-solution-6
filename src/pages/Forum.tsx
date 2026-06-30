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
    fetch(`${API}/?action=categories`)
      .then((r) => r.json())
      .then(setCategories);
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

  const logout = () => {
    localStorage.removeItem("forum_user");
    setUser(null);
  };

  return (
    <div className="forum-wrap">
      <div className="forum-header">
        <div className="forum-logo" onClick={() => navigate("/forum")}>⚡ ФОРУМ</div>
        <div className="forum-header-right">
          {user ? (
            <>
              <span className="forum-username">👤 {user.username}</span>
              <button className="forum-btn-sm" onClick={logout}>Выйти</button>
            </>
          ) : (
            <button className="forum-btn" onClick={() => setShowAuth(true)}>Войти / Регистрация</button>
          )}
        </div>
      </div>

      <div className="forum-container">
        <div className="forum-breadcrumb">🏠 Главная</div>
        <h1 className="forum-title">Разделы форума</h1>

        <div className="forum-categories">
          {categories.map((cat) => (
            <div key={cat.id} className="forum-cat-row" onClick={() => navigate(`/forum/category/${cat.id}`)}>
              <div className="forum-cat-icon">💬</div>
              <div className="forum-cat-info">
                <div className="forum-cat-title">{cat.title}</div>
                <div className="forum-cat-desc">{cat.description}</div>
              </div>
              <div className="forum-cat-stats">
                <div><span className="forum-stat-num">{cat.topic_count.toLocaleString()}</span><br /><span className="forum-stat-label">Тем</span></div>
                <div><span className="forum-stat-num">{cat.post_count.toLocaleString()}</span><br /><span className="forum-stat-label">Сообщений</span></div>
              </div>
              <div className="forum-cat-last">
                {cat.last_topic_title ? (
                  <>
                    <div className="forum-last-title">{cat.last_topic_title}</div>
                    <div className="forum-last-meta">{cat.last_post_at} · {cat.last_user}</div>
                  </>
                ) : <span className="forum-stat-label">Нет тем</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAuth && (
        <div className="forum-modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="forum-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{authMode === "login" ? "Вход" : "Регистрация"}</h2>
            <div className="forum-auth-tabs">
              <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Войти</button>
              <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Регистрация</button>
            </div>
            <input placeholder="Имя пользователя" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input type="password" placeholder="Пароль" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()} />
            {authError && <div className="forum-error">{authError}</div>}
            <button className="forum-btn" onClick={handleAuth}>{authMode === "login" ? "Войти" : "Зарегистрироваться"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
