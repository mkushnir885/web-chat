#!/bin/bash

for folder in ./*; do
  ./"$folder"/test.sh
done
