// Returns the first configured secret that holds an Anthropic key (sk-ant-...), so the key works under any of these names.
export function getAnthropicKey(): string | undefined {
  for (const name of ["ANTHROPIC_API_KEY", "CLAUDE_API_KEY", "OPENAI_API_KEY"]) {
    const value = Deno.env.get(name)?.trim();
    if (value && value.startsWith("sk-ant")) return value;
  }
  return undefined;
}
