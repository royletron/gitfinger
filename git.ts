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