# Signs the normal Claude Code CLI in, without the Claude desktop app's private session variables
# (they hide the normal sign-in). Used by Final Phase Lite notes. Run: & .\login_clean.ps1
Get-ChildItem env: | Where-Object { $_.Name -match '^(CLAUDECODE$|CLAUDE_CODE_|CLAUDE_AGENT_SDK_|CLAUDE_PID$|CLAUDE_EFFORT$|CLAUDE_PREVIEW_|ANTHROPIC_BASE_URL$|USE_LOCAL_OAUTH$|USE_STAGING_OAUTH$)' } | ForEach-Object { Remove-Item "env:$($_.Name)" }
$exe = Join-Path $env:APPDATA 'npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe'
& $exe auth login
& $exe auth status
