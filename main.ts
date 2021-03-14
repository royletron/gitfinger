import { Command } from "https://deno.land/x/cliffy/command/command.ts";
import {add, list, remove} from "./friends.ts";
import init from "./init.ts";
import {join} from "https://deno.land/std/path/mod.ts";
import update from "./update.ts";

await new Command()
  .name("gitfinger")
  .version("0.1.0")
  .description("Keep up with all friends. Just like they did in 1998.")
  .option("-c, --config [path:string]", "Configuration file location.", {
    required: true,
    default: join(Deno.env.get("HOME") || "", ".finger/config.yaml"),
    global: true
  })
  .command("init", "First time initialisation.")
  .action(init)
  .command("update", "Write your own plafile.")
  .action(update)
  .command("friends", new Command()
    .description("Manage your friends.")
    .command(
      "add <url:string>",
      "Add a friend to your list.",
    )
    .action(add)
    .command(
      "remove <name:string>",
      "Remove a friend from your list"
    )
    .action(remove)
    .command(
      "list",
      "List all of your friends"
    )
    .action(list))
  .parse(Deno.args);