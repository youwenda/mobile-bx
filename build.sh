#!/bin/bash

echo "begin packaging"
cd release_tools
npm install
echo "let's rock!"
grunt
echo "end packaging"