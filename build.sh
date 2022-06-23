#!/bin/bash
set -xe
mkdir -p zip
cd dist
zip ../zip/$(date '+%Y%m%d_%H%M%S').zip *