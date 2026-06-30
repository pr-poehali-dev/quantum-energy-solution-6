import json
import os
import psycopg2
from datetime import datetime

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def fmt_time(dt):
    if not dt:
        return None
    now = datetime.now()
    diff = now - dt
    if diff.days == 0:
        mins = diff.seconds // 60
        if mins < 1:
            return "только что"
        if mins < 60:
            return f"{mins} мин. назад"
        return dt.strftime("Сегодня в %H:%M")
    if diff.days == 1:
        return dt.strftime("Вчера в %H:%M")
    return dt.strftime("%d %b %Y")

def handler(event: dict, context) -> dict:
    """API форума: категории, темы, посты"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    method = event.get('httpMethod')
    params = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')
    headers = event.get('headers') or {}
    user_id_header = headers.get('X-User-Id') or headers.get('x-user-id')
    action = params.get('action') or body.get('action', '')

    conn = get_db()
    cur = conn.cursor()

    try:
        # GET categories
        if method == 'GET' and action == 'categories':
            cur.execute('''
                SELECT c.id, c.title, c.description, c.topic_count, c.post_count,
                       t.title as last_topic_title, u.username as last_user, t.last_post_at
                FROM forum_categories c
                LEFT JOIN forum_topics t ON t.id = (
                    SELECT id FROM forum_topics WHERE category_id = c.id ORDER BY last_post_at DESC LIMIT 1
                )
                LEFT JOIN forum_users u ON u.id = t.last_post_user_id
                ORDER BY c.sort_order
            ''')
            rows = cur.fetchall()
            cats = []
            for r in rows:
                cats.append({
                    'id': r[0], 'title': r[1], 'description': r[2],
                    'topic_count': r[3], 'post_count': r[4],
                    'last_topic_title': r[5], 'last_user': r[6],
                    'last_post_at': fmt_time(r[7])
                })
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps(cats, ensure_ascii=False)}

        # GET topics?action=topics&category_id=1
        if method == 'GET' and action == 'topics':
            cat_id = params.get('category_id')
            if not cat_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'category_id required'})}
            cur.execute('''
                SELECT t.id, t.title, t.is_pinned, t.is_locked, t.is_info,
                       t.reply_count, t.view_count, t.last_post_at,
                       u.username, u.avatar_url, lu.username
                FROM forum_topics t
                LEFT JOIN forum_users u ON u.id = t.user_id
                LEFT JOIN forum_users lu ON lu.id = t.last_post_user_id
                WHERE t.category_id = %s
                ORDER BY t.is_pinned DESC, t.last_post_at DESC
            ''', (cat_id,))
            rows = cur.fetchall()
            topics = [{'id': r[0], 'title': r[1], 'is_pinned': r[2], 'is_locked': r[3], 'is_info': r[4],
                       'reply_count': r[5], 'view_count': r[6], 'last_post_at': fmt_time(r[7]),
                       'author': r[8], 'avatar_url': r[9], 'last_user': r[10]} for r in rows]
            cur.execute('SELECT id, title FROM forum_categories WHERE id = %s', (cat_id,))
            cat = cur.fetchone()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'category': {'id': cat[0], 'title': cat[1]}, 'topics': topics}, ensure_ascii=False)}

        # GET posts?action=posts&topic_id=1
        if method == 'GET' and action == 'posts':
            topic_id = params.get('topic_id')
            if not topic_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'topic_id required'})}
            cur.execute('UPDATE forum_topics SET view_count = view_count + 1 WHERE id = %s', (topic_id,))
            conn.commit()
            cur.execute('''
                SELECT p.id, p.content, p.created_at, u.username, u.avatar_url, u.role, u.post_count
                FROM forum_posts p
                LEFT JOIN forum_users u ON u.id = p.user_id
                WHERE p.topic_id = %s ORDER BY p.created_at
            ''', (topic_id,))
            rows = cur.fetchall()
            cur.execute('SELECT id, title, is_locked, is_info, category_id FROM forum_topics WHERE id = %s', (topic_id,))
            topic = cur.fetchone()
            posts = [{'id': r[0], 'content': r[1], 'created_at': fmt_time(r[2]), 'author': r[3], 'avatar_url': r[4], 'role': r[5], 'post_count': r[6]} for r in rows]
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({
                'topic': {'id': topic[0], 'title': topic[1], 'is_locked': topic[2], 'is_info': topic[3], 'category_id': topic[4]},
                'posts': posts
            }, ensure_ascii=False)}

        # POST create_topic
        if method == 'POST' and action == 'create_topic':
            if not user_id_header:
                return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Нужна авторизация'})}
            uid = int(user_id_header)
            cat_id = body.get('category_id')
            title = body.get('title', '').strip()
            content = body.get('content', '').strip()
            if not cat_id or not title or not content:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Заполните все поля'})}
            cur.execute('INSERT INTO forum_topics (category_id, user_id, title, last_post_user_id) VALUES (%s, %s, %s, %s) RETURNING id', (cat_id, uid, title, uid))
            topic_id = cur.fetchone()[0]
            cur.execute('INSERT INTO forum_posts (topic_id, user_id, content) VALUES (%s, %s, %s)', (topic_id, uid, content))
            cur.execute('UPDATE forum_categories SET topic_count = topic_count + 1, post_count = post_count + 1 WHERE id = %s', (cat_id,))
            cur.execute('UPDATE forum_users SET post_count = post_count + 1 WHERE id = %s', (uid,))
            conn.commit()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'topic_id': topic_id})}

        # POST create_post
        if method == 'POST' and action == 'create_post':
            if not user_id_header:
                return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Нужна авторизация'})}
            uid = int(user_id_header)
            topic_id = body.get('topic_id')
            content = body.get('content', '').strip()
            if not topic_id or not content:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Заполните все поля'})}
            cur.execute('SELECT is_locked FROM forum_topics WHERE id = %s', (topic_id,))
            t = cur.fetchone()
            if not t:
                return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'Тема не найдена'})}
            if t[0]:
                return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'Тема закрыта'})}
            cur.execute('INSERT INTO forum_posts (topic_id, user_id, content) VALUES (%s, %s, %s) RETURNING id', (topic_id, uid, content))
            post_id = cur.fetchone()[0]
            cur.execute('UPDATE forum_topics SET reply_count = reply_count + 1, last_post_at = NOW(), last_post_user_id = %s WHERE id = %s', (uid, topic_id))
            cur.execute('SELECT category_id FROM forum_topics WHERE id = %s', (topic_id,))
            cat_id = cur.fetchone()[0]
            cur.execute('UPDATE forum_categories SET post_count = post_count + 1 WHERE id = %s', (cat_id,))
            cur.execute('UPDATE forum_users SET post_count = post_count + 1 WHERE id = %s', (uid,))
            conn.commit()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'post_id': post_id})}

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    finally:
        cur.close()
        conn.close()
