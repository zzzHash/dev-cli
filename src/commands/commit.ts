import inquirer from "inquirer";
import { colors } from "../lib/colors";
import { commitTypes } from "../lib/types";
import { hasChanges, makeCommit } from "../lib/git";
import { buildCommitMessage, getPreview } from "../lib/messages";

export async function runCommitWorkflow() {
  console.clear();
  console.log(colors.header("📦 Commit CLI - Conventional Commits\n"));

  const hasStaged = await hasChanges();
  if (!hasStaged) {
    console.log(colors.warning("⚠️  Nada para commitar!"));
    process.exit(0);
  }

  const { type } = await inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "Escolha o tipo de commit:",
      choices: Object.entries(commitTypes).map(([key, { emoji, desc }]) => ({
        name: `${emoji}  ${key} - ${desc}`,
        value: key,
      })),
    },
  ]);

  const { scope } = await inquirer.prompt([
    {
      type: "input",
      name: "scope",
      message: "Escopo (opcional):",
    },
  ]);

  const { description } = await inquirer.prompt([
    {
      type: "input",
      name: "description",
      message: "Descrição do commit:",
      validate: (input: string) =>
        input.trim() !== "" ? true : "Descrição obrigatória.",
    },
  ]);

  const preview = getPreview(type, scope, description);
  console.log(
    `\n${colors.label("Prévia da mensagem:")} ${colors.border(preview)}\n`
  );

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Confirmar commit?",
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(colors.warning("❌ Commit cancelado."));
    process.exit(0);
  }

  const message = buildCommitMessage(type, scope, description);

  try {
    await makeCommit(message);
    console.log(colors.success("✅ Commit realizado com sucesso!"));
  } catch (err) {
    console.log(colors.error("❌ Erro ao realizar commit:"), err);
  }
}
