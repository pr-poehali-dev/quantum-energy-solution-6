import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import func2url from "../../backend/func2url.json";

const API = func2url["forum-api"];

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
  avatar_url: string | null;
  last_user: string | null;
}

interface Category {
  id: number;
  title: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  token: string;
}

export default function ForumCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
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
      .then((data) => {
        setCategory(data.category);
        setTopics(data.topics);
      });
  };

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

  const pinnedTopics = topics.filter((t) => t.is_pinned);
  const regularTopics = topics.filter((t) => !t.is_pinned);

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
          {" › "}{category?.title}
        </div>

        <div className="forum-cat-header">
          <h1 className="forum-title">{category?.title}</h1>
          {user && (
            <button className="forum-btn" onClick={() => setShowCreate(true)}>+ Новая тема</button>
          )}
        </div>

        <div className="forum-topics-table">
          <div className="forum-topics-head">
            <span>Тема</span>
            <span>Ответы</span>
            <span>Просмотры</span>
            <span>Последнее</span>
          </div>

          {pinnedTopics.length > 0 && (
            <div className="forum-pinned-label">📌 Закреплённые темы</div>
          )}
          {pinnedTopics.map((t) => <TopicRow key={t.id} topic={t} onClick={() => navigate(`/forum/topic/${t.id}`)} />)}

          {regularTopics.map((t) => <TopicRow key={t.id} topic={t} onClick={() => navigate(`/forum/topic/${t.id}`)} />)}

          {topics.length === 0 && (
            <div className="forum-empty">Тем пока нет. Будьте первым!</div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="forum-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="forum-modal forum-modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>Новая тема</h2>
            <input placeholder="Заголовок темы" value={newTopic.title} onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })} />
            <textarea placeholder="Текст сообщения..." value={newTopic.content} onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })} rows={6} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="forum-btn" onClick={createTopic} disabled={creating}>{creating ? "Создаю..." : "Создать тему"}</button>
              <button className="forum-btn-sm" onClick={() => setShowCreate(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TopicRow({ topic, onClick }: { topic: Topic; onClick: () => void }) {
  return (
    <div className={`forum-topic-row ${topic.is_pinned ? "pinned" : ""}`} onClick={onClick}>
      <div className="forum-topic-main">
        <div className="forum-topic-tags">
          {topic.is_info && <span className="forum-tag info">ИНФОРМАЦИЯ</span>}
          {topic.is_locked && <span className="forum-tag locked">🔒</span>}
          {topic.is_pinned && <span className="forum-tag pinned-tag">📌</span>}
        </div>
        <div className="forum-topic-title">{topic.title}</div>
        <div className="forum-topic-meta">от {topic.author || "—"}</div>
      </div>
      <div className="forum-topic-replies">{topic.reply_count}</div>
      <div className="forum-topic-views">{topic.view_count}</div>
      <div className="forum-topic-last">
        {topic.last_post_at && <div>{topic.last_post_at}</div>}
        {topic.last_user && <div className="forum-last-user">{topic.last_user}</div>}
      </div>
    </div>
  );
}
