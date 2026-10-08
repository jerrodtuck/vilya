param([Parameter(ValueFromRemainingArguments=$true)][string[]]$ControllerArgs)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$entryLocks=@()
# Sole live entrypoint. No Node process or env-file option is used before this
# descriptor-bound, key-only validation. Child stdin is a private anonymous pipe.
try {
  Add-Type -TypeDefinition @'
using System; using System.IO; using System.Text; using System.Runtime.InteropServices; using Microsoft.Win32.SafeHandles;
public static class ProbeCredential {
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
  # Keep the reviewed executable and entry bytes immutable until child exit.
  foreach($file in @($PSCommandPath,$controller,$node)) { $entryLocks+=([IO.File]::Open($file,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)) }
  $headIndex=[Array]::IndexOf($ControllerArgs,'--reviewed-head');if($headIndex-lt 0-or $headIndex+1-ge $ControllerArgs.Length-or $ControllerArgs[$headIndex+1]-notmatch '^[a-f0-9]{40}$'){throw 'Exact head required'}
  $head=$ControllerArgs[$headIndex+1]
  function HashFile([string]$file) { $stream=[IO.File]::OpenRead($file);try{$sha=[Security.Cryptography.SHA256]::Create();try{([BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}}finally{$stream.Dispose()} }
  function ChildEnvironment($info) { $info.EnvironmentVariables.Clear();$info.EnvironmentVariables['SystemRoot']='C:\Windows';$info.EnvironmentVariables['WINDIR']='C:\Windows';$info.EnvironmentVariables['PATH']='C:\Windows\System32;C:\Program Files\Git\cmd' }
  function GitRead([string[]]$items) { $info=New-Object Diagnostics.ProcessStartInfo;$info.FileName='C:\Program Files\Git\cmd\git.exe';$info.WorkingDirectory=$repo;$info.UseShellExecute=$false;$info.CreateNoWindow=$true;$info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true;ChildEnvironment $info;$info.EnvironmentVariables['GIT_CONFIG_NOSYSTEM']='1';$info.EnvironmentVariables['GIT_CONFIG_GLOBAL']='NUL';$info.Arguments=($items -join ' ');$p=[Diagnostics.Process]::Start($info);$result=$p.StandardOutput.ReadToEnd();$p.StandardError.ReadToEnd()|Out-Null;$p.WaitForExit();if($p.ExitCode){throw 'Reviewed files unavailable'};return $result.Trim() }
  if((GitRead @('rev-parse','HEAD'))-ne $head) { throw 'Stale reviewed head' }
  foreach($entry in @(@('scripts/evaluation/schema-probe-launcher.ps1',$PSCommandPath),@('scripts/evaluation/schema-probe-controller.mjs',$controller))) { $expected=GitRead @('rev-parse',($head+':'+$entry[0]));$actual=GitRead @('hash-object','--no-filters',('"'+$entry[1]+'"'));if($expected-ne $actual){throw 'Reviewed entry changed'} }
  $nonce=New-Object byte[] 32;$rng=[Security.Cryptography.RandomNumberGenerator]::Create();try{$rng.GetBytes($nonce)}finally{$rng.Dispose()}
  $proof=@{schemaVersion=1;nonce=([BitConverter]::ToString($nonce)).Replace('-','').ToLowerInvariant();parentPid=$PID;head=$head;args=$ControllerArgs;credentialBytes=$snapshot[1];credentialIdentity=$snapshot[2];bootstrap=@{path=$PSCommandPath;sha256=(HashFile $PSCommandPath)};controller=@{path=$controller;sha256=(HashFile $controller)};node=@{path=$node;sha256=(HashFile $node)}}
  function QuoteArgument([string]$value) { '"'+[regex]::Replace([regex]::Replace($value,'(\\*)"','$1$1\"'),'(\\+)$','$1$1')+'"' }
  $start=New-Object Diagnostics.ProcessStartInfo;$start.FileName=$node;$start.WorkingDirectory=$repo;$start.UseShellExecute=$false;$start.CreateNoWindow=$true;$start.RedirectStandardInput=$true;ChildEnvironment $start;$start.EnvironmentVariables['OPENAI_API_KEY']=$key
  $start.Arguments=((@($controller)+$ControllerArgs)|ForEach-Object {QuoteArgument $_})-join ' '
  $child=[Diagnostics.Process]::Start($start)
  $child.StandardInput.WriteLine(($proof|ConvertTo-Json -Depth 8 -Compress));$child.StandardInput.Close();$child.WaitForExit();exit $child.ExitCode
} catch { [Console]::Error.WriteLine('Schema probe bootstrap held; no child authorized');exit 1 } finally { foreach($entryLock in $entryLocks) { $entryLock.Dispose() } }
