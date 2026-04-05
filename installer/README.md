# Installer

Main files:

- `build-inno-installer.ps1`
- `teleprompter-service-installer.iss`
- `install-teleprompter-service.ps1`
- `uninstall-teleprompter-service.ps1`

Build the installer EXE with:

```powershell
cd C:\path\to\teleprompter\installer
.\build-inno-installer.ps1
```

The generated EXE is written to `installer\output`.
