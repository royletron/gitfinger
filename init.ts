import Options from "./options.ts";
import {exists} from "https://deno.land/std/fs/mod.ts";
import config, {create, load, save} from "./config.ts";
import { Input } from "https://deno.land/x/cliffy/prompt/mod.ts";
import {clone} from "./git.ts";
import {info} from "./logger.ts";

export  async function isInit(options: Options) {

}

export default async function init(options: Options) {
  const configExists = await exists(options.config)
  if(!configExists) {
    await create(options.config);
  } else {
    await load(options.config);
    info(`Loaded existing config from ${options.config}`)
  }
  if(!config.me.repo) {
    const repo: string = await Input.prompt("What is your git repo?");
    await clone(repo, config.paths.repos.me);
    config.me.repo = repo;
  } else {
    // check the repo is good?
  }
  await save(options.config, config);
}