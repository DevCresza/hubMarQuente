import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@teste.com');
    await page.locator('input[type="password"]').fill('teste123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('Deve carregar o dashboard corretamente', async ({ page }) => {
    // Verificar URL
    await expect(page).toHaveURL('/dashboard');

    // Verificar se título ou saudação está presente
    const greeting = page.locator('text=/olá|hello|bem-vindo|dashboard/i').first();
    await expect(greeting).toBeVisible({ timeout: 5000 });
  });

  test('Deve exibir cards de estatísticas', async ({ page }) => {
    // Aguardar página carregar completamente
    await page.waitForLoadState('networkidle');

    // Verificar se existem cards/widgets de estatísticas
    // Procurar por textos comuns em cards de dashboard
    const statsTexts = [
      'Tarefas',
      'Projetos',
      'Urgentes',
      'Conclusão',
      'Total'
    ];

    // Verificar se pelo menos 2 cards estão presentes
    let cardsFound = 0;
    for (const text of statsTexts) {
      const element = page.locator(`text=/${text}/i`).first();
      if (await element.isVisible().catch(() => false)) {
        cardsFound++;
      }
    }

    expect(cardsFound).toBeGreaterThanOrEqual(2);
  });

  test('Deve exibir sidebar com navegação', async ({ page }) => {
    // Verificar se sidebar está presente
    const sidebar = page.locator('aside, nav, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();

    // Verificar links de navegação principais
    const navLinks = ['Projetos', 'Tarefas', 'Departamentos'];

    for (const linkText of navLinks) {
      const link = page.locator(`a:has-text("${linkText}")`).first();
      await expect(link).toBeVisible();
    }
  });

  test('Deve navegar para página de Projetos', async ({ page }) => {
    // Clicar no link de Projetos
    await page.locator('a:has-text("Projetos")').first().click();

    // Verificar se navegou
    await page.waitForURL(/\/projects/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/projects/);
  });

  test('Deve navegar para página de Tarefas', async ({ page }) => {
    // Clicar no link de Tarefas
    await page.locator('a:has-text("Tarefas")').first().click();

    // Verificar se navegou
    await page.waitForURL(/\/tasks/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/tasks/);
  });

  test('Deve exibir nome do usuário logado', async ({ page }) => {
    // Procurar por "Administrador" ou "Admin" na página
    const userName = page.locator('text=/Administrador|Admin/i').first();
    await expect(userName).toBeVisible({ timeout: 5000 });
  });
});
