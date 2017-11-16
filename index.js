const Alexa = require('alexa-sdk');
const Axios = require('axios');

const states = {
  teach: 'teach',
  quiz: 'quiz'
};

const newSessionHandlers = {
  'LaunchRequest': function() {
    this.emit(':ask', 'Welcome to Geo Facts, what would you like to do?');
  },

  'SelectModeIntent': function() {
    const mode = this.event.request.intent.slots.mode.value;
    this.handler.state = states[mode];
    // this.attributes['mode'] = mode
    this.emit(':tell', `You have selected ${mode} mode, we are now in ${this.handler.state} state`);
  },

  'Unhandled': function() {
    this.emit(':ask', 'I\'m sorry I didn\'t understand that, what would you like to do?');
  }
};

const teachModeHandlers = Alexa.CreateStateHandler(states.teach, {
  'GetCapitalIntent': function() {
    const country = this.event.request.intent.slots.country.value;

    Axios
      .get(`https://restcountries.eu/rest/v2/name/${country}?fields=capital`)
      .then(res => {
        this.emit(':tell', `The capital of ${country} is ${res.data[0].capital}.`);
      });
  },

  'Unhandled': function() {
    this.emit(':tell', 'I\'m sorry I don\'t recognise that command when in teach mode');
  }
});

const quizModeHandlers = Alexa.CreateStateHandler(states.quiz, {
  'AskCapitalIntent': function() {
    this.emit(':tell', 'This will one day become a question.');
  },

  'Unhandled': function() {
    this.emit(':tell', 'I\'m sorry in quiz mode I ask you the questions');
  }
});

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);

  alexa.dynamoDBTableName = 'geoFactsTable';

  alexa.registerHandlers(
    newSessionHandlers,
    teachModeHandlers,
    quizModeHandlers
  );
  alexa.execute();
};
