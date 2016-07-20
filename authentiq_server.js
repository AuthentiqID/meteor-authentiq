Authentiq = {};

// Set claims allowed from Authentiq
// http://developers.authentiq.io/#scopes
Authentiq.whitelistedFields = ['sub', 'name', 'given_name', 'family_name',
                          'middle_name', 'nickname', 'email', 'email_verified',
                          'phone_number', 'phone_number_verified',
                          'address', 'aq:location',
                          'aq:push', 'locale', 'timezone'];


OAuth.registerService('authentiq', 2, null, function(query) {

  var response = getTokens(query);
  var accessToken = response.accessToken;
  var idToken = response.idToken;

  // try to parse `id_token` if available, otherwise fallback to `/userinfo` call
  // NOTE: we don't need to verify the JWT
  //       as it has been received server side from `/token` endpoint
  var identity = idToken ? jwt.decode(idToken, null, true) : getIdentity(accessToken);

  var serviceData = {
    // Accounts.updateOrCreateUserFromExternalService
    // expects the unique user id to be stored in the 'id'
    // property of serviceData.
    id: identity.sub,

    accessToken: accessToken,
    idToken: idToken,
    expiresAt: response.expiresAt,
    scope: response.scope,

    // Accounts-ui can use this as the signed-in name
    username: identity.nickname || identity.given_name || identity.preferred_username
  };

  var fields = _.pick(identity, Authentiq.whitelistedFields);
  _.extend(serviceData, fields);

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refreshToken)
    serviceData.refreshToken = response.refreshToken;

  return {
    serviceData: serviceData,

    // Accounts-ui can use this as the signed-in name,
    // although profile is not always editable,
    // for this reason the `username` is set above
    options: { profile: { name: identity.name }}
  };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request
var getTokens = function (query) {
  var config = ServiceConfiguration.configurations.findOne({ service: 'authentiq' });
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      Authentiq.baseUrl() + '/token', {
        params: {
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.clientSecret),
          redirect_uri: OAuth._redirectUri('authentiq', config),
          grant_type: 'authorization_code'
        }
      });
  } catch (err) {
    throw _.extend(new Error('Failed to complete OAuth handshake with Authentiq. ' + err.message),
                   { response: err.response });
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error('Failed to complete OAuth handshake with Authentiq. ' + response.data.error);
  } else {
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: response.data.expires_at,
      idToken: response.data.id_token,
      scope: response.data.scope
    };
  }
};

var getIdentity = function (accessToken) {
  try {
    return HTTP.get(
      Authentiq.baseUrl() + '/userinfo',
      { params: { access_token: accessToken }}).data;
  } catch (err) {
    throw _.extend(new Error('Failed to fetch identity from authentiq. ' + err.message),
                   { response: err.response });
  }
};

Authentiq.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
