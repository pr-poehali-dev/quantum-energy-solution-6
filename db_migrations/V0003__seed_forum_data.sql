INSERT INTO forum_users (username, password_hash, role) VALUES ('Admin', 'admin_placeholder', 'admin');

INSERT INTO forum_categories (title, description, sort_order) VALUES
  ('Жалобы', 'Подача жалоб на игроков и сотрудников', 1),
  ('Организации', 'Жалобы на сотрудников организаций', 2),
  ('Заявление на пост Лидера', 'Подача заявлений на пост лидера организации', 3),
  ('Заявление на пост Агента Поддержки', 'Подача заявлений на пост Support-а', 4),
  ('Игровые обсуждения', 'Общение и обсуждения по игре', 5);

INSERT INTO forum_topics (category_id, user_id, title, is_pinned, is_locked, is_info, reply_count, view_count) VALUES
  (1, 1, 'Официальный Discord канал и группа VK.', TRUE, TRUE, TRUE, 0, 166),
  (1, 1, 'Список действующих лидеров.', TRUE, TRUE, TRUE, 0, 445),
  (1, 1, 'Список следящей администрации.', TRUE, TRUE, TRUE, 0, 413),
  (1, 1, 'Список администрации сервера.', TRUE, TRUE, TRUE, 0, 591);

UPDATE forum_categories SET topic_count = 4, post_count = 0 WHERE id = 1;