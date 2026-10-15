$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) { $caliNode = $nodeCommand.Source }
else { $caliNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
if (!(Test-Path -LiteralPath $caliNode)) { throw 'Instala Node.js 22.18 o superior.' }
if (!(Test-Path -LiteralPath 'node_modules/vite/bin/vite.js')) { throw 'Primero ejecuta pnpm install --frozen-lockfile --ignore-scripts en esta carpeta.' }
Write-Host 'Editor local: http://127.0.0.1:5173/ . Mantén esta ventana abierta.'
$env:NODE_USE_SYSTEM_CA='1'
& $caliNode 'node_modules/vite/bin/vite.js' '--host' '127.0.0.1'

