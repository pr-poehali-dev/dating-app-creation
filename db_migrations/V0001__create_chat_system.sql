CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  location VARCHAR(100) NOT NULL,
  bio TEXT,
  image_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER NOT NULL REFERENCES users(id),
  user2_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id),
  sender_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

INSERT INTO users (name, age, location, bio, image_url, verified) VALUES
  ('Анна', 28, 'Москва', 'Архитектор с любовью к искусству и путешествиям. Ищу серьёзные отношения с интересным собеседником.', 'https://cdn.poehali.dev/projects/3dbf1073-df46-498b-8ade-7eceea983fbf/files/6cc367e4-631a-49af-b1e3-69bc380b3b91.jpg', true),
  ('Дмитрий', 32, 'Москва', 'Предприниматель, увлекаюсь спортом и литературой. Ценю искренность и глубокие разговоры.', 'https://cdn.poehali.dev/projects/3dbf1073-df46-498b-8ade-7eceea983fbf/files/fd4ac00d-51a2-40bc-ba76-dca7524f11a9.jpg', true),
  ('Екатерина', 29, 'Москва', 'Психолог и любитель классической музыки. Ищу серьёзные отношения с человеком со схожими ценностями.', 'https://cdn.poehali.dev/projects/3dbf1073-df46-498b-8ade-7eceea983fbf/files/c4e4b660-5c55-4ecc-909e-8c448a905ca3.jpg', true);