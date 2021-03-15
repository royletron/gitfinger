import Options from "./options.ts";
import loader from "./loader.ts";
import {info, SETSILENT} from "./logger.ts";
import {load} from "./config.ts";
import {pull, timestamp} from "./git.ts";
import {join} from "https://deno.land/std/path/mod.ts";
import {exists} from "https://deno.land/std/fs/mod.ts";
import { colors } from "https://deno.land/x/cliffy/ansi/colors.ts";
import { renderMarkdown } from 'https://deno.land/x/charmd/mod.ts';
import dayjs from "https://cdn.skypack.dev/dayjs@1.10.4";
import relativeTime from "https://cdn.skypack.dev/dayjs@1.10.4/plugin/relativeTime";
dayjs.extend(relativeTime)


const CONCURRENCY = 5;

type Report = {
  friend: string,
  update: string,
  updatedAt: Date
}

const printReport = (report: Report) => {
  console.log(
    ` ${colors.blue(">")} ${colors.yellow(report.friend)} > ${colors.yellow.bold.underline(dayjs(report.updatedAt).fromNow())}

${renderMarkdown(report.update).split('\n').map((line) => `   ${line}`).join('\n')}
`
  );
}

export default async function catchup(options: Options): Promise<void> {
  SETSILENT(true);
  loader.show = true;
  loader.text = 'Loading config';
  const reports: Report[] = [];
  try {
    const config = await load(options.config);
    const list = Object.keys(config.friends);
    await list.reduce((prev, friend) => {
      return prev.then(async() => {
        loader.text = `Loading ${friend}`;
        const repo = join(config.paths.repos.friends, config.friends[friend].slug);
        await pull(repo);
        const plan = join(repo, '.plan');
        const planExists = await exists(plan)
        if(planExists) {
          const lastUpdate = await timestamp(repo);
          const text = await Deno.readTextFile(plan)
          reports.push({friend, update: text, updatedAt: new Date(lastUpdate * 1000)});
        }
      })
    }, Promise.resolve())
  } catch(error) {
    console.error(error);
  } finally {
    loader.show = false;
    SETSILENT(false);
    if(reports.length) {
      reports.forEach(printReport);
    } else {
      info('No posts from your friends, maybe you need more?')
    }
  }
}
