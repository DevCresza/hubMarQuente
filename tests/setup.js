/**
 * Setup para testes
 * Este arquivo é executado antes de todos os testes
 */

// Configurar variáveis de ambiente para testes
process.env.VITE_SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzU2MzMsImV4cCI6MjA3ODU1MTYzM30.ZhbzonRvHk6T0CqThNwnxnuR8j9Mm4LnXucYggLHtUI';

console.log('🧪 Setup de testes carregado');
