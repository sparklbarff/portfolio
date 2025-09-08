targetScope = 'subscription'

// Parameters
@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Name of the resource group')
param resourceGroupName string = 'rg-${environmentName}'

// Generate resource token for unique naming
var resourceToken = uniqueString(subscription().id, location, environmentName)
var resourcePrefix = 'crt'

// Create resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Deploy resources to the resource group
module resources 'resources.bicep' = {
  scope: rg
  name: 'resources'
  params: {
    location: location
    environmentName: environmentName
    resourceToken: resourceToken
    resourcePrefix: resourcePrefix
  }
}

// Outputs
output RESOURCE_GROUP_ID string = rg.id
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_SUBSCRIPTION_ID string = subscription().subscriptionId

// Static Web App outputs
output STATIC_WEB_APP_NAME string = resources.outputs.STATIC_WEB_APP_NAME
output STATIC_WEB_APP_URL string = resources.outputs.STATIC_WEB_APP_URL
output APPLICATION_INSIGHTS_CONNECTION_STRING string = resources.outputs.APPLICATION_INSIGHTS_CONNECTION_STRING
output USER_ASSIGNED_IDENTITY_CLIENT_ID string = resources.outputs.USER_ASSIGNED_IDENTITY_CLIENT_ID
