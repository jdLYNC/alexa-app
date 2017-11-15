const Alexa = require('alexa-sdk');

const handlers = {
  'LaunchRequest': function() {
    this.emit(':ask', 'Welcome to Geo Facts, what would you like to do?');
  },

  'GetCapitalIntent': function() {
    this.emit(':tell', 'You asked for a capital');
  }
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);

  alexa.registerHandlers(handlers);
  alexa.execute();
};
