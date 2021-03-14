export async function runTTY(args: string[], path?: string) {
  const cmd = Deno.run({
    cmd: args,
    cwd: path
  });
  const {code} = await cmd.status();
  cmd.close();
  return {code};
}

export async function run(args: string[], path?: string) {
  const cmd = Deno.run({
    cmd: args,
    stdout: "piped",
    stderr: "piped",
    cwd: path
  });
  const output = await cmd.output() // "piped" must be set
  const outStr = new TextDecoder().decode(output);
  const error = await cmd.stderrOutput();
  const errorStr = new TextDecoder().decode(error);
  const { code } = await cmd.status();
  cmd.close(); // Don't forget to close it
  return {
    out: outStr, error: errorStr, code
  }
}