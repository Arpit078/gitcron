node app
cd "D:\pet_projects\Arpit078.github.io\twitterBot" 
node index
@REM this part is for the stories webapp
cd "D:\pet_projects\short-stories\client"
@echo off
setlocal EnableDelayedExpansion

REM Generate a random number between 0 and 92
set /a "n=!random! %% 93"

REM Create or overwrite the JavaScript file (no.js) with the generated constant
(
    echo const idx = !n!
) > no.js

REM Git commands to commit the changes and push to the repository
git add *
git commit -m "Update no.js with random number !n!"
git push

echo "JavaScript file generated with const idx = !n! and changes pushed to the repository."


