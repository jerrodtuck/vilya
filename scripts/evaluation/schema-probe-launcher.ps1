param([Parameter(ValueFromRemainingArguments=$true)][string[]]$ControllerArgs)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$entryLocks=@()
$child=$null
# Sole live entrypoint. No Node process or env-file option is used before this
# descriptor-bound, key-only validation. Child stdin is a private anonymous pipe.
try {
  Add-Type -TypeDefinition @'
using System; using System.IO; using System.Text; using System.Runtime.InteropServices; using Microsoft.Win32.SafeHandles;
public static class ProbeCredential {
 [DllImport("shell32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr CommandLineToArgvW(string command,out int count);
 [DllImport("kernel32.dll")] static extern IntPtr LocalFree(IntPtr p);
 [DllImport("kernel32.dll")] static extern IntPtr GetStdHandle(int n);
 [DllImport("kernel32.dll")] static extern uint GetFileType(IntPtr h);
 [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr OpenProcess(uint access,bool inherit,uint pid);
 [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();
 [DllImport("kernel32.dll",SetLastError=true)] static extern bool DuplicateHandle(IntPtr source,IntPtr handle,IntPtr target,out IntPtr copy,uint access,bool inherit,uint options);
 [DllImport("kernelbase.dll",SetLastError=true)] static extern bool CompareObjectHandles(IntPtr a,IntPtr b);
 [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr h);
 public static string[] Arguments(string command) { int n;var p=CommandLineToArgvW(command,out n);if(p==IntPtr.Zero)throw new IOException("Argument metadata");try{var a=new string[n];for(int i=0;i<n;i++)a[i]=Marshal.PtrToStringUni(Marshal.ReadIntPtr(p,i*IntPtr.Size));return a;}finally{LocalFree(p);} }
 public static IntPtr Input() { return GetStdHandle(-10); }
 public static bool BoundInput(uint parent,string ownerHandle) { var process=OpenProcess(0x40,false,parent);if(process==IntPtr.Zero)throw new IOException("Pipe owner unavailable");IntPtr copy=IntPtr.Zero;try{long value;if(!Int64.TryParse(ownerHandle,out value)||value<=0||!DuplicateHandle(process,new IntPtr(value),GetCurrentProcess(),out copy,0,false,2)||GetFileType(copy)!=3||GetFileType(Input())!=3||!CompareObjectHandles(copy,Input()))throw new IOException("Private inherited handle mismatch");return true;}finally{if(copy!=IntPtr.Zero)CloseHandle(copy);CloseHandle(process);} }
 [StructLayout(LayoutKind.Sequential)] public struct Security { public int Length; public IntPtr Descriptor; public int Inherit; }
 [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] public struct Startup { public int Size;public string Reserved,Desktop,Title;public uint X,Y,XSize,YSize,XChars,YChars,Fill,Flags;public short Show,ReservedSize;public IntPtr ReservedBytes,Input,Output,Error; }
 [StructLayout(LayoutKind.Sequential)] public struct ProcessInfo { public IntPtr Process,Thread;public uint Pid,Tid; }
 [DllImport("kernel32.dll",SetLastError=true)] static extern bool CreatePipe(out IntPtr read,out IntPtr write,ref Security security,uint size);
 [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetHandleInformation(IntPtr handle,uint mask,uint flags);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool CreateProcessW(string exe,StringBuilder command,IntPtr ps,IntPtr ts,bool inherit,uint flags,IntPtr env,string cwd,ref Startup startup,out ProcessInfo process);
 [DllImport("kernel32.dll")] static extern uint WaitForSingleObject(IntPtr h,uint milliseconds);
 [DllImport("kernel32.dll")] static extern bool GetExitCodeProcess(IntPtr h,out uint status);
 [DllImport("kernel32.dll")] static extern bool TerminateProcess(IntPtr h,uint status);
 public sealed class Child : IDisposable { internal IntPtr Process,Read,Write; public uint Pid;public string OwnerHandle { get { return Read.ToInt64().ToString(); } }public bool HasExited { get { uint code;if(!GetExitCodeProcess(Process,out code))throw new IOException("Child status");return code!=259;} }
 public void Send(string proof) { byte[] bytes=new UTF8Encoding(false,true).GetBytes(proof+"\n");var task=System.Threading.Tasks.Task.Run(()=>{using(var stream=new FileStream(new SafeFileHandle(Write,false),FileAccess.Write)){stream.Write(bytes,0,bytes.Length);stream.Flush();}});if(!task.Wait(15000)){Kill();CloseHandle(Read);Read=IntPtr.Zero;throw new IOException("Private proof delivery timeout");} }
 public int Wait() { if(WaitForSingleObject(Process,0xffffffff)!=0)throw new IOException("Child wait");uint code;if(!GetExitCodeProcess(Process,out code))throw new IOException("Child exit");return (int)code;}public void Kill(){TerminateProcess(Process,1);}public void Dispose(){if(Read!=IntPtr.Zero)CloseHandle(Read);if(Write!=IntPtr.Zero)CloseHandle(Write);if(Process!=IntPtr.Zero)CloseHandle(Process);Read=Write=Process=IntPtr.Zero;} }
 public static Child Start(string exe,string command,string cwd,string key) { IntPtr read=IntPtr.Zero,write=IntPtr.Zero,env=IntPtr.Zero;var security=new Security{Length=Marshal.SizeOf(typeof(Security)),Inherit=1};ProcessInfo process=new ProcessInfo();try{if(!CreatePipe(out read,out write,ref security,0)||!SetHandleInformation(write,1,0))throw new IOException("Private pipe creation");var startup=new Startup{Size=Marshal.SizeOf(typeof(Startup)),Flags=0x100,Input=read,Output=GetStdHandle(-11),Error=GetStdHandle(-12)};env=Marshal.StringToHGlobalUni("OPENAI_API_KEY="+key+"\0PATH=C:\\Windows\\System32;C:\\Program Files\\Git\\cmd\0SystemRoot=C:\\Windows\0WINDIR=C:\\Windows\0\0");if(!CreateProcessW(exe,new StringBuilder(command),IntPtr.Zero,IntPtr.Zero,true,0x08000400,env,cwd,ref startup,out process))throw new IOException("Reviewed child creation");CloseHandle(process.Thread);return new Child{Process=process.Process,Read=read,Write=write,Pid=process.Pid};}catch{if(read!=IntPtr.Zero)CloseHandle(read);if(write!=IntPtr.Zero)CloseHandle(write);throw;}finally{if(env!=IntPtr.Zero)Marshal.FreeHGlobal(env);} }
 [StructLayout(LayoutKind.Sequential)] public struct Info { public uint Attributes; public System.Runtime.InteropServices.ComTypes.FILETIME Creation,Access,Write; public uint Volume,SizeHigh,SizeLow,Links,IndexHigh,IndexLow; }
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern SafeFileHandle CreateFile(string p,uint a,uint s,IntPtr security,uint disposition,uint flags,IntPtr template);
 [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetFileInformationByHandle(SafeFileHandle h,out Info i);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern uint GetFinalPathNameByHandle(SafeFileHandle h,StringBuilder b,uint n,uint flags);
 static string Identity(SafeFileHandle h,string expected,bool directory) { Info i;if(!GetFileInformationByHandle(h,out i)||(i.Attributes&0x400)!=0||((i.Attributes&0x10)!=0)!=directory||!directory&&(i.Links!=1||i.SizeHigh!=0||i.SizeLow==0||i.SizeLow>65536))throw new IOException("Credential type or identity");var b=new StringBuilder(32768);uint n=GetFinalPathNameByHandle(h,b,32768,0);if(n==0||n>=32768||!String.Equals(b.ToString().Replace(@"\\?\", ""),Path.GetFullPath(expected),StringComparison.OrdinalIgnoreCase))throw new IOException("Credential redirected");return i.Volume+":"+i.IndexHigh+":"+i.IndexLow+":"+i.SizeHigh+":"+i.SizeLow+":"+i.Write.dwHighDateTime+":"+i.Write.dwLowDateTime+":"+i.Attributes; }
 static string Vector(string path) { var result=new StringBuilder();string p=Path.GetFullPath(path);while(p!=null){bool dir=!String.Equals(p,path,StringComparison.OrdinalIgnoreCase);using(var h=CreateFile(p,0x80,7,IntPtr.Zero,3,0x00200000|(dir?0x02000000u:0u),IntPtr.Zero)){if(h.IsInvalid)throw new IOException("Credential metadata unavailable");string id=Identity(h,p,dir);if(dir){var fields=id.Split(':');id=fields[0]+":"+fields[1]+":"+fields[2]+":"+fields[7];}result.Append(p.ToLowerInvariant()).Append('=').Append(id).Append(';');}p=Path.GetDirectoryName(p);}return result.ToString(); }
 public static string[] Read(string path) { string before=Vector(path),id;byte[] bytes;using(var h=CreateFile(path,0x80000000,1,IntPtr.Zero,3,0x00200000,IntPtr.Zero)){if(h.IsInvalid)throw new IOException("Credential open failed");id=Identity(h,path,false);using(var stream=new FileStream(h,FileAccess.Read)){long size=stream.Length;if(size<1||size>65536)throw new IOException("Credential bound");bytes=new byte[size];int at=0,n;while(at<bytes.Length&&(n=stream.Read(bytes,at,bytes.Length-at))>0)at+=n;if(at!=bytes.Length||stream.ReadByte()!=-1||id!=Identity(h,path,false))throw new IOException("Credential changed");}}if(before!=Vector(path))throw new IOException("Credential path changed");return new[]{new UTF8Encoding(false,true).GetString(bytes),Convert.ToBase64String(bytes),before}; }
}
'@
  $fixedEnv='C:\Users\repo\vilya\.env.local'
  $snapshot=[ProbeCredential]::Read($fixedEnv)
  if($snapshot[0].IndexOf([char]0) -ge 0 -or $snapshot[0][0] -eq [char]0xfeff) { throw 'Unsupported credential encoding' }
  $key=$null
  foreach($line in ($snapshot[0] -split "`r?`n")) {
    if([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#')) { continue }
    if($null -ne $key -or $line -notmatch '^OPENAI_API_KEY=(.*)$') { throw 'Only one key assignment allowed' }
    $value=$Matches[1]
    if($value.StartsWith('"') -or $value.StartsWith("'")) { $q=$value.Substring(0,1);if($value.Length-lt 2-or !$value.EndsWith($q)-or $value.Substring(1,$value.Length-2).Contains($q)){throw 'Quoting denied'};$value=$value.Substring(1,$value.Length-2) }
    if(!$value -or $value -match '[\s"''#$`\\\x00]') { throw 'Unsupported key value' };$key=$value
  }
  if($null -eq $key) { throw 'Key required' }
  if(!$ControllerArgs -or $ControllerArgs[0] -notin @('--initialize','--run') -or @($ControllerArgs|Where-Object {$_ -like '--env-file*'}).Count) { throw 'Bootstrap action required' }
  $repo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
  $controller=Join-Path $PSScriptRoot 'schema-probe-controller.mjs'
  $node='C:\Program Files\nodejs\node.exe'
  $own=[ProbeCredential]::Arguments([Environment]::CommandLine)
  $expected=@('C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe','-NoProfile','-NonInteractive','-File',$PSCommandPath)+$ControllerArgs
  if($own.Length-ne $expected.Length) { throw 'Exact bootstrap entry required' }
  for($i=0;$i-lt $own.Length;$i++) { if(![string]::Equals($own[$i],$expected[$i],[StringComparison]::OrdinalIgnoreCase)) { throw 'Exact bootstrap arguments required' } }
  # Keep the reviewed executable and entry bytes immutable until child exit.
  foreach($file in @($PSCommandPath,$controller,$node)) { $entryLocks+=([IO.File]::Open($file,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)) }
  $headIndex=[Array]::IndexOf($ControllerArgs,'--reviewed-head');if($headIndex-lt 0-or $headIndex+1-ge $ControllerArgs.Length-or $ControllerArgs[$headIndex+1]-notmatch '^[a-f0-9]{40}$'){throw 'Exact head required'}
  $head=$ControllerArgs[$headIndex+1]
  function HashFile([string]$file) { $stream=[IO.File]::OpenRead($file);try{$sha=[Security.Cryptography.SHA256]::Create();try{([BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}}finally{$stream.Dispose()} }
  function ChildEnvironment($info) { $info.EnvironmentVariables.Clear();$info.EnvironmentVariables['SystemRoot']='C:\Windows';$info.EnvironmentVariables['WINDIR']='C:\Windows';$info.EnvironmentVariables['PATH']='C:\Windows\System32;C:\Program Files\Git\cmd' }
  function GitRead([string[]]$items) { $info=New-Object Diagnostics.ProcessStartInfo;$info.FileName='C:\Program Files\Git\cmd\git.exe';$info.WorkingDirectory=$repo;$info.UseShellExecute=$false;$info.CreateNoWindow=$true;$info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true;ChildEnvironment $info;$info.EnvironmentVariables['GIT_CONFIG_NOSYSTEM']='1';$info.EnvironmentVariables['GIT_CONFIG_GLOBAL']='NUL';$info.Arguments=($items -join ' ');$p=[Diagnostics.Process]::Start($info);$result=$p.StandardOutput.ReadToEnd();$p.StandardError.ReadToEnd()|Out-Null;$p.WaitForExit();if($p.ExitCode){throw 'Reviewed files unavailable'};return $result.Trim() }
  if((GitRead @('rev-parse','HEAD'))-ne $head) { throw 'Stale reviewed head' }
  function ReviewedBlob([string]$relative,[string]$file) { $expectedBlob=GitRead @('rev-parse',($head+':'+$relative));$actualBlob=GitRead @('hash-object','--no-filters',('"'+$file+'"'));if($expectedBlob-ne $actualBlob){throw 'Reviewed entry changed'};return $expectedBlob }
  ReviewedBlob 'scripts/evaluation/schema-probe-launcher.ps1' $PSCommandPath | Out-Null
  $pending=New-Object 'Collections.Generic.Queue[string]';$pending.Enqueue($controller);$modules=@{}
  # This intentionally accepts only the reviewed literal ESM syntax. All other
  # import forms, package imports, escaped specifiers and dynamic imports stop.
  $staticPattern='(?m)(?:^|(?<=;))[ \t]*import[ \t]+(?:(?:[A-Za-z_$][\w$]*[ \t]*,?[ \t]*)?(?:\{[A-Za-z0-9_$, \t]*\}|\*[ \t]+as[ \t]+[A-Za-z_$][\w$]*)?[ \t]+from[ \t]+)?(?<q>["''])(?<specifier>[^"''\r\n\\]+)\k<q>[ \t]*;'
  $exportPattern='(?m)(?:^|(?<=;))[ \t]*export[ \t]+(?:\*|\{[A-Za-z0-9_$, \t]*\})[ \t]+from[ \t]+(?<q>["''])(?<specifier>[^"''\r\n\\]+)\k<q>[ \t]*;'
  while($pending.Count) {
    $file=$pending.Dequeue();$relative=$file.Substring($repo.TrimEnd('\').Length+1).Replace('\','/')
    if($modules.ContainsKey($relative)){continue};if($modules.Count-ge 32-or $relative-notmatch '^scripts/evaluation/(?:[a-z0-9-]+\.mjs|verified-api-rates-2026-10-06\.json)$'){throw 'Unsupported module path'}
    $entryLocks+=([IO.File]::Open($file,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read));$moduleSnapshot=[ProbeCredential]::Read($file);$blob=ReviewedBlob $relative $file
    $modules[$relative]=@{path=$relative;sha256=(HashFile $file);gitBlob=$blob;identity=$moduleSnapshot[2]}
    if($relative-eq 'scripts/evaluation/money.mjs'){$pending.Enqueue((Join-Path $PSScriptRoot 'verified-api-rates-2026-10-06.json'))};if($relative.EndsWith('.json')){continue}
    $text=$moduleSnapshot[0];$matches=@([regex]::Matches($text,$staticPattern))+@([regex]::Matches($text,$exportPattern));$remaining=[regex]::Replace([regex]::Replace($text,$staticPattern,''),$exportPattern,'');$remaining=[regex]::Replace($remaining,'\bimport\.meta\b','')
    if($remaining-match '\bimport\b|\bexport\s+(?:\*|\{)[^;]*\bfrom\b'){throw 'Dynamic or unsupported import'}
    foreach($match in $matches) { $specifier=$match.Groups['specifier'].Value;if($specifier-match '^node:[a-z_]+(?:/[a-z_]+)*$'){continue};if($specifier-notmatch '^\./[a-z0-9-]+\.mjs$'){throw 'Nonliteral or external import'};$pending.Enqueue([IO.Path]::GetFullPath((Join-Path ([IO.Path]::GetDirectoryName($file)) $specifier))) }
  }
  $manifest=@($modules.Keys|Sort-Object -CaseSensitive|ForEach-Object {$modules[$_]});$manifestText=($manifest|ForEach-Object {$_.path+"`t"+$_.gitBlob+"`t"+$_.sha256+"`t"+$_.identity+"`n"})-join ''
  $sha=[Security.Cryptography.SHA256]::Create();try{$manifestDigest=([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($manifestText)))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}
  $nonce=New-Object byte[] 32;$rng=[Security.Cryptography.RandomNumberGenerator]::Create();try{$rng.GetBytes($nonce)}finally{$rng.Dispose()}
  $proof=@{schemaVersion=2;nonce=([BitConverter]::ToString($nonce)).Replace('-','').ToLowerInvariant();parentPid=$PID;head=$head;args=$ControllerArgs;manifest=$manifest;manifestDigest=$manifestDigest;nativeTemp=[IO.Path]::Combine([Environment]::GetFolderPath('LocalApplicationData'),'Temp');credentialBytes=$snapshot[1];credentialIdentity=$snapshot[2];bootstrap=@{path=$PSCommandPath;sha256=(HashFile $PSCommandPath)};controller=@{path=$controller;sha256=(HashFile $controller)};node=@{path=$node;sha256=(HashFile $node)}}
  function QuoteArgument([string]$value) { '"'+[regex]::Replace([regex]::Replace($value,'(\\*)"','$1$1\"'),'(\\+)$','$1$1')+'"' }
  $command=((@($node,$controller)+$ControllerArgs)|ForEach-Object {QuoteArgument $_})-join ' '
  $child=[ProbeCredential]::Start($node,$command,$repo,$key)
  $proof['pipeOwnerHandle']=$child.OwnerHandle
  $child.Send(($proof|ConvertTo-Json -Depth 8 -Compress));exit $child.Wait()
} catch { if($null-ne $child-and !$child.HasExited){$child.Kill()};[Console]::Error.WriteLine('Schema probe bootstrap held; no child authorized');exit 1 } finally { if($null-ne $child){$child.Dispose()};foreach($entryLock in $entryLocks) { $entryLock.Dispose() } }
