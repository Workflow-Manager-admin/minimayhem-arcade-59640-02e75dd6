#!/bin/bash
cd /home/kavia/workspace/code-generation/minimayhem-arcade-59640-02e75dd6/mini_mayhem_arcade
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

