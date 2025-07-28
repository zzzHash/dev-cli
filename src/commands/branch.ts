import inquirer from "inquirer";
import { $ } from "execa";
import { colors } from "../lib/colors";
import { listBranches } from "../lib/git";

export async function runBranchWorkflow() {
  console.log(colors.label("\n🔀 Feature Branch Workflow\n"));

  await listBranches();

  const { step } = await inquirer.prompt([
    {
      type: "list",
      name: "step",
      message: "What do you want to do?",
      default: "create",
      choices: [
        {
          name: "[ 1 ] Create and switch to a new feature branch",
          value: "create",
        },
        { name: "[ 2 ] Merge current feature branch to main", value: "merge" },
        { name: "[ 3 ] Go back", value: "back" },
      ],
    },
  ]);

  if (step === "back") return;

  if (step === "create") {
    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter the feature name (e.g. login-form):",
        validate: (input) => !!input.trim() || "Branch name cannot be empty.",
      },
    ]);

    const branchName = `feat/${name.replace(/\s+/g, "-")}`;

    try {
      await $`git checkout -b ${branchName}`;
      console.log(colors.success(`✅ Switched to new branch: ${branchName}`));
    } catch (err) {
      console.error(colors.error("❌ Error creating branch:"), err);
    }
  }

  if (step === "merge") {
    const { stdout: currentBranch } = await $`git branch --show-current`;

    if (!currentBranch.startsWith("feat/")) {
      console.log(colors.warning("⚠️  You are not on a feature branch."));
      return;
    }

    try {
      await $`git checkout main`;
      await $`git pull origin main`;
      await $`git merge ${currentBranch}`;
      await $`git push origin main`;
      await $`git branch -d ${currentBranch}`;
      console.log(
        colors.success(
          "✅ Feature branch merged into main and deleted locally."
        )
      );
    } catch (err) {
      console.error(colors.error("❌ Merge failed:"), err);
    }
  }
}
