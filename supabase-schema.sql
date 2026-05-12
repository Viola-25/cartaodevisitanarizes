-- =====================================================
-- SCHEMA SUPABASE - Narizes de Plantão
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela de Palhaços
CREATE TABLE palhacos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  palhaco_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255),
  bio TEXT,
  photo TEXT NOT NULL,
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  linkedin VARCHAR(255),
  website VARCHAR(255),
  custom_links JSONB DEFAULT '[]'::jsonb,
  color1 VARCHAR(7) DEFAULT '#E74C3C',
  color2 VARCHAR(7) DEFAULT '#F39C12',
  additional_images JSONB DEFAULT '[]'::jsonb,
  section_order JSONB DEFAULT '["bio", "social", "images", "links"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuários (para autenticação)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_palhacos_palhaco_id ON palhacos(palhaco_id);
CREATE INDEX idx_palhacos_created_at ON palhacos(created_at DESC);
CREATE INDEX idx_users_email ON users(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para palhacos
CREATE TRIGGER update_palhacos_updated_at BEFORE UPDATE ON palhacos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Descomente se usar auth do Supabase
-- ALTER TABLE palhacos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Palhacos are publicly readable" ON palhacos
--   FOR SELECT USING (true);

-- CREATE POLICY "Users can only read themselves" ON users
--   FOR SELECT USING (auth.uid() = id);

-- Criar bucket de storage para PDFs
-- Via dashboard: Storage > Create new bucket > Nome: 'pdfs' > Public

-- Criar bucket de storage para imagens
-- Via dashboard: Storage > Create new bucket > Nome: 'images' > Public
