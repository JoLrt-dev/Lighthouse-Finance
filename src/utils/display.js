import { cyan } from "colorette";

export function createLoader(text) {
  const chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  return setInterval(() => {
    process.stdout.write(`\r${cyan(chars[i++ % chars.length])} ${text}`);
  }, 100);
}
