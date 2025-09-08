@minLength(1)
@description('Primary location for all resources')
param location string

@minLength(1)
@maxLength(64)
@description('Name of the environment')
param environmentName string

@description('Resource token for unique naming')
param resourceToken string

@description('Resource prefix for naming')
param resourcePrefix string

// User-assigned managed identity
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${resourcePrefix}-id-${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: '${resourcePrefix}-swa-${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'crt-portfolio-frontend'
    project: 'crt-portfolio'
  }
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/sparklbarff/portfolio'
    branch: 'main'
    buildProperties: {
      appLocation: '/WIP/v1'
      apiLocation: ''
      outputLocation: '/WIP/v1'
    }
  }
}

// Log Analytics Workspace for monitoring
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${resourcePrefix}-law-${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${resourcePrefix}-ai-${resourceToken}'
  location: location
  kind: 'web'
  tags: {
    'azd-env-name': environmentName
  }
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    IngestionMode: 'LogAnalytics'
  }
}

// Outputs
output STATIC_WEB_APP_NAME string = staticWebApp.name
output STATIC_WEB_APP_URL string = 'https://${staticWebApp.properties.defaultHostname}'
output APPLICATION_INSIGHTS_CONNECTION_STRING string = applicationInsights.properties.ConnectionString
output APPLICATION_INSIGHTS_INSTRUMENTATION_KEY string = applicationInsights.properties.InstrumentationKey
output LOG_ANALYTICS_WORKSPACE_ID string = logAnalyticsWorkspace.id
output USER_ASSIGNED_IDENTITY_ID string = userAssignedIdentity.id
output USER_ASSIGNED_IDENTITY_CLIENT_ID string = userAssignedIdentity.properties.clientId
