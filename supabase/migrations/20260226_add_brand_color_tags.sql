-- Adicionar coluna color à tabela brands
ALTER TABLE brands ADD COLUMN IF NOT EXISTS color text;

-- Adicionar colunas brand_id, color e tags à tabela launch_calendar
ALTER TABLE launch_calendar ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id);
ALTER TABLE launch_calendar ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE launch_calendar ADD COLUMN IF NOT EXISTS tags jsonb;

-- Verificar se marketing_assets tem brand_id e tags (podem já existir)
ALTER TABLE marketing_assets ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id);
ALTER TABLE marketing_assets ADD COLUMN IF NOT EXISTS tags jsonb;
