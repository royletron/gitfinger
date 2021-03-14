import { colors } from "https://deno.land/x/cliffy/ansi/colors.ts";
const errorColor = colors.bold.red;
const warnColor = colors.bold.yellow;
const infoColor = colors.bold.blue;
const debugColor = colors.bold.gray;

export function error(...args: any) {
  console.log(errorColor(' !'), ...args);
}

export function warn(...args: any) {
  console.log(warnColor(' ^'), ...args);
}

export function info(...args: any) {
  console.log(infoColor(' *'), ...args);
}

export function debug(...args: any) {
  console.log(debugColor(' @'), ...args);
}