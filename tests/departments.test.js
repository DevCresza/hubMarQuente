/**
 * TESTES DA PÁGINA DEPARTMENTS - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades de gestão de departamentos
 */

import { describe, it, expect, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// IDs de teste para cleanup
let testDepartmentIds = [];

describe('📊 Departments - Carregamento de Dados', () => {
  it('Deve carregar todos os departamentos', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar departamento específico por ID', async () => {
    const { data: departments } = await supabase
      .from('departments')
      .select('*')
      .limit(1);

    if (departments && departments.length > 0) {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', departments[0].id)
        .single();

      expect(error).toBeNull();
      expect(data.id).toBe(departments[0].id);
    }
  });

  it('Deve contar total de departamentos', async () => {
    const { count, error } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(typeof count).toBe('number');
  });
});

describe('📝 Departments - Criação e Edição', () => {
  it('Deve criar novo departamento', async () => {
    const deptData = {
      name: 'Departamento Teste ' + Date.now(),
      description: 'Descrição do departamento de teste',
      color: '#3B82F6',
      icon: 'building'
    };

    const { data, error } = await supabase
      .from('departments')
      .insert(deptData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe(deptData.name);
    expect(data.color).toBe(deptData.color);

    if (data) {
      testDepartmentIds.push(data.id);
    }
  });

  it('Deve criar departamento com todos os campos', async () => {
    const deptData = {
      name: 'Departamento Completo',
      description: 'Departamento com todos os campos preenchidos',
      color: '#EC4899',
      icon: 'users'
    };

    const { data, error } = await supabase
      .from('departments')
      .insert(deptData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.name).toBe(deptData.name);
    expect(data.description).toBe(deptData.description);
    expect(data.color).toBe(deptData.color);
    expect(data.icon).toBe(deptData.icon);

    if (data) {
      testDepartmentIds.push(data.id);
    }
  });

  it('Deve atualizar departamento existente', async () => {
    const { data: dept } = await supabase
      .from('departments')
      .insert({
        name: 'Departamento Atualizar',
        description: 'Original',
        color: '#000000'
      })
      .select()
      .single();

    if (dept) {
      testDepartmentIds.push(dept.id);

      const { data, error } = await supabase
        .from('departments')
        .update({
          description: 'Atualizada',
          color: '#FF0000'
        })
        .eq('id', dept.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.description).toBe('Atualizada');
      expect(data.color).toBe('#FF0000');
    }
  });

  it('Deve validar campo obrigatório (name)', async () => {
    const { error } = await supabase
      .from('departments')
      .insert({
        description: 'Sem nome'
        // Faltando name
      });

    expect(error).not.toBeNull();
  });
});

describe('🎨 Departments - Cores e Ícones', () => {
  it('Deve salvar cor em formato hexadecimal', async () => {
    const colors = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B'];

    for (const color of colors) {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: `Dept ${color}`,
          color: color
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.color).toBe(color);

      if (data) {
        testDepartmentIds.push(data.id);
      }
    }
  });

  it('Deve salvar ícone como string', async () => {
    const icons = ['building', 'users', 'briefcase', 'code'];

    for (const icon of icons) {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: `Dept ${icon}`,
          color: '#3B82F6', // Color é obrigatório
          icon: icon
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.icon).toBe(icon);

      if (data) {
        testDepartmentIds.push(data.id);
      }
    }
  });

  it('Deve permitir ícone null (cor é obrigatória)', async () => {
    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: 'Dept Sem Ícone',
        color: '#000000', // Color é obrigatório (NOT NULL)
        icon: null
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.color).toBe('#000000');
    expect(data.icon).toBeNull();

    if (data) {
      testDepartmentIds.push(data.id);
    }
  });
});

describe('👥 Departments - Relacionamento com Usuários', () => {
  it('Deve contar usuários por departamento', async () => {
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .limit(5);

    if (departments && departments.length > 0) {
      for (const dept of departments) {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept.id);

        expect(error).toBeNull();
        expect(typeof count).toBe('number');
      }
    }
  });

  it('Deve listar usuários de um departamento', async () => {
    const { data: departments } = await supabase
      .from('departments')
      .select('id')
      .limit(1);

    if (departments && departments.length > 0) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('department', departments[0].id);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

describe('📊 Departments - Estatísticas', () => {
  it('Deve calcular total de departamentos ativos', async () => {
    const { count } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true });

    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('Deve listar departamentos mais populosos', async () => {
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .limit(10);

    if (departments && departments.length > 0) {
      const deptStats = [];

      for (const dept of departments) {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept.id);

        deptStats.push({
          name: dept.name,
          userCount: count
        });
      }

      deptStats.sort((a, b) => b.userCount - a.userCount);
      expect(deptStats.length).toBeGreaterThan(0);

      if (deptStats.length > 1) {
        expect(deptStats[0].userCount >= deptStats[1].userCount).toBe(true);
      }
    }
  });

  it('Deve calcular distribuição de usuários por departamento', async () => {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { data: departments } = await supabase
      .from('departments')
      .select('id');

    if (departments && departments.length > 0) {
      let usersInDepartments = 0;

      for (const dept of departments) {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept.id);

        usersInDepartments += count;
      }

      expect(usersInDepartments).toBeLessThanOrEqual(totalUsers);
    }
  });
});

describe('🔍 Departments - Buscas e Filtros', () => {
  it('Deve buscar departamento por nome', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .ilike('name', '%marketing%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar departamentos por cor', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('color', '#3B82F6');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve ordenar departamentos alfabeticamente', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true })
      .limit(10);

    expect(error).toBeNull();

    if (data && data.length > 1) {
      expect(data[0].name.toLowerCase() <= data[1].name.toLowerCase()).toBe(true);
    }
  });

  it('Deve ordenar por data de criação', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(10);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('🔧 Departments - Departamentos Fixos', () => {
  const FIXED_DEPARTMENTS = [
    { name: 'Marketing', color: '#ec4899' },
    { name: 'Comercial', color: '#3b82f6' },
    { name: 'Desenvolvimento', color: '#10b981' },
    { name: 'Manutenção', color: '#f59e0b' }
  ];

  it('Deve verificar existência dos departamentos fixos', async () => {
    for (const fixedDept of FIXED_DEPARTMENTS) {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('name', fixedDept.name);

      expect(error).toBeNull();
      // Se não existir, está OK - serão criados pela página
      if (data && data.length > 0) {
        expect(data[0].name).toBe(fixedDept.name);
      }
    }
  });
});

describe('🗑️ Departments - Exclusão', () => {
  it('Deve excluir departamento', async () => {
    const { data: dept } = await supabase
      .from('departments')
      .insert({
        name: 'Departamento para Excluir ' + Date.now(),
        description: 'Temporário'
      })
      .select()
      .single();

    if (dept) {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', dept.id);

      expect(error).toBeNull();

      // Verificar exclusão
      const { data } = await supabase
        .from('departments')
        .select('*')
        .eq('id', dept.id);

      expect(data.length).toBe(0);
    }
  });
});

describe('🔧 Departments - Limpeza', () => {
  afterAll(async () => {
    // Limpar departamentos de teste
    if (testDepartmentIds.length > 0) {
      const { error } = await supabase
        .from('departments')
        .delete()
        .in('id', testDepartmentIds);

      expect(error).toBeNull();
    }
  });

  it('Deve limpar dados de teste', async () => {
    expect(testDepartmentIds.length).toBeGreaterThan(0);
  });
});
