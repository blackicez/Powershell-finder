const express = require('express');
const cors = require('cors');
const { PowerShell } = require('node-powershell');
const { exec } = require('child_process');

const app = express();

// Parse command line arguments for port
let port = process.env.PORT || 5000;
const portArg = process.argv.find(arg => arg.startsWith('--port='));
if (portArg) {
  port = parseInt(portArg.split('=')[1], 10);
}

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
  // Office 365 Compliance Commands
  {
    name: 'Get-ComplianceSearch',
    description: 'Retrieves information about compliance searches in your organization.',
    usage: 'Get-ComplianceSearch [-Identity] <String> [-Case <String>]',
    examples: 'Get-ComplianceSearch -Identity "Sensitive Data Search"',
    category: 'Office365Compliance'
  },
  {
    name: 'New-RetentionPolicy',
    description: 'Creates a new retention policy in the organization.',
    usage: 'New-RetentionPolicy [-Name] <String> [-RetentionDuration] <TimeSpan>',
    examples: 'New-RetentionPolicy -Name "Legal Hold" -RetentionDuration 365.00:00:00',
    category: 'Office365Compliance'
  },
  {
    name: 'Get-DlpPolicy',
    description: 'Gets DLP policies in the organization.',
    usage: 'Get-DlpPolicy [[-Identity] <DlpPolicyIdParameter>]',
    examples: 'Get-DlpPolicy -Identity "PII Policy"',
    category: 'Office365Compliance'
  },
  // SharePoint Commands
  {
    name: 'Get-SPSite',
    description: 'Returns one or more site collections.',
    usage: 'Get-SPSite [[-Identity] <SPSitePipeBind>]',
    examples: 'Get-SPSite -Identity "https://sharepoint.contoso.com"',
    category: 'SharePoint'
  },
  {
    name: 'New-SPWeb',
    description: 'Creates a new site in an existing site collection.',
    usage: 'New-SPWeb [-Url] <String> [-Template <SPWebTemplatePipeBind>]',
    examples: 'New-SPWeb -Url "https://sharepoint.contoso.com/sites/newsite" -Template "STS#0"',
    category: 'SharePoint'
  },
  {
    name: 'Set-SPWebPermission',
    description: 'Sets permissions for a web site.',
    usage: 'Set-SPWebPermission [-Identity] <SPWebPipeBind> [-User] <String> [-Permission] <String>',
    examples: 'Set-SPWebPermission -Identity "https://sharepoint.contoso.com/sites/site1" -User "user@contoso.com" -Permission "Full Control"',
    category: 'SharePoint'
  },
  // Network Commands
  {
    name: 'Test-NetConnection',
    description: 'Displays diagnostic information for a connection.',
    usage: 'Test-NetConnection [-ComputerName] <String> [-Port <Int32>]',
    examples: 'Test-NetConnection -ComputerName "www.contoso.com" -Port 443',
    category: 'Network'
  },
  {
    name: 'Get-NetAdapter',
    description: 'Gets the basic network adapter properties.',
    usage: 'Get-NetAdapter [[-Name] <String>] [-Physical]',
    examples: 'Get-NetAdapter -Physical',
    category: 'Network'
  },
  {
    name: 'Debug-NetConnection',
    description: 'Performs a detailed analysis of the connection to a remote host.',
    usage: 'Debug-NetConnection [-ComputerName] <String> [-Port <Int32>]',
    examples: 'Debug-NetConnection -ComputerName "server1.contoso.com" -Port 80',
    category: 'Network'
  },
  {
    name: 'Get-NetRoute',
    description: 'Gets IP routes from IP routing tables.',
    usage: 'Get-NetRoute [-AddressFamily <AddressFamily>]',
    examples: 'Get-NetRoute -AddressFamily IPv4',
    category: 'Network'
  },
  // Basic PowerShell Commands
  {
    name: 'Get-ChildItem',
    description: 'Gets the items and child items in one or more specified locations.',
    usage: 'Get-ChildItem [[-Path] <String[]>] [-Recurse] [-Include <String[]>] [-Exclude <String[]>]',
    examples: 'Get-ChildItem -Path "HKLM:\Software\Microsoft" -Recurse',
    category: 'Basic'
  },
  {
    name: 'Test-Path',
    description: 'Determines whether all elements of a path exist.',
    usage: 'Test-Path [-Path] <String[]> [-PathType <TestPathType>]',
    examples: 'Test-Path -Path "HKCU:\Software\Microsoft\Windows"',
    category: 'Basic'
  },
  {
    name: 'ForEach-Object',
    description: 'Performs an operation against each item in a collection of input objects.',
    usage: 'ForEach-Object [-Process] <ScriptBlock[]> [-InputObject <PSObject>]',
    examples: 'Get-Process | ForEach-Object { $_.Name }',
    category: 'Basic'
  },
  {
    name: 'Group-Object',
    description: 'Groups objects that contain the same value for specified properties.',
    usage: 'Group-Object [-Property] <Object[]> [-NoElement]',
    examples: 'Get-Process | Group-Object -Property ProcessName',
    category: 'Basic'
  },
  {
    name: 'Measure-Object',
    description: 'Calculates the numeric properties of objects, and the characters, words, and lines in string objects.',
    usage: 'Measure-Object [[-Property] <String[]>] [-Average] [-Sum] [-Maximum] [-Minimum]',
    examples: 'Get-Process | Measure-Object -Property WorkingSet -Average -Sum -Maximum -Minimum',
    category: 'Basic'
  },
  {
    name: 'Sort-Object',
    description: 'Sorts objects by property values.',
    usage: 'Sort-Object [[-Property] <Object[]>] [-Descending]',
    examples: 'Get-Process | Sort-Object -Property CPU -Descending',
    category: 'Basic'
  },
  {
    name: 'Select-Object',
    description: 'Selects objects or object properties.',
    usage: 'Select-Object [[-Property] <Object[]>] [-First <Int32>] [-Last <Int32>] [-Unique]',
    examples: 'Get-Process | Select-Object -Property Name, CPU, WorkingSet -First 5',
    category: 'Basic'
  },
  
  // Windows Event Log Commands
  {
    name: 'Get-EventLog',
    description: 'Gets the events in an event log, or a list of the event logs, on the local computer or remote computers.',
    usage: 'Get-EventLog [-LogName] <String> [-Newest <Int32>] [-EntryType <String[]>]',
    examples: 'Get-EventLog -LogName System -Newest 10 -EntryType Error',
    category: 'Windows'
  },
  {
    name: 'Write-EventLog',
    description: 'Writes an event to an event log.',
    usage: 'Write-EventLog [-LogName] <String> [-Source] <String> [-EventId] <Int32> [-EntryType <EventLogEntryType>] [-Message] <String>',
    examples: 'Write-EventLog -LogName Application -Source "MyApp" -EventId 1001 -EntryType Information -Message "Application started"',
    category: 'Windows'
  },
  {
    name: 'Clear-EventLog',
    description: 'Clears all entries from specified event logs on the local computer or remote computers.',
    usage: 'Clear-EventLog [-LogName] <String[]> [[-ComputerName] <String[]>]',
    examples: 'Clear-EventLog -LogName Application -ComputerName Server01',
    category: 'Windows'
  },
  {
    name: 'Get-Service',
    description: 'Gets the services on a local or remote computer.',
    usage: 'Get-Service [[-Name] <String[]>] [-ComputerName <String[]>]',
    examples: 'Get-Service -Name "spooler" -ComputerName "Server01"',
    category: 'Windows'
  },
  {
    name: 'Start-Service',
    description: 'Starts one or more stopped services.',
    usage: 'Start-Service [-Name] <String[]> [-PassThru]',
    examples: 'Start-Service -Name "spooler"',
    category: 'Windows'
  },
  {
    name: 'Stop-Service',
    description: 'Stops one or more running services.',
    usage: 'Stop-Service [-Name] <String[]> [-Force] [-NoWait]',
    examples: 'Stop-Service -Name "spooler" -Force',
    category: 'Windows'
  },
  {
    name: 'Get-Process',
    description: 'Gets the processes that are running on the local computer.',
    usage: 'Get-Process [[-Name] <String[]>] [-ComputerName <String[]>]',
    examples: 'Get-Process -Name "notepad" -ComputerName "Server01"',
    category: 'Windows'
  },
  {
    name: 'Stop-Process',
    description: 'Stops one or more running processes.',
    usage: 'Stop-Process [-Name] <String[]> [-Force]',
    examples: 'Stop-Process -Name "notepad" -Force',
    category: 'Windows'
  },
  
  // Remote Management Commands
  {
    name: 'Enter-PSSession',
    description: 'Starts an interactive session with a remote computer.',
    usage: 'Enter-PSSession [-ComputerName] <String> [-Credential <PSCredential>]',
    examples: 'Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)',
    category: 'Remote'
  },
  {
    name: 'Exit-PSSession',
    description: 'Ends an interactive session with a remote computer.',
    usage: 'Exit-PSSession',
    examples: 'Exit-PSSession',
    category: 'Remote'
  },
  {
    name: 'New-PSSession',
    description: 'Creates a persistent connection to a local or remote computer.',
    usage: 'New-PSSession [-ComputerName] <String[]> [-Credential <PSCredential>]',
    examples: 'New-PSSession -ComputerName Server01, Server02 -Credential (Get-Credential)',
    category: 'Remote'
  },
  {
    name: 'Invoke-Command',
    description: 'Runs commands on local and remote computers.',
    usage: 'Invoke-Command [-ComputerName] <String[]> [-ScriptBlock] <ScriptBlock> [-Credential <PSCredential>]',
    examples: 'Invoke-Command -ComputerName Server01 -ScriptBlock { Get-Process }',
    category: 'Remote'
  },
  {
    name: 'Remove-PSSession',
    description: 'Closes one or more PowerShell sessions (PSSessions).',
    usage: 'Remove-PSSession [-Session] <PSSession[]>',
    examples: 'Remove-PSSession -Session $session',
    category: 'Remote'
  },
  {
    name: 'Test-Connection',
    description: 'Sends ICMP echo request packets to one or more computers.',
    usage: 'Test-Connection [-ComputerName] <String[]> [-Count <Int32>]',
    examples: 'Test-Connection -ComputerName Server01 -Count 2',
    category: 'Remote'
  },
  {
    name: 'Get-Command',
    description: 'Gets all commands that are installed on the computer.',
    usage: 'Get-Command [-Name] <string[]> [-Module <string[]>] [-CommandType <CommandTypes>]',
    examples: 'Get-Command -Name *process* -CommandType Cmdlet',
    category: 'Basic'
  },
  {
    name: 'Find-Module',
    description: 'Finds modules in a repository that match specified criteria.',
    usage: 'Find-Module [-Name] <string[]> [-Repository <string[]>]',
    examples: 'Find-Module -Name Az* -Repository PSGallery',
    category: 'Basic'
  },
  {
    name: 'Install-Module',
    description: 'Downloads one or more modules from a repository, and installs them on the local computer.',
    usage: 'Install-Module [-Name] <string[]> [-Repository <string[]>] [-Scope <string>]',
    examples: 'Install-Module -Name AzureAD -Scope CurrentUser',
    category: 'Basic'
  },
  {
    name: 'Get-Help',
    description: 'Displays information about PowerShell commands and concepts.',
    usage: 'Get-Help [[-Name] <string>] [-Category <string[]>] [-Full]',
    examples: 'Get-Help Get-Process -Full',
    category: 'Basic'
  },
  
  // Exchange Online Commands
  {
    name: 'Connect-ExchangeOnline',
    description: 'Connects to Exchange Online PowerShell with modern authentication.',
    usage: 'Connect-ExchangeOnline [-UserPrincipalName <String>] [-ExchangeEnvironmentName <ExchangeEnvironment>]',
    examples: 'Connect-ExchangeOnline -UserPrincipalName admin@contoso.com',
    category: 'Exchange Online'
  },
  {
    name: 'Get-Mailbox',
    description: 'Returns a list of mailboxes or information about a specific mailbox.',
    usage: 'Get-Mailbox [[-Identity] <MailboxIdParameter>] [-ResultSize <Unlimited>]',
    examples: 'Get-Mailbox -Identity john.doe@contoso.com',
    category: 'Exchange Online'
  },
  {
    name: 'Set-Mailbox',
    description: 'Modifies the settings of an existing mailbox.',
    usage: 'Set-Mailbox [-Identity] <MailboxIdParameter> [-EmailAddresses <ProxyAddressCollection>]',
    examples: 'Set-Mailbox -Identity john.doe@contoso.com -EmailAddresses @{add="alias@contoso.com"}',
    category: 'Exchange Online'
  },
  {
    name: 'New-MailboxExportRequest',
    description: 'Creates a mailbox export request to export mailbox content to a .pst file.',
    usage: 'New-MailboxExportRequest [-Mailbox] <MailboxOrMailUserIdParameter> -FilePath <LongPath>',
    examples: 'New-MailboxExportRequest -Mailbox john.doe@contoso.com -FilePath "\\server\share\john_export.pst"',
    category: 'Exchange Online'
  },
  {
    name: 'Get-MailboxPermission',
    description: 'Returns permissions on a mailbox.',
    usage: 'Get-MailboxPermission [-Identity] <MailboxIdParameter> [-User <SecurityPrincipalIdParameter>]',
    examples: 'Get-MailboxPermission -Identity "Sales Team" -User john@contoso.com',
    category: 'Exchange Online'
  },
  {
    name: 'New-MailboxRestoreRequest',
    description: 'Restores a soft-deleted mailbox or recovers a mailbox from the recovery database.',
    usage: 'New-MailboxRestoreRequest [-SourceMailbox] <MailboxIdParameter> [-TargetMailbox] <MailboxIdParameter>',
    examples: 'New-MailboxRestoreRequest -SourceMailbox "Deleted User" -TargetMailbox "john@contoso.com"',
    category: 'Exchange Online'
  },
  
  // Azure Commands
  {
    name: 'Connect-AzAccount',
    description: 'Connects to Azure with an authenticated account for use with Azure Resource Manager cmdlets.',
    usage: 'Connect-AzAccount [-Tenant <String>] [-Subscription <String>]',
    examples: 'Connect-AzAccount -Tenant "contoso.onmicrosoft.com"',
    category: 'Azure'
  },
  {
    name: 'Get-AzVM',
    description: 'Gets the properties of a virtual machine.',
    usage: 'Get-AzVM [[-ResourceGroupName] <String>] [[-Name] <String>]',
    examples: 'Get-AzVM -ResourceGroupName "myResourceGroup" -Name "myVM"',
    category: 'Azure'
  },
  {
    name: 'New-AzResourceGroup',
    description: 'Creates an Azure resource group.',
    usage: 'New-AzResourceGroup [-Name] <String> [-Location] <String>',
    examples: 'New-AzResourceGroup -Name "myResourceGroup" -Location "westus2"',
    category: 'Azure'
  },
  {
    name: 'Get-AzStorageAccount',
    description: 'Gets the properties of a Storage account.',
    usage: 'Get-AzStorageAccount [[-ResourceGroupName] <String>] [[-Name] <String>]',
    examples: 'Get-AzStorageAccount -ResourceGroupName "myResourceGroup" -Name "mystorageaccount"',
    category: 'Azure'
  },
  {
    name: 'New-AzKeyVault',
    description: 'Creates an Azure Key Vault.',
    usage: 'New-AzKeyVault -Name <String> -ResourceGroupName <String> -Location <String>',
    examples: 'New-AzKeyVault -Name "MyVault" -ResourceGroupName "myResourceGroup" -Location "westus2"',
    category: 'Azure'
  },
  {
    name: 'New-AzResourceGroup',
    description: 'Creates an Azure resource group.',
    usage: 'New-AzResourceGroup [-Name] <String> [-Location] <String>',
    examples: 'New-AzResourceGroup -Name "myResourceGroup" -Location "West US"',
    category: 'Azure'
  },
  {
    name: 'Remove-AzResourceGroup',
    description: 'Removes a resource group and all of its resources.',
    usage: 'Remove-AzResourceGroup [-Name] <String> [-Force]',
    examples: 'Remove-AzResourceGroup -Name "myResourceGroup" -Force',
    category: 'Azure'
  },
  
  // Office 365 Commands
  {
    name: 'Connect-MsolService',
    description: 'Connects to Microsoft 365 with an authenticated account.',
    usage: 'Connect-MsolService [-Credential <PSCredential>]',
    examples: 'Connect-MsolService -Credential (Get-Credential)',
    category: 'Office 365'
  },
  {
    name: 'Get-MsolUser',
    description: 'Gets users from Microsoft 365.',
    usage: 'Get-MsolUser [[-UserPrincipalName] <String>] [-All]',
    examples: 'Get-MsolUser -All',
    category: 'Office 365'
  },
  {
    name: 'New-MsolUser',
    description: 'Creates a new user in Microsoft 365.',
    usage: 'New-MsolUser -UserPrincipalName <String> -DisplayName <String> [-FirstName <String>] [-LastName <String>]',
    examples: 'New-MsolUser -UserPrincipalName "john.doe@contoso.com" -DisplayName "John Doe" -FirstName "John" -LastName "Doe"',
    category: 'Office 365'
  },
  {
    name: 'Set-MsolUserPassword',
    description: 'Resets the password for a user in Microsoft 365.',
    usage: 'Set-MsolUserPassword -UserPrincipalName <String> -NewPassword <String> [-ForceChangePassword <Boolean>]',
    examples: 'Set-MsolUserPassword -UserPrincipalName "john.doe@contoso.com" -NewPassword "P@ssw0rd" -ForceChangePassword $true',
    category: 'Office 365'
  }
];

// Get unique categories from commands
const getCategories = () => {
  const categories = new Set();
  powershellCommands.forEach(cmd => {
    if (cmd.category) categories.add(cmd.category);
  });
  return Array.from(categories);
};

// API endpoints
// Commands endpoint
app.get('/api/commands', (req, res) => {
  const { q, category } = req.query;
  let filteredCommands = powershellCommands;

  // Filter by category if specified
  if (category && category !== 'all') {
    filteredCommands = filteredCommands.filter(cmd => cmd.category === category);
  }

  // Filter by search query if specified
  if (q) {
    const searchTerm = q.toLowerCase();
    filteredCommands = filteredCommands.filter(cmd =>
      cmd.name.toLowerCase().includes(searchTerm) ||
      cmd.description.toLowerCase().includes(searchTerm) ||
      cmd.usage.toLowerCase().includes(searchTerm)
    );
  }

  res.json(filteredCommands);
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  // Extract unique categories from commands
  const categories = [...new Set(powershellCommands.map(cmd => cmd.category))];
  res.json(categories);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});