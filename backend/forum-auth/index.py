import json
import os
import hashlib
import secrets
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Регистрация и вход пользователей форума"""
    cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    method = event.get('httpMethod')
    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    conn = get_db()
    cur = conn.cursor()

    try:
        if method == 'POST' and action == 'register':
            username = body.get('username', '').strip()
            password = body.get('password', '')

            if not username or not password:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Заполните все поля'})}
            if len(username) < 3:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Имя минимум 3 символа'})}

            cur.execute('SELECT id FROM forum_users WHERE username = %s', (username,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors, 'body': json.dumps({'error': 'Имя занято'})}

            pw_hash = hash_password(password)
            session_token = secrets.token_hex(32)
            cur.execute(
                'INSERT INTO forum_users (username, password_hash, role) VALUES (%s, %s, %s) RETURNING id, username, role',
                (username, pw_hash, 'user')
            )
            user = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'id': user[0], 'username': user[1], 'role': user[2], 'token': f"{user[0]}:{session_token}"})}

        if method == 'POST' and action == 'login':
            username = body.get('username', '').strip()
            password = body.get('password', '')
            pw_hash = hash_password(password)
            cur.execute('SELECT id, username, role FROM forum_users WHERE username = %s AND password_hash = %s', (username, pw_hash))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Неверный логин или пароль'})}
            session_token = secrets.token_hex(32)
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'id': user[0], 'username': user[1], 'role': user[2], 'token': f"{user[0]}:{session_token}"})}

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    finally:
        cur.close()
        conn.close()
