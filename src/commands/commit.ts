import inquirer from "inquirer";
import { colors } from "../lib/colors";
import { commitTypes } from "../lib/types";
import {
  configureRemoteIfMissing,
  ensureGitRepo,
  hasChanges,
  makeCommit,
} from "../lib/git";
import { buildCommitMessage, getPreview } from "../lib/messages";

export async function runCommitWorkflow() {
  console.clear();
  console.log(colors.header("📦 Dev CLI\n"));

  await ensureGitRepo();
  await configureRemoteIfMissing();

  const hasStaged = await hasChanges();
  if (!hasStaged) {
    console.log(colors.warning("⚠️  Nothing to commit!"));
    process.exit(0);
  }

  const { type } = await inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "Choose a commit type:",
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
      message: "Scope (optional):",
    },
  ]);

  const { description } = await inquirer.prompt([
    {
      type: "input",
      name: "description",
      message: "Commit description:",
      validate: (input: string) =>
        input.trim() !== "" ? true : "Commit description cannot be empty.",
    },
  ]);

  const preview = getPreview(type, scope, description);
  console.log(`\n${colors.label("Preview:")} ${colors.border(preview)}\n`);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Confirm commit?",
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(colors.warning("❌ Canceled commit."));
    process.exit(0);
  }

  const message = buildCommitMessage(type, scope, description);

  try {
    await makeCommit(message);
    console.log(colors.success("✅ Commit realized successfully!"));
  } catch (err) {
    console.log(colors.error("❌ Error commiting:"), err);
  }
}
