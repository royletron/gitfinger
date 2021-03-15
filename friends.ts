import { Input } from "https://deno.land/x/cliffy/prompt/input.ts";
import {join} from "https://deno.land/std/path/mod.ts";
import { Table } from "https://deno.land/x/cliffy/table/mod.ts";
import { format } from 'https://deno.land/std/datetime/mod.ts'
import Options from "./options.ts";
import parseRemoteUri from "./repo.ts";
import {clone} from "./git.ts";
import {load, save} from "./config.ts";
import {error, info} from "./logger.ts";
import { colors } from "https://deno.land/x/cliffy/ansi/colors.ts";

const getUsername = (path: string) => {
  const info = parseRemoteUri(path);
  return info.owner || "";
}

const getSlug = (path: string) => {
  const info = parseRemoteUri(path);
  return `${info.host.replaceAll('/', '-')}-${info.owner?.replaceAll('/', '-')}-${info.project.replaceAll('/', '-')}`.replaceAll('.', '')
}

const formatDate = (date: Date) => format(date, "dd-MM-yyyy hh:mm a");

export async function list(options: Options) {
  const config = await load(options.config);
  const table: Table = Table.from(
    Object.keys(config.friends).map((friend) => [friend, config.friends[friend].repo, formatDate(config.friends[friend].updatedAt)])
  )
    .header(["Name", "Repo", "Last Updated"])
    .indent(2)
    .border(true)
  console.log(table.toString());
}

export async function add(options: Options, repo: string) {
  const slug = getSlug(repo);
  const username = getUsername(repo);
  const config = await load(options.config)
  const friendName: string = await Input.prompt({
    message: "What shall we call them?",
    minLength: 2,
    list: true,
    suggestions: [
      username
    ],
  });
  await clone(repo, join(config.paths.repos.friends, slug));
  if(!config.friends) {
    config.friends = {};
  }
  config.friends[friendName] = {createdAt: new Date(), updatedAt: new Date(), repo, slug}
  await save(options.config, config);
}

export async function remove(options: Options, name: string) {
  const config = await load(options.config);
  if(!config.friends[name]) {
    error(`No friend ${colors.red(name)} in your config`)
    return;
  }
  await Deno.remove(join(config.paths.repos.friends, config.friends[name].slug), { recursive: true })
  delete config.friends[name];
  info(`Removed ${name} from friends`)
  await save(options.config, config);
}