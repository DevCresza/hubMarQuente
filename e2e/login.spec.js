import { test, expect } from '@playwright/test';

test.describe('Login e Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('Deve carregar a página de login corretamente', async ({ page }) => {
    // Verificar se a página carregou
    await expect(page).toHaveURL('/login');

    // Verificar elementos principais
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Deve mostrar erro ao tentar login sem preencher campos', async ({ page }) => {
    // Clicar no botão de submit sem preencher
    await page.locator('button[type="submit"]').click();

    // Verificar se algum erro aparece (pode ser validação HTML5 ou mensagem customizada)
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('Deve mostrar erro com email inválido', async ({ page }) => {
    await page.locator('input[type="email"]').fill('email-invalido');
    await page.locator('input[type="password"]').fill('qualquersenha');
    await page.locator('button[type="submit"]').click();

    // Verificar validação HTML5 de email
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('Deve fazer login com credenciais corretas e redirecionar para dashboard', async ({ page }) => {
    // Preencher credenciais
    await page.locator('input[type="email"]').fill('admin@teste.com');
    await page.locator('input[type="password"]').fill('teste123');

    // Clicar em login
    await page.locator('button[type="submit"]').click();

    // Aguardar redirecionamento para dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Verificar se está no dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verificar se elementos do dashboard estão presentes
    await expect(page.locator('text=/dashboard|Dashboard/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Deve mostrar erro com credenciais incorretas', async ({ page }) => {
    await page.locator('input[type="email"]').fill('admin@teste.com');
    await page.locator('input[type="password"]').fill('senhaerrada123');

    await page.locator('button[type="submit"]').click();

    // Aguardar mensagem de erro aparecer
    // Pode ser um toast, alert ou mensagem na página
    await page.waitForTimeout(2000);

    // Verificar se continua na página de login (não redirecionou)
    await expect(page).toHaveURL('/login');
  });

  test('Deve ter link para criar conta', async ({ page }) => {
    // Procurar por link de registro
    const signupLink = page.locator('a[href*="register"], a:has-text("Criar conta"), a:has-text("Registrar")').first();
    await expect(signupLink).toBeVisible();
  });
});

test.describe('Logout', () => {
  test('Deve fazer logout e voltar para login', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@teste.com');
    await page.locator('input[type="password"]').fill('teste123');
    await page.locator('button[type="submit"]').click();

    // Aguardar dashboard carregar
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Procurar botão de logout (pode estar em menu, sidebar, etc)
    const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout"), a:has-text("Sair"), a:has-text("Logout")').first();

    // Clicar no logout
    await logoutButton.click();

    // Verificar se voltou para login
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });
});
