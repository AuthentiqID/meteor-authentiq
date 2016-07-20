Package.describe({
  name: 'authentiqid:authentiq',
  summary: 'Authentiq OAuth flow for Meteor',
  version: '0.0.1',
  git: 'https://github.com/AuthentiqID/meteor-authentiq/'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.4');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use(['underscore', 'service-configuration'], ['client', 'server']);
  api.use(['random', 'templating'], 'client');
  api.use('outatime:jwt-simple@0.3.0', ['server']);

  api.export('Authentiq');

  api.addFiles(['authentiq_configure.html', 'authentiq_configure.js'], 'client');

  api.addFiles('authentiq_server.js', 'server');
  api.addFiles('authentiq_client.js', 'client');
});
