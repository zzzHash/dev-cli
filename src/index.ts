import inquirer from "inquirer";
import { colors } from "./lib/colors";
import { runBranchWorkflow } from "./commands/branch";
import { runCommitWorkflow } from "./commands/commit";

async function main() {
  console.clear();
  console.log(colors.header("📦 Dev CLI\n"));

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        { name: "1) Create or manage a feature branch", value: "branch" },
        { name: "2) Make a commit (Conventional Commits)", value: "commit" },
      ],
    },
  ]);

  if (action === "branch") await runBranchWorkflow();
  if (action === "commit") await runCommitWorkflow();
}

main();
