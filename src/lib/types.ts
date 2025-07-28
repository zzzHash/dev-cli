export type CommitType =
  | "[ feat ]    "
  | "[ fix ]     "
  | "[ docs ]    "
  | "[ style ]   "
  | "[ refactor ]"
  | "[ test ]    "
  | "[ chore ]   "
  | "[ perf ]    "
  | "[ build ]   ";

export const commitTypes: {
  [key in CommitType]: { emoji: string; desc: string };
} = {
  "[ feat ]    ": { emoji: "🚀", desc: "New feature" },
  "[ fix ]     ": { emoji: "🐛", desc: "Bug fix" },
  "[ docs ]    ": { emoji: "📚", desc: "Documentation" },
  "[ style ]   ": { emoji: "🎨", desc: "Formatting and style" },
  "[ refactor ]": { emoji: "🔧", desc: "Code Refactor" },
  "[ test ]    ": { emoji: "🧪", desc: "Tests" },
  "[ chore ]   ": { emoji: "📦", desc: "maintenance" },
  "[ perf ]    ": { emoji: "⚡", desc: "Performance" },
  "[ build ]   ": { emoji: "🏗️", desc: "Build" },
};
