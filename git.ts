import FingerError, {FingerErrorCode} from "./FingerError.ts";
import {Confirm} from "https://deno.land/x/cliffy/prompt/confirm.ts";
import {info, warn} from "./logger.ts";
import {run} from "./utils.ts"

export async function getOrigin(path: string) {
  const {out, error, code} = await run(["git", "remote", "get-url", "origin"], path)
  if(code !== 0) {
    console.error(error);
    throw new FingerError(FingerErrorCode.RepoUnableToFindOrigin)
  }
  return out;
}

type HistoryRow = {
  sha: string,
  timestamp: number
}

export async function history(path: string): Promise<HistoryRow[]> {
  info(`Getting history: ${path}`)
  const {out, error, code} = await run(["git", "--no-pager", "log", "--pretty=format:'%H %at'"], path);

  if(code == 0) {
    const lines = out.split('\n');
    return lines.map((line) => ({sha: line.split(' ')[0].replace('\'', ''), timestamp: parseInt(line.split(' ')[1])}))
  }
  return [];
}

export async function timestamp(path: string): Promise<number> {
  info(`Getting timestamp: ${path}`)
  const {out, error, code} = await run(['git', '--no-pager', 'log', '-1', '--format="%at"'], path)

  if(code == 0) {
    return parseInt(out.replaceAll("\"", ""));
  }
  return 0;
}

export async function checkout(path: string, commit: string): Promise<any> {
  info(`Checking out ${commit} in ${path}`);
  const {out, error, code} = await run(['git', 'checkout', commit], path);
}

export async function checkoutReset(path: string): Promise<any> {
  info(`Switching ${path}`);
  const {out, error, code} = await run(['git', 'switch', '-'], path)
}

export async function pull(path: string): Promise<any> {
  info(`Pulling repo: ${path}`)
  const {out, error, code} = await run(["git", "pull"], path);
}

export async function push(path: string): Promise<any> {
  info(`Pushing repo: ${path}`)
  const {out, error, code} = await run(["git", "push"], path);
}

export async function add(path: string, file: string = ".plan"): Promise<any> {
  info(`Adding file ${file} in ${path}`)
  const {code} = await run(["git", "add", file], path);
}

export async function commit(path: string, message: string): Promise<any> {
  info(`Committing ${path}: ${message}`)
  const {code} = await run(["git", "commit", "-m", `"${message}"`], path)
}

export async function status(path: string): Promise<boolean> {
  info(`Getting status for: ${path}`)
  const {out, error, code} = await run(['git', 'status'], path);
  if(code !== 0) {
    throw new FingerError(FingerErrorCode.RepoUnableToGetStatus)
  }
  return out.includes('modified:   .plan');
}

export async function clone(repo: string, path: string): Promise<any> {
  const {out, error, code} = await run(["git", "clone", repo, path])
  if(code !== 0) {
    if(error.includes('already exists and is not an empty directory.')) {
      warn(`Found existing repo in ${path}`)
      const getOriginOutput = await getOrigin(path);
      if(getOriginOutput.trim() !== repo.trim()) {
        const confirmed: boolean = await Confirm.prompt(`Overwrite ${path} (${getOriginOutput.trim()})?`);
        if(!confirmed) {
          throw new FingerError(FingerErrorCode.OperationCancelled);
        } else {
          await Deno.remove(path, { recursive: true })
          return clone(repo, path);
        }
      } else {
        info(`Origin matches ${repo}`)
      }
    }
    // error
  } else {
    info(`Cloned repo to ${path}`)
  }
}
