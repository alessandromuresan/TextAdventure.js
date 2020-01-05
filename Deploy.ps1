param(
    [Parameter(Mandatory)]
    [string] $Tenant = "aa235847-b618-4f2a-b6b7-657bd1088d09",

    [Parameter(Mandatory)]
    [string] $Subscription = "Default",

    [Parameter(Mandatory)]
    [string] $ResourceGroup,

    [Parameter(Mandatory)]
    [string] $AppName
)

$ErrorActionPreference = "Stop"

az login --tenant $Tenant

az account set --subscription $Subscription

az webapp deployment source config-zip --resource-group $ResourceGroup --name $AppName --src clouddrive/<filename>.zip