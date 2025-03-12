const express = require('express');
const cors = require('cors');
const { PowerShell } = require('node-powershell');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Launch PowerShell endpoint
app.post('/api/launch-powershell', (req, res) => {
  exec('start powershell', (error) => {
    if (error) {
      console.error('Error launching PowerShell:', error);
      res.status(500).json({ error: 'Failed to launch PowerShell' });
      return;
    }
    res.json({ message: 'PowerShell launched successfully' });
  });
});

// PowerShell commands database (simplified version)
// In a production app, this would be stored in a proper database
const powershellCommands = [
  // Basic PowerShell Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Command',
    description: 'Gets all commands that are installed on the computer.',
    usage: 'Get-Command [-Name] <string[]> [-Module <string[]>] [-CommandType <CommandTypes>]',
    examples: 'Get-Command -Name *process* -CommandType Cmdlet'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Find-Module',
    description: 'Finds modules in a repository that match specified criteria.',
    usage: 'Find-Module [-Name] <string[]> [-Repository <string[]>]',
    examples: 'Find-Module -Name Az* -Repository PSGallery'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Install-Module',
    description: 'Downloads one or more modules from a repository, and installs them on the local computer.',
    usage: 'Install-Module [-Name] <string[]> [-Repository <string[]>] [-Scope <string>]',
    examples: 'Install-Module -Name AzureAD -Scope CurrentUser'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Help',
    description: 'Displays information about PowerShell commands and concepts.',
    usage: 'Get-Help [[-Name] <string>] [-Category <string[]>] [-Full]',
    examples: 'Get-Help Get-Process -Full'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Process',
    description: 'Gets the processes that are running on the local computer.',
    usage: 'Get-Process [[-Name] <string[]>] [-ComputerName <string[]>]',
    examples: 'Get-Process -Name chrome'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Service',
    description: 'Gets the services on the computer.',
    usage: 'Get-Service [[-Name] <string[]>] [-ComputerName <string[]>]',
    examples: 'Get-Service -Name *net*'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Start-Process',
    description: 'Starts one or more processes on the local computer.',
    usage: 'Start-Process [-FilePath] <string> [[-ArgumentList] <string[]>]',
    examples: 'Start-Process -FilePath "notepad.exe"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Stop-Process',
    description: 'Stops one or more running processes.',
    usage: 'Stop-Process [-Id] <int[]> [-Force] [-Confirm]',
    examples: 'Stop-Process -Name "notepad" -Confirm'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-Item',
    description: 'Creates a new item in the file system or other namespaces.',
    usage: 'New-Item [-Path] <string[]> [-ItemType <string>] [-Value <Object>]',
    examples: 'New-Item -Path "C:\temp\NewFolder" -ItemType Directory'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-Item',
    description: 'Deletes the specified items.',
    usage: 'Remove-Item [-Path] <string[]> [-Recurse] [-Force]',
    examples: 'Remove-Item -Path "C:\temp\file.txt" -Force'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-Location',
    description: 'Sets the current working location to a specified location.',
    usage: 'Set-Location [-Path] <string>',
    examples: 'Set-Location -Path "C:\Windows"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Content',
    description: 'Gets the content of the item at the specified location.',
    usage: 'Get-Content [-Path] <string[]> [-TotalCount <long>]',
    examples: 'Get-Content -Path "C:\temp\file.txt" -TotalCount 5'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-Content',
    description: 'Writes or replaces the content in an item with new content.',
    usage: 'Set-Content [-Path] <string[]> [-Value] <Object[]>',
    examples: 'Set-Content -Path "C:\temp\file.txt" -Value "New content"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Copy-Item',
    description: 'Copies an item from one location to another.',
    usage: 'Copy-Item [-Path] <string[]> [-Destination] <string> [-Recurse]',
    examples: 'Copy-Item -Path "C:\temp\file.txt" -Destination "C:\temp2"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Move-Item',
    description: 'Moves an item from one location to another.',
    usage: 'Move-Item [-Path] <string[]> [-Destination] <string>',
    examples: 'Move-Item -Path "C:\temp\file.txt" -Destination "C:\temp2"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Invoke-Command',
    description: 'Runs commands on local and remote computers.',
    usage: 'Invoke-Command [-ScriptBlock] <scriptblock> [-ComputerName <string[]>]',
    examples: 'Invoke-Command -ComputerName Server01 -ScriptBlock { Get-Process }'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Where-Object',
    description: 'Selects objects from a collection based on their property values.',
    usage: 'Where-Object [-FilterScript] <scriptblock>',
    examples: 'Get-Service | Where-Object { $_.Status -eq "Running" }'
  },
  
  // Microsoft 365 Exchange Online Mailbox Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Mailbox',
    description: 'Returns a list of mailboxes or the properties of a specific mailbox in Exchange Online.',
    usage: 'Get-Mailbox [[-Identity] <MailboxIdParameter>] [-ResultSize <Unlimited>]',
    examples: 'Get-Mailbox -Identity "john.doe@contoso.com"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-Mailbox',
    description: 'Modifies the settings of an existing mailbox in Exchange Online.',
    usage: 'Set-Mailbox [-Identity] <MailboxIdParameter> [-EmailAddresses <ProxyAddressCollection>] [-DisplayName <String>]',
    examples: 'Set-Mailbox -Identity "john.doe@contoso.com" -DisplayName "John Doe - Sales"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-Mailbox',
    description: 'Creates a new mailbox for a new or existing user in Exchange Online.',
    usage: 'New-Mailbox -Name <String> -Password <SecureString> [-DisplayName <String>] [-MicrosoftOnlineServicesID <WindowsLiveId>]',
    examples: 'New-Mailbox -Name "Jane Smith" -DisplayName "Jane Smith" -MicrosoftOnlineServicesID "jane.smith@contoso.com" -Password (ConvertTo-SecureString -String "P@ssw0rd" -AsPlainText -Force)'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-Mailbox',
    description: 'Removes a mailbox from Exchange Online.',
    usage: 'Remove-Mailbox [-Identity] <MailboxIdParameter> [-Permanent <Boolean>]',
    examples: 'Remove-Mailbox -Identity "john.doe@contoso.com" -Permanent $true'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-MailboxStatistics',
    description: 'Returns information about a mailbox, such as size, item count, and last logon time.',
    usage: 'Get-MailboxStatistics [[-Identity] <MailboxIdParameter>]',
    examples: 'Get-MailboxStatistics -Identity "john.doe@contoso.com"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-MailboxPermission',
    description: 'Returns permissions for a mailbox in Exchange Online.',
    usage: 'Get-MailboxPermission [[-Identity] <MailboxIdParameter>] [-User <SecurityPrincipalIdParameter>]',
    examples: 'Get-MailboxPermission -Identity "john.doe@contoso.com" -User "jane.smith@contoso.com"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Add-MailboxPermission',
    description: 'Adds permissions to a mailbox in Exchange Online.',
    usage: 'Add-MailboxPermission [-Identity] <MailboxIdParameter> -User <SecurityPrincipalIdParameter> -AccessRights <MailboxRights[]>',
    examples: 'Add-MailboxPermission -Identity "john.doe@contoso.com" -User "jane.smith@contoso.com" -AccessRights FullAccess -InheritanceType All'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-MailboxPermission',
    description: 'Removes permissions from a mailbox in Exchange Online.',
    usage: 'Remove-MailboxPermission [-Identity] <MailboxIdParameter> -User <SecurityPrincipalIdParameter> -AccessRights <MailboxRights[]>',
    examples: 'Remove-MailboxPermission -Identity "john.doe@contoso.com" -User "jane.smith@contoso.com" -AccessRights FullAccess -InheritanceType All'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-MailboxFolder',
    description: 'Returns information about a folder in a mailbox in Exchange Online.',
    usage: 'Get-MailboxFolder [-Identity] <MailboxFolderIdParameter>',
    examples: 'Get-MailboxFolder -Identity "john.doe@contoso.com:\Inbox"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-MailboxFolderPermission',
    description: 'Sets folder-level permissions on a folder in a mailbox in Exchange Online.',
    usage: 'Set-MailboxFolderPermission [-Identity] <MailboxFolderIdParameter> -User <MailboxFolderUserIdParameter> -AccessRights <MailboxFolderAccessRight[]>',
    examples: 'Set-MailboxFolderPermission -Identity "john.doe@contoso.com:\Calendar" -User "Default" -AccessRights Reviewer'
  },
  
  // Microsoft 365 Teams Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Team',
    description: 'Returns information about teams in Microsoft Teams.',
    usage: 'Get-Team [-GroupId <String>] [-DisplayName <String>]',
    examples: 'Get-Team -DisplayName "Marketing Team"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-Team',
    description: 'Creates a new team in Microsoft Teams.',
    usage: 'New-Team -DisplayName <String> [-Description <String>] [-Visibility <String>]',
    examples: 'New-Team -DisplayName "Sales Team" -Description "Team for sales department" -Visibility "Private"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-Team',
    description: 'Deletes a team from Microsoft Teams.',
    usage: 'Remove-Team -GroupId <String>',
    examples: 'Remove-Team -GroupId "00000000-0000-0000-0000-000000000000"'
  },
  
  // Microsoft 365 SharePoint Online Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-SPOSite',
    description: 'Returns one or more SharePoint Online sites.',
    usage: 'Get-SPOSite [-Identity <SpoSitePipeBind>] [-Limit <Int32>]',
    examples: 'Get-SPOSite -Identity https://contoso.sharepoint.com/sites/Marketing'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-SPOSite',
    description: 'Creates a new SharePoint Online site collection.',
    usage: 'New-SPOSite -Url <String> -Owner <String> -StorageQuota <Int64> [-Title <String>] [-Template <String>]',
    examples: 'New-SPOSite -Url https://contoso.sharepoint.com/sites/Sales -Owner admin@contoso.com -StorageQuota 1000 -Title "Sales Team Site"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-SPOSite',
    description: 'Removes a SharePoint Online site collection from the recycle bin.',
    usage: 'Remove-SPOSite -Identity <SpoSitePipeBind>',
    examples: 'Remove-SPOSite -Identity https://contoso.sharepoint.com/sites/Marketing'
  },
  
  // Microsoft 365 User Management Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-MsolUser',
    description: 'Returns user objects in Microsoft 365.',
    usage: 'Get-MsolUser [-UserPrincipalName <String>] [-SearchString <String>]',
    examples: 'Get-MsolUser -UserPrincipalName "john.doe@contoso.com"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-MsolUser',
    description: 'Creates a new user in Microsoft 365.',
    usage: 'New-MsolUser -UserPrincipalName <String> -DisplayName <String> [-FirstName <String>] [-LastName <String>] [-Password <String>]',
    examples: 'New-MsolUser -UserPrincipalName "jane.smith@contoso.com" -DisplayName "Jane Smith" -FirstName "Jane" -LastName "Smith" -Password "P@ssw0rd"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-MsolUser',
    description: 'Removes a user from Microsoft 365.',
    usage: 'Remove-MsolUser -UserPrincipalName <String> [-Force]',
    examples: 'Remove-MsolUser -UserPrincipalName "john.doe@contoso.com" -Force'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-MsolUser',
    description: 'Modifies properties of a user object in Microsoft 365.',
    usage: 'Set-MsolUser -UserPrincipalName <String> [-DisplayName <String>] [-Title <String>] [-Department <String>]',
    examples: 'Set-MsolUser -UserPrincipalName "john.doe@contoso.com" -Title "Senior Developer" -Department "IT"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-MsolGroup',
    description: 'Returns groups in Microsoft 365.',
    usage: 'Get-MsolGroup [-GroupType <String>] [-SearchString <String>]',
    examples: 'Get-MsolGroup -GroupType Security -SearchString "IT"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-MsolGroup',
    description: 'Creates a new group in Microsoft 365.',
    usage: 'New-MsolGroup -DisplayName <String> [-Description <String>] [-GroupType <String>]',
    examples: 'New-MsolGroup -DisplayName "IT Support" -Description "IT Support Team" -GroupType Security'
  },
  
  // Azure Management Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Connect-AzAccount',
    description: 'Connects to an Azure account.',
    usage: 'Connect-AzAccount [-Credential <PSCredential>] [-TenantId <String>] [-Subscription <String>]',
    examples: 'Connect-AzAccount -Subscription "My Subscription"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-AzResource',
    description: 'Gets Azure resources.',
    usage: 'Get-AzResource [-ResourceGroupName <String>] [-ResourceType <String>] [-Name <String>]',
    examples: 'Get-AzResource -ResourceGroupName "MyResourceGroup"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-AzResourceGroup',
    description: 'Creates an Azure resource group.',
    usage: 'New-AzResourceGroup -Name <String> -Location <String>',
    examples: 'New-AzResourceGroup -Name "MyResourceGroup" -Location "East US"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-AzResourceGroup',
    description: 'Removes an Azure resource group.',
    usage: 'Remove-AzResourceGroup -Name <String> [-Force]',
    examples: 'Remove-AzResourceGroup -Name "MyResourceGroup" -Force'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-AzVM',
    description: 'Gets properties of a virtual machine in Azure.',
    usage: 'Get-AzVM [-ResourceGroupName <String>] [-Name <String>]',
    examples: 'Get-AzVM -ResourceGroupName "MyResourceGroup" -Name "MyVM"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-AzVM',
    description: 'Creates a virtual machine in Azure.',
    usage: 'New-AzVM -ResourceGroupName <String> -Name <String> -Location <String> [-Credential <PSCredential>]',
    examples: 'New-AzVM -ResourceGroupName "MyResourceGroup" -Name "MyVM" -Location "East US"'
  },
  
  // Network Management Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-NetAdapter',
    description: 'Gets the basic network adapter properties.',
    usage: 'Get-NetAdapter [-Name <String>] [-InterfaceDescription <String>]',
    examples: 'Get-NetAdapter -Name "Ethernet"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Enable-NetAdapter',
    description: 'Enables a network adapter.',
    usage: 'Enable-NetAdapter [-Name <String>] [-InterfaceDescription <String>] [-PassThru]',
    examples: 'Enable-NetAdapter -Name "Ethernet" -PassThru'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Disable-NetAdapter',
    description: 'Disables a network adapter.',
    usage: 'Disable-NetAdapter [-Name <String>] [-InterfaceDescription <String>] [-PassThru]',
    examples: 'Disable-NetAdapter -Name "Ethernet" -PassThru'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-NetIPAddress',
    description: 'Gets IP address configuration.',
    usage: 'Get-NetIPAddress [-IPAddress <String>] [-InterfaceIndex <UInt32>]',
    examples: 'Get-NetIPAddress -IPAddress 192.168.1.1'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-NetIPAddress',
    description: 'Creates an IP address.',
    usage: 'New-NetIPAddress -InterfaceIndex <UInt32> -IPAddress <String> -PrefixLength <Byte> [-DefaultGateway <String>]',
    examples: 'New-NetIPAddress -InterfaceIndex 12 -IPAddress 192.168.1.2 -PrefixLength 24 -DefaultGateway 192.168.1.1'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-NetFirewallRule',
    description: 'Gets firewall rules.',
    usage: 'Get-NetFirewallRule [-Name <String>] [-DisplayName <String>]',
    examples: 'Get-NetFirewallRule -DisplayName "World Wide Web Services (HTTP)"'
  },
  
  // Security Management Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Credential',
    description: 'Gets a credential object based on a user name and password.',
    usage: 'Get-Credential [-UserName <String>] [-Message <String>]',
    examples: 'Get-Credential -UserName "Administrator" -Message "Enter your credentials"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'ConvertTo-SecureString',
    description: 'Converts encrypted standard strings to secure strings.',
    usage: 'ConvertTo-SecureString [-String] <String> [-AsPlainText] [-Force]',
    examples: 'ConvertTo-SecureString -String "P@ssw0rd" -AsPlainText -Force'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Acl',
    description: 'Gets the security descriptor for a resource, such as a file or registry key.',
    usage: 'Get-Acl [-Path] <String> [-Audit]',
    examples: 'Get-Acl -Path "C:\Windows"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-Acl',
    description: 'Changes the security descriptor of a specified resource.',
    usage: 'Set-Acl [-Path] <String> [-AclObject] <Object>',
    examples: 'Set-Acl -Path "C:\Data" -AclObject (Get-Acl -Path "C:\Windows")'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Certificate',
    description: 'Gets one or more certificates from a certificate store.',
    usage: 'Get-Certificate [-Thumbprint <String>] [-DnsName <String>]',
    examples: 'Get-Certificate -DnsName "*.contoso.com"'
  },
  
  // Active Directory Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-ADUser',
    description: 'Gets one or more Active Directory users.',
    usage: 'Get-ADUser [-Identity] <ADUser> [-Properties <String[]>]',
    examples: 'Get-ADUser -Identity "JohnDoe" -Properties *'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-ADUser',
    description: 'Creates a new Active Directory user.',
    usage: 'New-ADUser [-Name] <String> [-SamAccountName <String>] [-UserPrincipalName <String>]',
    examples: 'New-ADUser -Name "Jane Smith" -SamAccountName "jsmith" -UserPrincipalName "jsmith@contoso.com"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-ADUser',
    description: 'Removes an Active Directory user.',
    usage: 'Remove-ADUser [-Identity] <ADUser> [-Confirm]',
    examples: 'Remove-ADUser -Identity "JohnDoe" -Confirm:$false'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-ADGroup',
    description: 'Gets one or more Active Directory groups.',
    usage: 'Get-ADGroup [-Identity] <ADGroup> [-Properties <String[]>]',
    examples: 'Get-ADGroup -Identity "IT Support" -Properties *'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Add-ADGroupMember',
    description: 'Adds one or more members to an Active Directory group.',
    usage: 'Add-ADGroupMember [-Identity] <ADGroup> -Members <ADPrincipal[]>',
    examples: 'Add-ADGroupMember -Identity "IT Support" -Members "JohnDoe"'
  },
  
  // Scripting & Automation Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Start-Job',
    description: 'Starts a PowerShell background job.',
    usage: 'Start-Job [-ScriptBlock] <ScriptBlock> [-Name <String>]',
    examples: 'Start-Job -ScriptBlock { Get-Process } -Name "GetProcesses"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Job',
    description: 'Gets PowerShell background jobs that are running in the current session.',
    usage: 'Get-Job [-Id <Int32[]>] [-Name <String[]>]',
    examples: 'Get-Job -Name "GetProcesses"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Receive-Job',
    description: 'Gets the results of the PowerShell background jobs in the current session.',
    usage: 'Receive-Job [-Id] <Int32[]> [-Keep]',
    examples: 'Receive-Job -Id 1 -Keep'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-Module',
    description: 'Creates a new dynamic module that exists only in memory.',
    usage: 'New-Module [-ScriptBlock] <ScriptBlock> [-Name <String>]',
    examples: 'New-Module -Name "MyModule" -ScriptBlock { function Get-Hello { "Hello World" } }'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Import-Module',
    description: 'Adds modules to the current session.',
    usage: 'Import-Module [-Name] <String[]> [-Global]',
    examples: 'Import-Module -Name "ActiveDirectory" -Global'
  },
  
  // Storage Management Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Disk',
    description: 'Gets one or more disks visible to the operating system.',
    usage: 'Get-Disk [[-Number] <UInt32[]>]',
    examples: 'Get-Disk -Number 0'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Initialize-Disk',
    description: 'Initializes a RAW disk for first time use, enabling the disk to be formatted.',
    usage: 'Initialize-Disk [-Number] <UInt32[]> [-PartitionStyle <PartitionStyle>]',
    examples: 'Initialize-Disk -Number 1 -PartitionStyle GPT'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Partition',
    description: 'Gets the partition objects for all partitions visible on all disks, or optionally a filtered subset.',
    usage: 'Get-Partition [[-DiskNumber] <UInt32[]>] [[-PartitionNumber] <UInt32[]>]',
    examples: 'Get-Partition -DiskNumber 0 -PartitionNumber 2'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-Partition',
    description: 'Creates a new partition on an existing disk.',
    usage: 'New-Partition [-DiskNumber] <UInt32[]> [-Size <UInt64>] [-DriveLetter <Char>]',
    examples: 'New-Partition -DiskNumber 1 -Size 10GB -DriveLetter E'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-Volume',
    description: 'Gets the specified Volume object, or all Volume objects if no filter is provided.',
    usage: 'Get-Volume [[-DriveLetter] <Char[]>]',
    examples: 'Get-Volume -DriveLetter C'
  },
  
  // Windows Registry Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-ItemProperty',
    description: 'Gets the properties of a specified item.',
    usage: 'Get-ItemProperty [-Path] <String[]> [[-Name] <String[]>]',
    examples: 'Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion" -Name "ProgramFilesDir"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-ItemProperty',
    description: 'Creates or changes the value of a property of an item.',
    usage: 'Set-ItemProperty [-Path] <String[]> [-Name] <String> [-Value] <Object>',
    examples: 'Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "WallPaper" -Value "C:\Windows\Web\Wallpaper\Windows\img0.jpg"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'New-ItemProperty',
    description: 'Creates a new property for an item and sets its value.',
    usage: 'New-ItemProperty [-Path] <String[]> [-Name] <String> [-PropertyType] <String> [-Value] <Object>',
    examples: 'New-ItemProperty -Path "HKCU:\Software\MyCompany" -Name "Version" -PropertyType "String" -Value "1.0"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Remove-ItemProperty',
    description: 'Deletes the property and its value from an item.',
    usage: 'Remove-ItemProperty [-Path] <String[]> [-Name] <String[]>',
    examples: 'Remove-ItemProperty -Path "HKCU:\Software\MyCompany" -Name "Version"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Invoke-RestMethod',
    description: 'Sends HTTP and HTTPS requests to RESTful web services.',
    usage: 'Invoke-RestMethod [-Uri] <Uri> [-Method <WebRequestMethod>] [-Body <Object>]',
    examples: 'Invoke-RestMethod -Uri "https://api.github.com/repos/PowerShell/PowerShell/issues" -Method Get'
  },
  
  // Additional Microsoft 365 Exchange Online Mailbox Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-MailboxAutoReplyConfiguration',
    description: 'Returns the automatic reply settings for a mailbox in Exchange Online.',
    usage: 'Get-MailboxAutoReplyConfiguration [-Identity] <MailboxIdParameter>',
    examples: 'Get-MailboxAutoReplyConfiguration -Identity "john.doe@contoso.com"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-MailboxAutoReplyConfiguration',
    description: 'Sets the automatic reply settings for a mailbox in Exchange Online.',
    usage: 'Set-MailboxAutoReplyConfiguration [-Identity] <MailboxIdParameter> [-AutoReplyState <AutoReplyState>] [-InternalMessage <String>] [-ExternalMessage <String>]',
    examples: 'Set-MailboxAutoReplyConfiguration -Identity "john.doe@contoso.com" -AutoReplyState Enabled -InternalMessage "I am out of office" -ExternalMessage "I am out of office"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Get-MailboxJunkEmailConfiguration',
    description: 'Returns the junk email settings for a mailbox in Exchange Online.',
    usage: 'Get-MailboxJunkEmailConfiguration [-Identity] <MailboxIdParameter>',
    examples: 'Get-MailboxJunkEmailConfiguration -Identity "john.doe@contoso.com"'
  },
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"'
  },
  
  // PowerShell Core Commands
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)'
  },
  {
    name: 'Set-MailboxJunkEmailConfiguration',
    description: 'Sets the junk email settings for a mailbox in Exchange Online.',
    usage: 'Set-MailboxJunkEmailConfiguration [-Identity] <MailboxIdParameter> [-Enabled <Boolean>] [-TrustedSendersAndDomains <MultiValuedProperty>]',
    examples: 'Set-MailboxJunkEmailConfiguration -Identity "john.doe@contoso.com" -Enabled $true -TrustedSendersAndDomains @{Add="contoso.com"}'
  }
];

// Categorize PowerShell commands by type
const categorizedCommands = {
  'Windows Management': powershellCommands.filter(cmd => 
    cmd.name.startsWith('Get-Process') || 
    cmd.name.startsWith('Start-Process') || 
    cmd.name.startsWith('Stop-Process') || 
    cmd.name.startsWith('Get-Service') ||
    cmd.name.includes('Service') ||
    cmd.description.toLowerCase().includes('computer') ||
    cmd.description.toLowerCase().includes('process') ||
    cmd.description.toLowerCase().includes('service')
  ),
  'File System': powershellCommands.filter(cmd => 
    cmd.name.startsWith('New-Item') || 
    cmd.name.startsWith('Remove-Item') || 
    cmd.name.startsWith('Get-Content') || 
    cmd.name.startsWith('Set-Content') || 
    cmd.name.startsWith('Copy-Item') || 
    cmd.name.startsWith('Move-Item') || 
    cmd.name.startsWith('Set-Location') ||
    cmd.description.toLowerCase().includes('file') ||
    cmd.description.toLowerCase().includes('folder') ||
    cmd.description.toLowerCase().includes('directory') ||
    cmd.description.toLowerCase().includes('path') ||
    cmd.description.toLowerCase().includes('item')
  ),
  'PowerShell Basics': powershellCommands.filter(cmd => 
    cmd.name.startsWith('Get-Command') || 
    cmd.name.startsWith('Get-Help') || 
    cmd.name.startsWith('Where-Object') || 
    cmd.name.startsWith('Invoke-Command') ||
    cmd.description.toLowerCase().includes('powershell') ||
    cmd.name.includes('Format-') ||
    cmd.name.includes('Select-') ||
    cmd.name.includes('Sort-') ||
    cmd.name.includes('Measure-') ||
    cmd.name.includes('Compare-')
  ),
  'Exchange Online': powershellCommands.filter(cmd => 
    cmd.name.includes('Mailbox') || 
    cmd.description.toLowerCase().includes('exchange') ||
    cmd.description.toLowerCase().includes('mail') ||
    cmd.description.toLowerCase().includes('email') ||
    cmd.description.toLowerCase().includes('message')
  ),
  'Teams Management': powershellCommands.filter(cmd => 
    cmd.name.includes('Team') || 
    cmd.description.toLowerCase().includes('team') ||
    cmd.description.toLowerCase().includes('microsoft teams')
  ),
  'SharePoint Online': powershellCommands.filter(cmd => 
    cmd.name.includes('SPO') || 
    cmd.description.toLowerCase().includes('sharepoint')
  ),
  'Microsoft 365 Users': powershellCommands.filter(cmd => 
    cmd.name.includes('MsolUser') || 
    cmd.description.toLowerCase().includes('microsoft 365') ||
    cmd.description.toLowerCase().includes('user') ||
    cmd.description.toLowerCase().includes('account')
  ),
  'Azure Management': powershellCommands.filter(cmd => 
    cmd.name.includes('Az') ||
    cmd.name.includes('Azure') ||
    cmd.description.toLowerCase().includes('azure')
  ),
  'Network Management': powershellCommands.filter(cmd => 
    cmd.name.includes('NetAdapter') ||
    cmd.name.includes('NetConnection') ||
    cmd.name.includes('NetTCP') ||
    cmd.name.includes('NetIP') ||
    cmd.name.includes('Firewall') ||
    cmd.description.toLowerCase().includes('network') ||
    cmd.description.toLowerCase().includes('connection') ||
    cmd.description.toLowerCase().includes('adapter') ||
    cmd.description.toLowerCase().includes('tcp') ||
    cmd.description.toLowerCase().includes('ip')
  ),
  'Security Management': powershellCommands.filter(cmd => 
    cmd.name.includes('Credential') ||
    cmd.name.includes('Certificate') ||
    cmd.name.includes('Permission') ||
    cmd.name.includes('Acl') ||
    cmd.name.includes('Security') ||
    cmd.description.toLowerCase().includes('security') ||
    cmd.description.toLowerCase().includes('permission') ||
    cmd.description.toLowerCase().includes('credential') ||
    cmd.description.toLowerCase().includes('certificate')
  ),
  'Active Directory': powershellCommands.filter(cmd => 
    cmd.name.includes('AD') ||
    cmd.description.toLowerCase().includes('active directory')
  ),
  'Scripting & Automation': powershellCommands.filter(cmd => 
    cmd.name.includes('Job') ||
    cmd.name.includes('Workflow') ||
    cmd.name.includes('Script') ||
    cmd.name.includes('Module') ||
    cmd.name.includes('Function') ||
    cmd.description.toLowerCase().includes('script') ||
    cmd.description.toLowerCase().includes('automation') ||
    cmd.description.toLowerCase().includes('job') ||
    cmd.description.toLowerCase().includes('workflow') ||
    cmd.description.toLowerCase().includes('module')
  ),
  'Storage Management': powershellCommands.filter(cmd => 
    cmd.name.includes('Disk') ||
    cmd.name.includes('Volume') ||
    cmd.name.includes('Partition') ||
    cmd.name.includes('Storage') ||
    cmd.description.toLowerCase().includes('disk') ||
    cmd.description.toLowerCase().includes('volume') ||
    cmd.description.toLowerCase().includes('partition') ||
    cmd.description.toLowerCase().includes('storage')
  ),
  'Windows Registry': powershellCommands.filter(cmd => 
    cmd.name.includes('Registry') ||
    cmd.name.includes('ItemProperty') ||
    cmd.description.toLowerCase().includes('registry')
  )
};

// Ensure all commands are categorized (add to PowerShell Basics if not in any category)
const categorizedCommandsList = Object.values(categorizedCommands).flat().map(cmd => cmd.name);
const uncategorizedCommands = powershellCommands.filter(cmd => !categorizedCommandsList.includes(cmd.name));
if (uncategorizedCommands.length > 0) {
  categorizedCommands['PowerShell Basics'] = [...categorizedCommands['PowerShell Basics'], ...uncategorizedCommands];
}

// API endpoint to get categories
app.get('/api/categories', (req, res) => {
  res.json(Object.keys(categorizedCommands));
});

// API endpoint to search for PowerShell commands
app.get('/api/commands', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const category = req.query.category || '';
  
  // If category is specified, return commands from that category
  if (category && categorizedCommands[category]) {
    if (!query) {
      return res.json(categorizedCommands[category]);
    }
    
    const results = categorizedCommands[category].filter(cmd => 
      cmd.name.toLowerCase().includes(query) || 
      cmd.description.toLowerCase().includes(query) ||
      cmd.usage.toLowerCase().includes(query) ||
      cmd.examples.toLowerCase().includes(query)
    );
    
    return res.json(results);
  }
  
  // If no category specified, search all commands
  if (!query) {
    return res.json(powershellCommands);
  }
  
  const results = powershellCommands.filter(cmd => 
    cmd.name.toLowerCase().includes(query) || 
    cmd.description.toLowerCase().includes(query) ||
    cmd.usage.toLowerCase().includes(query) ||
    cmd.examples.toLowerCase().includes(query)
  );
  
  res.json(results);
});

// API endpoint to get commands by category
app.get('/api/commands/category/:category', (req, res) => {
  const category = req.params.category;
  
  if (categorizedCommands[category]) {
    return res.json(categorizedCommands[category]);
  }
  
  res.status(404).json({ error: 'Category not found' });
});

// API endpoint to get real-time PowerShell command help
app.get('/api/command-help/:command', async (req, res) => {
  try {
    const ps = new PowerShell({
      executionPolicy: 'Bypass',
      noProfile: true
    });

    await ps.addCommand(`Get-Help -Name ${req.params.command} -Full | ConvertTo-Json`);
    const result = await ps.invoke();
    await ps.dispose();
    
    res.json(JSON.parse(result));
  } catch (error) {
    console.error('Error fetching PowerShell help:', error);
    res.status(500).json({ error: 'Failed to fetch PowerShell help' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});