import { colors } from "https://deno.land/x/cliffy/ansi/colors.ts";
const errorColor = colors.bold.red;
const warnColor = colors.bold.yellow;
export const infoColor = colors.bold.blue;
const debugColor = colors.bold.gray;

let SILENT = false;

export function error(...args: any) {
  if(!SILENT) console.log(errorColor(' !'), ...args);
}

export function warn(...args: any) {
  if(!SILENT) console.log(warnColor(' ^'), ...args);
}

export function info(...args: any) {
  if(!SILENT) console.log(infoColor(' *'), ...args);
}

export function debug(...args: any) {
  if(!SILENT) console.log(debugColor(' @'), ...args);
}

export const SETSILENT = (val: boolean) => SILENT = val;