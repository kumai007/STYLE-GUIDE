@echo off
rem Start ref-annotator (opens the browser). If it is already running, just opens the page.
python "%~dp0serve.py" %*
