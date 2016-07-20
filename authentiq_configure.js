Template.configureLoginServiceDialogForAuthentiq.helpers({
  siteUrl: function () {
    return Meteor.absoluteUrl();
  }
});

Template.configureLoginServiceDialogForAuthentiq.fields = function () {
  return [
    { property: 'clientId', label: 'Client ID' },
    { property: 'secret', label: 'Client secret' }
  ];
};
