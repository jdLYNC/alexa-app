const Alexa = require('alexa-sdk');

const handlers = {
  'Launch Request': function() {
    this.emit(':tell', 'Welcome to your Alexa App');
  }
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);

  alexa.registerHandlers(handlers);
  alexa.execute();
};
