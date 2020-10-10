#!/bin/bash
set -xe
mkdir -p dist
cd src
zip ../dist/$(date '+%Y%m%d_%H%M%S').zip *