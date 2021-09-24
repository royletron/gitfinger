# gitfinger

> Do dooooo do.

A modern interpretation of the finger protocol.

## Masters of Doom

After reading about the use of `.plan` files by John Cormack and John Romero during the Doom days I thought it was time someone tried to bring it back. I also wanted to do something with Deno. So here it is, `GitFinger`.

## How it Works - the `Protocol`

You create a repository where ever works for you. Let's say `https://github.com/royletron/.plan` and it contains a single file `.plan`. This becomes your one file status update/blog to the world. You update it daily, hourly, whatever works for you, and push it to your repo. Your friends then track your repo checking in as often as they want to get a stream of updates from you. All they need is pull access to the repo.

## How it Works - the `CLI`

The `GitFinger` application is this repo makes life easier, it'll keep everything neatly managed, it'll allow you to `update` your own `.plan` (which it tracks in `~/.plan` to match the original finger protocol) using your editor of choice. It'll allow you to manage your friends list, and will go off and pull all updates when you want to `catchup`.

## Getting Started

1. Create your repository. It can be empty, you just need to be able to pull/push it from your machine.
2. Install `GitFinger` using `deno install -n gitfinger --unstable --allow-read --allow-write --allow-env --allow-run https://deno.land/x/gitfinger@0.1.0/main.ts`
3. Init your setup `gitfinger init`
4. Give it *your* repo made in step 1. e.g. `git@github.com:royletron/.plan.git`
5. Write your first update `gitfinger update` should open vim.
6. Explain what you're upto. Gitfinger supports markdown so go to town. Save and quit `esc > :wq`
7. Add a *friend* `gitfinger friends add git@github.com:royletron/.plan.git`
8. Time to *catchup* `gitfinger catchup`

## Config

After `gitfinger init` you should see your config store in `~/.finger/config.yaml` where you can customise locations of things, and your editor of choice (defaults to vim).

## So much more to follow
