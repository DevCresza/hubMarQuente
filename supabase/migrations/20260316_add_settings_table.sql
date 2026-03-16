-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

-- Inserir configuração padrão de bloqueio de eventos
INSERT INTO settings (key, value) VALUES ('calendar_events_locked', 'false')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users to read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true);
