import Options from "./options.ts";
import parseRemoteUri from "./repo.ts";
import { Input } from "https://deno.land/x/cliffy/prompt/input.ts";
import { slugify } from "https://deno.land/x/slugify/mod.ts";
import {join} from "https://deno.land/std/path/mod.ts";
import {clone} from "./git.ts";
import {load, save} from "./config.ts";
import { Table } from "https://deno.land/x/cliffy/table/mod.ts";
import { format } from 'https://deno.land/std/datetime/mod.ts'

const getUsername = (path: string) => {
  const info = parseRemoteUri(path);
  return info.owner || "";
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
  const slug = slugify(repo);
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
  config.friends[friendName] = {createdAt: new Date(), updatedAt: new Date(), repo, slug}
  await save(options.config, config);
}

export async function remove(options: Options, name: string) {

}