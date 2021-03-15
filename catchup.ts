import Options, {HistoryOptions} from "./options.ts";
import loader from "./loader.ts";
import {info, SETSILENT} from "./logger.ts";
import config, {load, save} from "./config.ts";
import {checkout, checkoutReset, history, pull, timestamp} from "./git.ts";
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

export default async function catchup(options: HistoryOptions): Promise<void> {
  SETSILENT(true);
  loader.show = true;
  loader.text = 'Loading config';
  const reports: Report[] = [];
  const config = await load(options.config);
  try {
    const list = Object.keys(config.friends);
    await list.reduce((prev, friend) => {
      return prev.then(async() => {
        loader.text = `Loading ${friend}`;
        const repo = join(config.paths.repos.friends, config.friends[friend].slug);
        await pull(repo);
        const rows = (await history(repo)).filter(record => dayjs().diff(dayjs(record.timestamp * 1000), 'd') < options.days);
        const plan = join(repo, '.plan');
        for(var i = 0; i < rows.length; i++) {
          await checkout(repo, rows[i].sha);
          const planExists = await exists(plan)
          if(planExists) {
            const text = await Deno.readTextFile(plan)
            reports.push({friend, update: text, updatedAt: new Date(rows[i].timestamp * 1000)});
          }
        await checkoutReset(repo);
        }
        await checkout(repo, 'HEAD');
      })
    }, Promise.resolve())
  } catch(error) {
    console.error(error);
  } finally {
    loader.show = false;
    SETSILENT(false);
    if(reports.length) {
      let lineShown = config.lastcheck == undefined;
      reports
        .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
        .forEach((report) => {
          if(!lineShown && config.lastcheck) {
            if(report.updatedAt > config.lastcheck) {
              console.log(' ',colors.bgWhite.black('* Your last catchup! *'), '\n')
              lineShown = true;
            }
          }
          printReport(report);
        });
    } else {
      info('No posts from your friends, maybe you need more?')
    }
    config.lastcheck = new Date();
    await save(options.config, config);
  }
}
