const Alexa = require('alexa-sdk');

const handlers = {
  'LaunchRequest': function() {
    this.emit(':ask', 'Welcome to Geo Facts, what would you like to do?');
  },

  'GetCapitalIntent': function() {
    const country = this.event.request.intent.slots.country.value;
    this.emit(':tell', `You asked for the capital of ${country}`);
  }
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);

  alexa.registerHandlers(handlers);
  alexa.execute();
};
