import { $ } from "execa";
import fs from "fs";
import inquirer from "inquirer";
import { colors } from "./colors";

export async function ensureGitRepo() {
  const isGitRepo = fs.existsSync(".git");

  if (!isGitRepo) {
    console.log(colors.warning("⚠️  This directory is not a Git repository."));
    const { init } = await inquirer.prompt([
      {
        type: "confirm",
        name: "init",
        message: "Do you want to initialize a Git repository here?",
        default: true,
      },
    ]);

    if (init) {
      await $`git init`;
      console.log(colors.success("✅ Git repository initialized."));
    } else {
      console.log(colors.error("❌ Commit aborted. A Git repo is required."));
      process.exit(1);
    }
  }
}

export async function configureRemoteIfMissing() {
  const { stdout: remotes } = await $`git remote`;

  if (remotes.trim().length === 0) {
    const { setRemote } = await inquirer.prompt([
      {
        type: "confirm",
        name: "setRemote",
        message: "No remote repository is configured. Do you want to add one?",
        default: true,
      },
    ]);

    if (setRemote) {
      const { remoteUrl } = await inquirer.prompt([
        {
          type: "input",
          name: "remoteUrl",
          message:
            "Enter the remote Git URL (e.g. https://github.com/user/repo.git):",
          validate: (url: string) =>
            url.startsWith("http") && url.endsWith(".git")
              ? true
              : "Invalid URL.",
        },
      ]);

      await $`git remote add origin ${remoteUrl}`;
      console.log(colors.success("✅ Remote 'origin' configured."));
    }
  }
}

export async function hasChanges() {
  try {
    const { stdout } = await $`git status --porcelain`;
    return stdout.trim().length > 0;
  } catch {
    console.error(colors.error("❌ Could not check Git changes."));
    process.exit(1);
  }
}

export async function makeCommit(message: string) {
  await $`git add -A`;
  await $`git commit -m ${message}`;

  try {
    const { stdout: remotes } = await $`git remote`;
    if (remotes.trim().length === 0) {
      console.warn(
        colors.warning("⚠️  No remote configured. Commit completed locally.")
      );
      return;
    }

    try {
      await $`git push`;
    } catch (err: any) {
      if (
        err.stderr.includes("has no upstream branch") ||
        err.stderr.includes("set the remote as upstream")
      ) {
        const { stdout: branch } = await $`git branch --show-current`;
        console.log(colors.warning(`⚠️  Branch '${branch}' has no upstream.`));

        const { pushUpstream } = await inquirer.prompt([
          {
            type: "confirm",
            name: "pushUpstream",
            message: `Do you want to push and set upstream to origin/${branch}?`,
            default: true,
          },
        ]);

        if (pushUpstream) {
          await $`git push --set-upstream origin ${branch}`;
          console.log(colors.success("✅ Pushed and upstream set."));
        } else {
          console.log(colors.warning("⚠️  Push skipped."));
        }
      } else {
        console.error(
          colors.error("❌ Error pushing to remote:"),
          err.stderr || err.message
        );
      }
    }
  } catch (err) {
    console.error(colors.error("❌ Failed to get remote info."), err);
  }
}
