import Options from "./options.ts";
import {load} from "./config.ts";
import {runTTY} from "./utils.ts"
import {info} from "./logger.ts";
import {add, commit, pull, push, status} from "./git.ts";
import {join} from "https://deno.land/std/path/mod.ts";

export default async function update(options: Options) {
  const config = await load(options.config)
  info(`Opening editor ${config.editor}: ${config.planfile}`)
  const {code} = await runTTY([config.editor, config.planfile]);
  await pull(config.paths.repos.me)
  await Deno.copyFile(config.planfile, join(config.paths.repos.me, '.plan'))
  const changed = await status(config.paths.repos.me);
  if(changed) {
    info('Your .plan has changed')
    // need to commit
    await add(config.paths.repos.me)
    await commit(config.paths.repos.me, `Updating .plan`)
    await push(config.paths.repos.me)
  }
}