import {join} from "https://deno.land/std/path/mod.ts";
import {stringify,parse} from "https://deno.land/std/encoding/yaml.ts";
import {ensureFile, exists,} from "https://deno.land/std/fs/mod.ts";
import FingerError, {FingerErrorCode} from "./FingerError.ts";
import {info} from "./logger.ts";

type Friend = {
  repo: string,
  slug: string,
  createdAt: Date,
  updatedAt: Date
}

type Config = {
  paths: {
    repos: {
      me: string,
      friends: string
    }
  },
  me: {
    repo?: string
  },
  friends: Record<string, Friend>,
  planfile: string,
  editor: string,
  lastcheck?: Date,
}

const defaultConfig: Config = {
  paths: {
    repos: {
      me: join(Deno.env.get("HOME") || "", ".finger/repos/me"),
      friends: join(Deno.env.get("HOME") || "", ".finger/repos/friends")
    },
  },
  me: {},
  friends: {},
  planfile: join(Deno.env.get("HOME") || "", ".plan"),
  editor: "vim"
}
let config: Config = Object.assign({}, defaultConfig)

let loaded = false;

export async function load(path: string) {
  if(loaded) {
    return config;
  }
  const configExists = await exists(path);
  if(!configExists) {
    throw new FingerError(FingerErrorCode.ConfigNotFound)
  }
  const text = await Deno.readTextFile(path);
  config = Object.assign({}, defaultConfig, parse(text))
  loaded = true;
  info(`Loaded config from ${path}`)
  return config;
}

export async function save(path: string, config: Config) {
  await ensureFile(path);
  const yaml = stringify(config);
  await Deno.writeTextFile(path, yaml);
  info(`Saved config in ${path}`)
}

export async function create(path: string) {
  await save(path, defaultConfig);
  info(`Created new config in ${path}`)
}

export default config;