export const environment = {
  production: false,
  bypassAuth: true,
  apiBaseUrl: 'http://localhost:8080/api',
  allowedOrigins: ['http://localhost:8080'],
  okta: {
    issuer: 'https://dev-iqnazxs4w5z77vug.us.auth0.com/',
    clientId: 'vvCmfd9IO59WK5GxemO7L87eYOX2GVkE',
    redirectUri: window.location.origin + '/login/callback',
    postLogoutRedirectUri: window.location.origin + '/login',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
  },
};
