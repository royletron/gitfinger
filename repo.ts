import {basename} from "https://deno.land/std/path/mod.ts";

export default function parseRemoteUri(inputUri: string) {
  // ignore any trailing modifiers, such as the ones supported
  // on npm uris (ex: git+ssh://git@github.com:npm/npm.git#v1.0.27)
  var uri = inputUri.replace(/#.+$/, '');

  var matches = null;

  // check if its an url with the following known format:
  // http://site.com/owner/project(.git)
  // any protocols are accepted, to support complex protocols
  // (ex. git+https://isaacs@github.com/npm/npm.git)
  var generalFormat = /^([^:]+):\/\/([^@]+@)?([^\/:]+)\/([^\/]+)\/([^\/]+)$/;

  matches = generalFormat.exec(uri)

  if (matches) {
    var owner = matches[4],
      project = matches[5].replace(/\.git$/, '');

    return {
      remote: inputUri,
      protocol: matches[1],
      host: matches[3],
      repository: owner+'/'+project,
      owner: owner,
      project: project
    };
  }

  // check if its an url with the following known format:
  // (ssh://)git@site.com:owner/project(.git)
  var gitKnownRemote = /^(([^:]+):\/\/)?git@([^:]+):([^\/]+)\/([^\/]+)$/;

  if (matches = gitKnownRemote.exec(uri)) {
    var owner = matches[4],
      project = matches[5].replace(/\.git$/, '');

    return {
      remote: inputUri,
      protocol: matches[2] || 'ssh',
      host: matches[3],
      repository: owner+'/'+project,
      owner: owner,
      project: project
    };
  }

  // check if its an uri with any protocol, host and path.
  // ex: ssh://user@other.host.com/~/repos/R.git
  var looseUriFormat = /^([^:]+):\/\/([^@]+@)?([^\/:]+)\/(.+)$/;
  matches = looseUriFormat.exec(uri)
  if (matches) {
    var repoPath = matches[4],
      project = basename(repoPath).replace(/\.git$/, '');

    return {
      remote: inputUri,
      protocol: matches[1],
      host: matches[3],
      repository: project,
      owner: null,
      project: project
    };
  }

  // the remote is a local path or an unknown url, just
  // return its repository name without the owner's info

  var dirName = basename(uri),
    repoName = dirName.replace(/\.git$/, '');

  return {
    remote: inputUri,
    protocol: 'file',
    host: 'localhost',
    owner: null,
    repository: repoName,
    project: repoName
  };
}