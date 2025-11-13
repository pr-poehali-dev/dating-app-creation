import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle chat messages - get messages, send messages, get chat list
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with messages or status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'list')
            
            if action == 'list':
                user_id = params.get('userId', '1')
                
                cur.execute('''
                    SELECT DISTINCT
                        c.id as chat_id,
                        CASE 
                            WHEN c.user1_id = %s THEN u2.id
                            ELSE u1.id
                        END as other_user_id,
                        CASE 
                            WHEN c.user1_id = %s THEN u2.name
                            ELSE u1.name
                        END as other_user_name,
                        CASE 
                            WHEN c.user1_id = %s THEN u2.image_url
                            ELSE u1.image_url
                        END as other_user_image,
                        m.content as last_message,
                        m.created_at as last_message_time
                    FROM chats c
                    JOIN users u1 ON c.user1_id = u1.id
                    JOIN users u2 ON c.user2_id = u2.id
                    LEFT JOIN LATERAL (
                        SELECT content, created_at
                        FROM messages
                        WHERE chat_id = c.id
                        ORDER BY created_at DESC
                        LIMIT 1
                    ) m ON true
                    WHERE c.user1_id = %s OR c.user2_id = %s
                    ORDER BY m.created_at DESC NULLS LAST
                ''', (user_id, user_id, user_id, user_id, user_id))
                
                chats = []
                for row in cur.fetchall():
                    chats.append({
                        'chatId': row[0],
                        'otherUserId': row[1],
                        'otherUserName': row[2],
                        'otherUserImage': row[3],
                        'lastMessage': row[4],
                        'lastMessageTime': str(row[5]) if row[5] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'chats': chats})
                }
            
            elif action == 'messages':
                chat_id = params.get('chatId')
                
                cur.execute('''
                    SELECT m.id, m.sender_id, u.name, m.content, m.created_at
                    FROM messages m
                    JOIN users u ON m.sender_id = u.id
                    WHERE m.chat_id = %s
                    ORDER BY m.created_at ASC
                ''', (chat_id,))
                
                messages = []
                for row in cur.fetchall():
                    messages.append({
                        'id': row[0],
                        'senderId': row[1],
                        'senderName': row[2],
                        'content': row[3],
                        'createdAt': str(row[4])
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'messages': messages})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'send':
                chat_id = body.get('chatId')
                sender_id = body.get('senderId')
                content = body.get('content')
                
                if not chat_id:
                    user1_id = body.get('user1Id')
                    user2_id = body.get('user2Id')
                    
                    cur.execute('''
                        INSERT INTO chats (user1_id, user2_id)
                        VALUES (%s, %s)
                        ON CONFLICT (user1_id, user2_id) DO NOTHING
                        RETURNING id
                    ''', (min(int(user1_id), int(user2_id)), max(int(user1_id), int(user2_id))))
                    
                    result = cur.fetchone()
                    if result:
                        chat_id = result[0]
                    else:
                        cur.execute('''
                            SELECT id FROM chats 
                            WHERE user1_id = %s AND user2_id = %s
                        ''', (min(int(user1_id), int(user2_id)), max(int(user1_id), int(user2_id))))
                        chat_id = cur.fetchone()[0]
                
                cur.execute('''
                    INSERT INTO messages (chat_id, sender_id, content)
                    VALUES (%s, %s, %s)
                    RETURNING id, created_at
                ''', (chat_id, sender_id, content))
                
                message_id, created_at = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'messageId': message_id,
                        'chatId': chat_id,
                        'createdAt': str(created_at)
                    })
                }
        
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'})
        }
        
    finally:
        cur.close()
        conn.close()
