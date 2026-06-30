import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import func2url from "../../backend/func2url.json";

const API = func2url["forum-api"];

interface Post {
  id: number;
  content: string;
  created_at: string | null;
  author: string | null;
  avatar_url: string | null;
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

interface User {
  id: number;
  username: string;
  role: string;
  token: string;
}

export default function ForumTopic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
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
      .then((data) => {
        setTopic(data.topic);
        setPosts(data.posts);
      });
  };

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
    if (data.post_id) {
      setReply("");
      loadPosts();
    } else {
      setError(data.error || "Ошибка");
    }
  };

  const roleLabel = (role: string | null) => {
    if (role === "admin") return <span className="forum-role admin">Администратор</span>;
    if (role === "moderator") return <span className="forum-role mod">Модератор</span>;
    return <span className="forum-role user">Пользователь</span>;
  };

  return (
    <div className="forum-wrap">
      <div className="forum-header">
        <div className="forum-logo" onClick={() => navigate("/forum")}>⚡ ФОРУМ</div>
        <div className="forum-header-right">
          {user ? (
            <>
              <span className="forum-username">👤 {user.username}</span>
              <button className="forum-btn-sm" onClick={() => { localStorage.removeItem("forum_user"); setUser(null); }}>Выйти</button>
            </>
          ) : (
            <button className="forum-btn" onClick={() => navigate("/forum")}>Войти</button>
          )}
        </div>
      </div>

      <div className="forum-container">
        <div className="forum-breadcrumb">
          <span onClick={() => navigate("/forum")} style={{ cursor: "pointer" }}>🏠 Главная</span>
          {" › "}
          <span onClick={() => navigate(`/forum/category/${topic?.category_id}`)} style={{ cursor: "pointer" }}>Раздел</span>
          {" › "}{topic?.title}
        </div>

        <div className="forum-topic-header">
          <h1 className="forum-title">{topic?.title}</h1>
          <div className="forum-topic-badges">
            {topic?.is_info && <span className="forum-tag info">ИНФОРМАЦИЯ</span>}
            {topic?.is_locked && <span className="forum-tag locked">🔒 Закрыта</span>}
          </div>
        </div>

        <div className="forum-posts">
          {posts.map((post, idx) => (
            <div key={post.id} className={`forum-post ${idx === 0 ? "first-post" : ""}`}>
              <div className="forum-post-author">
                <div className="forum-avatar">{(post.author || "?")[0].toUpperCase()}</div>
                <div className="forum-author-name">{post.author || "Удалён"}</div>
                {roleLabel(post.role)}
                <div className="forum-post-count">Сообщений: {post.post_count}</div>
              </div>
              <div className="forum-post-body">
                <div className="forum-post-content">{post.content}</div>
                <div className="forum-post-time">{post.created_at}</div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="forum-empty">Сообщений пока нет.</div>
          )}
        </div>

        {!topic?.is_locked && user && (
          <div className="forum-reply-box">
            <h3>Ответить</h3>
            <textarea
              placeholder="Напишите ваш ответ..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={5}
            />
            {error && <div className="forum-error">{error}</div>}
            <button className="forum-btn" onClick={sendReply} disabled={sending}>
              {sending ? "Отправляю..." : "Отправить"}
            </button>
          </div>
        )}

        {topic?.is_locked && (
          <div className="forum-locked-msg">🔒 Тема закрыта для ответов</div>
        )}

        {!user && !topic?.is_locked && (
          <div className="forum-locked-msg">
            <span onClick={() => navigate("/forum")} style={{ cursor: "pointer", textDecoration: "underline" }}>Войдите</span>, чтобы ответить
          </div>
        )}
      </div>
    </div>
  );
}
