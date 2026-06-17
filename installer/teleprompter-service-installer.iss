#define MyAppName "Teleprompter"
#define MyAppVersion "1.0.0"
#ifndef InstallerBaseFilename
#define InstallerBaseFilename "Teleprompter"
#endif

[Setup]
AppId={{D15E294A-947C-4A4E-937A-E675B8906A7F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
DefaultDirName={autopf}\Teleprompter
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
PrivilegesRequired=admin
OutputDir=output
OutputBaseFilename={#InstallerBaseFilename}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "build\app\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "install-teleprompter-service.ps1"; DestDir: "{app}\installer"; Flags: ignoreversion
Source: "uninstall-teleprompter-service.ps1"; DestDir: "{app}\installer"; Flags: ignoreversion

[Icons]
Name: "{autodesktop}\Teleprompter"; Filename: "http://localhost:14000"

[Run]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\install-teleprompter-service.ps1"""; StatusMsg: "Installing Teleprompter Windows service..."; Flags: waituntilterminated

[UninstallRun]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\uninstall-teleprompter-service.ps1"""; RunOnceId: "UninstallTeleprompterService"; StatusMsg: "Removing Teleprompter Windows service..."; Flags: waituntilterminated
