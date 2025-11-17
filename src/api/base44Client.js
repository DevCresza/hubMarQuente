// Cliente de dados - pode ser mockado ou Supabase
import { createMockClient } from './mockClient';
import { createSupabaseClient } from './supabaseClient';

// Alternar entre Mock (desenvolvimento) e Supabase (produção)
// Configure no arquivo .env: VITE_USE_MOCK=true ou false
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

console.log(`🔧 Modo de dados: ${USE_MOCK ? 'MOCK (Local)' : 'SUPABASE (Banco de Dados)'}`);

// Exportar cliente apropriado baseado na configuração
export const base44 = USE_MOCK ? createMockClient() : createSupabaseClient();
