const Alexa = require('alexa-sdk');
const Axios = require('axios');

const handlers = {
  'LaunchRequest': function() {
    this.emit(':ask', 'Welcome to Geo Facts, what would you like to do?');
  },

  'SelectModeIntent': function() {
    const mode = this.event.request.intent.slots.mode.value;
    this.emit(':tell', `You have selected ${mode}`);
  },

  'GetCapitalIntent': function() {
    const country = this.event.request.intent.slots.country.value;

    Axios
      .get(`https://restcountries.eu/rest/v2/name/${country}?fields=capital`)
      .then(res => {
        this.emit(':tell', `The capital of ${country} is ${res.data[0].capital}`);
      });
  }
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);

  alexa.registerHandlers(handlers);
  alexa.execute();
};
