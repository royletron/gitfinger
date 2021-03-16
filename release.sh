#!/bin/bash

# Login to AWS Docker registry, build images and upload them to registry
# Usage: upload_containers.sh [image1 image2 ...]

set -o errexit  # Exit immediately if any command or pipeline of commands fails
set -o nounset  # Treat unset variables and parameters other than the special
                # parameters "@" and "*" as an  error  when  performing  parameter expansion
set -o pipefail # Exit when command before pipe fails
# set -o xtrace   # Debug mode expand everything and print it before execution

# set working directory to script directory
cd "$(dirname "$0")"

archs=(x86_64-unknown-linux-gnu x86_64-pc-windows-msvc x86_64-apple-darwin aarch64-apple-darwin)

DEFAULTVERSION="unknown"

version="${1:-$DEFAULTVERSION}"

rm -rf pkg
mkdir pkg

for arch in "${archs[@]}" ; do
  echo "Compiling for ${arch}..."
  deno compile --target ${arch} --lite --unstable --allow-read --allow-write --allow-env --allow-run main.ts
  zip pkg/gitfinger-${version}-${arch}.zip $([ "$arch" == "x86_64-pc-windows-msvc" ] && echo "gitfinger.exe" || echo "gitfinger")
done