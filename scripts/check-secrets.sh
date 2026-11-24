#!/usr/bin/env bash
set -eu
pattern='(AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|sk-(proj-)?[A-Za-z0-9_-]{25,}|-----BEGIN ([A-Z0-9]+ )?PRIVATE KEY-----)'
found=0
while IFS= read -r commit; do
  if matches=$(git grep -I -l -E -e "$pattern" "$commit" -- . ':!scripts/check-secrets.sh'); then
    printf 'Potential credential pattern (file only): %s\n' "$matches"
    found=1
  else
    code=$?
    if [ "$code" -ne 1 ]; then exit "$code"; fi
  fi
done < <(git rev-list --all)
exit "$found"
