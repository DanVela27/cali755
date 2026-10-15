$ErrorActionPreference = 'Stop'
$caliGit = Get-Command git -ErrorAction SilentlyContinue
if ($caliGit) { $caliGitPath = $caliGit.Source }
else { $caliGitPath = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe' }
if (!(Test-Path -LiteralPath $caliGitPath)) { throw 'Instala Git para Windows con Git Credential Manager.' }
Write-Host 'Conecta GitHub una sola vez. Completa el inicio de sesión en tu navegador.'
& $caliGitPath credential-manager github login --url https://github.com
if ($LASTEXITCODE -ne 0) { throw 'No se completó la conexión con GitHub.' }
Write-Host 'Conexión lista. Ya puedes usar Publicar avances en el editor local.'
