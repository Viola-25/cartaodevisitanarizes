-- =====================================================
-- SCHEMA SUPABASE - Narizes de Plantão
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela de Palhaços
CREATE TABLE IF NOT EXISTS palhacos (
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
  pdf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_palhacos_palhaco_id ON palhacos(palhaco_id);
CREATE INDEX IF NOT EXISTS idx_palhacos_created_at ON palhacos(created_at DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para palhacos
DROP TRIGGER IF EXISTS update_palhacos_updated_at ON palhacos;
CREATE TRIGGER update_palhacos_updated_at BEFORE UPDATE ON palhacos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Garantir coluna `pdf` caso tabela já exista (idempotente)
ALTER TABLE IF EXISTS palhacos ADD COLUMN IF NOT EXISTS pdf TEXT;

-- Remover tabela legado que gerava alerta de seguranca no Advisor
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users;

-- RLS (Row Level Security) para tabela principal
ALTER TABLE palhacos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Palhacos are publicly readable" ON palhacos;
CREATE POLICY "Palhacos are publicly readable" ON palhacos
  FOR SELECT USING ((auth.role() = 'anon') OR (auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Authenticated can insert palhacos" ON palhacos;
CREATE POLICY "Authenticated can insert palhacos" ON palhacos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can update palhacos" ON palhacos;
CREATE POLICY "Authenticated can update palhacos" ON palhacos
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can delete palhacos" ON palhacos;
CREATE POLICY "Authenticated can delete palhacos" ON palhacos
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Criar bucket de storage para PDFs
-- Via dashboard: Storage > Create new bucket > Nome: 'pdfs' > Public

-- Criar bucket de storage para imagens
-- Via dashboard: Storage > Create new bucket > Nome: 'images' > Public
