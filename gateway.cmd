@echo off
rem OpenClaw Gateway (v2026.2.24)
set "TMPDIR=C:\Users\Asus\AppData\Local\Temp"
set "PATH=C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Windows\System32\OpenSSH\;C:\Program Files (x86)\NVIDIA Corporation\PhysX\Common;C:\Program Files\NVIDIA Corporation\NVIDIA NvDLISR;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\WINDOWS\System32\OpenSSH\;C:\Program Files\nodejs\;C:\Program Files\Git\cmd;C:\Program Files\Docker\Docker\resources\bin;C:\Program Files\cursor\resources\app\bin;C:\Program Files\MySQL\MySQL Shell 8.0\bin\;C:\Users\Asus\AppData\Local\Microsoft\WindowsApps;C:\Users\Asus\AppData\Local\Programs\Microsoft VS Code\bin;C:\Users\Asus\AppData\Roaming\npm;C:\Users\Asus\AppData\Local\Programs\Qoder\bin;C:\Program Files\MySQL\MySQL Server 8.0\bin"
set "OPENCLAW_GATEWAY_PORT=18789"
set "OPENCLAW_GATEWAY_TOKEN=2838694940e8ad90d4360235e9286410ba090f2b50b16481"
set "OPENCLAW_SYSTEMD_UNIT=openclaw-gateway.service"
set "OPENCLAW_SERVICE_MARKER=openclaw"
set "OPENCLAW_SERVICE_KIND=gateway"
set "OPENCLAW_SERVICE_VERSION=2026.2.24"
"C:\Program Files\nodejs\node.exe" C:\Users\Asus\AppData\Roaming\npm\node_modules\openclaw\dist\index.js gateway --port 18789
