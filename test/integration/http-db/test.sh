#!/bin/bash

for testfile in ./test/*.test.js; do
  docker compose run --rm npm run jest "$testfile"
done
