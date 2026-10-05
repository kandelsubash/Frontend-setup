export const environment = {
  production: true,
  bypassAuth: false,
  apiBaseUrl: '/api',
  allowedOrigins: [window.location.origin],
  okta: {
    issuer: 'https://${OKTA_DOMAIN}/oauth2/default',
    clientId: '${OKTA_CLIENT_ID}',
    redirectUri: window.location.origin + '/login/callback',
    postLogoutRedirectUri: window.location.origin + '/login',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
  },
};
