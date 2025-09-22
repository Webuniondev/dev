import { test, expect } from "@playwright/test";

test.describe("Inscription multi-étapes", () => {
  test("Particulier - happy path", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /particulier/i }).click();

    // Étape 1 - Email
    await page.getByLabel(/adresse email/i).fill("newuser@example.com");
    await expect(page.getByRole("button", { name: /suivant/i })).toBeEnabled();
    await page.getByRole("button", { name: /suivant/i }).click();

    // Étape 2 - Infos + mot de passe
    await page.getByLabel(/prénom/i).fill("Jean");
    await page.getByRole("textbox", { name: "Nom *", exact: true }).fill("Dupont");
    await page.getByLabel(/téléphone/i).fill("+33 1 23 45 67 89");
    await page.getByLabel(/adresse/i).fill("1 rue de Paris");
    await page.getByLabel(/ville/i).fill("Paris");
    await page.getByRole("textbox", { name: "Mot de passe *", exact: true }).fill("Password1");
    await page.getByRole("textbox", { name: "Confirmez le mot de passe *" }).fill("Password1");

    // Soumettre (mock d'API conseillé avec MSW en CI)
    // Ici on vérifie au moins que le bouton est activé
    await expect(page.getByRole("button", { name: /créer mon compte/i })).toBeEnabled();
  });

  test("Professionnel - happy path", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /professionnel\s+je propose mes/i }).click();

    // Étape 1 - Email
    await page.getByLabel(/email professionnel/i).fill("pro@example.com");
    await expect(page.getByRole("button", { name: /suivant/i })).toBeEnabled();
    await page.getByRole("button", { name: /suivant/i }).click();

    // Étape 2 - Infos perso + adresse
    await page.getByLabel(/prénom/i).fill("Paul");
    await page.getByRole("textbox", { name: "Nom *", exact: true }).fill("Martin");
    await page.getByLabel(/téléphone professionnel/i).fill("+33 1 23 45 67 89");
    await page.getByLabel(/adresse professionnelle/i).fill("2 rue de Lyon");
    await page.getByLabel(/ville/i).fill("Lyon");
    await page.getByLabel(/département/i).selectOption("75");
    await page.getByRole("button", { name: /suivant/i }).click();

    // Étape 3 - Secteur + spécialité + entreprise
    await page.getByLabel(/secteur d'activité/i).selectOption("batiment");
    await page.getByLabel(/spécialité/i).selectOption("plomberie");
    await page.getByLabel(/nom de l'entreprise/i).fill("Plombier Pro");
    await page.getByLabel(/années d'expérience/i).fill("5");
    await page.getByRole("button", { name: /suivant/i }).click();

    // Étape 4 - Mot de passe
    await page.getByRole("textbox", { name: "Mot de passe *", exact: true }).fill("Password1");
    await page.getByRole("textbox", { name: "Confirmez le mot de passe *" }).fill("Password1");
    await expect(
      page.getByRole("button", { name: /créer mon compte professionnel/i }),
    ).toBeEnabled();
  });
});
