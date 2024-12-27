#!/bin/bash

test_dir="./test/integration"

"$test_dir"/http-db/run.sh

exit $?
