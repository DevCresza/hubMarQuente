-- Adicionar coluna color à tabela brands
ALTER TABLE brands ADD COLUMN IF NOT EXISTS color text;

-- Adicionar colunas brand_id, color e tags à tabela launch_calendar
ALTER TABLE launch_calendar ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id);
ALTER TABLE launch_calendar ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE launch_calendar ADD COLUMN IF NOT EXISTS tags jsonb;

-- Verificar se marketing_assets tem brand_id e tags (podem já existir)
ALTER TABLE marketing_assets ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id);
ALTER TABLE marketing_assets ADD COLUMN IF NOT EXISTS tags jsonb;

-- UGC: campos do formulário de influenciadores
ALTER TABLE ugc ADD COLUMN IF NOT EXISTS code character varying;
ALTER TABLE ugc ADD COLUMN IF NOT EXISTS coupon_prefix character varying;
ALTER TABLE ugc ADD COLUMN IF NOT EXISTS tiktok character varying;
ALTER TABLE ugc ADD COLUMN IF NOT EXISTS followers_tiktok integer;
ALTER TABLE ugc ADD COLUMN IF NOT EXISTS rate_per_reel numeric;

-- share_links: contador de acessos
ALTER TABLE share_links ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 0;
