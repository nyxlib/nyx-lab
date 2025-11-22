#!/bin/bash

npm run app-prod && rsync -avz --delete ./dist/ vps:/var/www/nyxlib.org/lab/ && tput bel
