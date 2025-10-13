# Source: https://raw.githubusercontent.com/socsieng/socsieng.github.io/main/scripts/new-post.sh

#!/usr/bin/env bash
set -e

repo_folder=`git rev-parse --show-toplevel`

category=$1
title=$2
timestamp=`date "+%F %T %z"`
date_value=`date "+%F"`
file=`echo $title | awk '{print tolower($0)}' | sed -e 's/[^a-zA-Z0-9]/-/g'`
file_path="$repo_folder/_posts/$date_value-$file.md"

echo "---
layout: post
title: '$title'
date: $timestamp
categories: $category
tags: $category
---
" > $file_path

echo $file_path
