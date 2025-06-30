@echo off
SET "PATH=%PATH%;C:\Program Files\nodejs"
SET SUBMISSION_PATH=%~1
SET TEST_FILE=%~2
SET OUTPUT_JSON=%~3
node "%~dp0\node_modules\jest\bin\jest.js" %TEST_FILE% --json --outputFile=%OUTPUT_JSON% --runInBand
