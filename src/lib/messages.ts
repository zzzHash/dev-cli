import { type CommitType, commitTypes } from "./types";

export function buildCommitMessage(
  type: CommitType,
  scope: string,
  message: string
): string {
  const scopeFormatted = scope ? `(${scope})` : "";
  return `${type}${scopeFormatted}: ${message}`;
}

export function getPreview(
  type: CommitType,
  scope: string,
  message: string
): string {
  const icon = commitTypes[type].emoji;
  return `${icon}  ${buildCommitMessage(type, scope, message)}`;
}
