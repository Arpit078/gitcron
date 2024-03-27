node app
@REM cd "D:\pet_projects\Arpit078.github.io\twitterBot" 
@REM node index
@REM this part is for the stories webapp
@REM cd "D:\pet_projects\short-stories\client"
@REM @echo off
@REM setlocal EnableDelayedExpansion

@REM REM Generate a random number between 0 and 92
@REM set /a "n=!random! %% 93"

@REM REM Create or overwrite the JavaScript file (no.js) with the generated constant
@REM (
@REM     echo const idx = !n!

@REM REM Git commands to commit the changes and push to the repository
git pull
git add *
git commit -m "commit from batch file"
git push

@REM echo "JavaScript file generated with const idx = !n! and changes pushed to the repository."


