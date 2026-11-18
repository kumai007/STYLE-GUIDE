param([string]$Tag, [string[]]$Items)
$nv = "C:\Users\ayush\AppData\Local\Programs\Python\Python312\Lib\site-packages\nvidia"
$env:PATH = "$nv\cublas\bin;$nv\cudnn\bin;$env:PATH"
$env:VAD = $env:VAD
$s = "C:\Users\ayush\AppData\Local\Temp\claude\C--Users-ayush-Videos-CLAUDE-PROJECT\9d9d6b4d-5356-4c2b-9571-2fb4113a855f\scratchpad"
& python "$s\tx.py" large-v3 "$s\tx_$Tag" @Items *> "$s\tx_$Tag.log"
"exit $LASTEXITCODE"
Get-Content "$s\tx_$Tag.log" | Select-String "words|Error" | Select-Object -Last 20
