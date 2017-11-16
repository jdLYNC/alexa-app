const Alexa = require('alexa-sdk');
const Axios = require('axios');

const states = {
  select: 'select',
  teach: 'teach',
  quiz: 'quiz'
};

const newSessionHandlers = {
  'LaunchRequest': function() {
    this.handler.state = states.select;
    this.emit(':ask', 'Welcome to Geo Facts, what would you like to do?');
  }
};

const selectModeHandlers = Alexa.CreateStateHandler(states.select, {
  'SelectModeIntent': function() {
    const mode = this.event.request.intent.slots.mode.value;
    this.handler.state = states[mode];
    // this.attributes['mode'] = mode;
    this.emit(':tell', `You have selected ${mode} mode, we are now in ${this.handler.state} state`);
  },

  'Unhandled': function() {
    this.emit(':ask', 'I\'m sorry I didn\'t understand that, what would you like to do?');
  }
});

const teachModeHandlers = Alexa.CreateStateHandler(states.teach, {
  'GetCapitalIntent': function() {
    const country = this.event.request.intent.slots.country.value;

    Axios
      .get(`https://restcountries.eu/rest/v2/name/${country}?fields=capital`)
      .then(res => {
        this.emit(':tell', `The capital of ${country} is ${res.data[0].capital}.`);
      });
  },

  'AMAZON.YesIntent': function() {
    this.handler.state = states.select;
    this.emit(':ask', 'OK, what would you like to do?');
  },

  'Unhandled': function() {
    this.emit(':ask', 'I\'m sorry I don\'t recognise that command when in teach mode.  Would you like to change mode?');
  }
});


const quizModeHandlers = Alexa.CreateStateHandler(states.quiz, {

  'AskCapitalIntent': function() {

    Axios
      .get('https://restcountries.eu/rest/v2/all?fields=name;capital')
      .then(res => {
        this.attributes['country'] = res.data[Math.floor(Math.random() * res.data.length)];
        this.emit(':ask', `What is the capital of ${this.attributes.country.name}?`);
      });
  },

  'AnswerIntent': function() {
    const correctAnswer = this.attributes['country'].capital;
    const userAnswer = this.event.request.intent.slots.city.value;

    if (userAnswer === correctAnswer) this.emit(':tell', `Correct! The capital of ${this.attributes.country.name} is ${this.attributes.country.capital}.`);
    else this.emit(':tell', `Wrong! The capital of ${this.attributes.country.name} is ${this.attributes.country.capital}.`);
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
    selectModeHandlers,
    teachModeHandlers,
    quizModeHandlers
  );
  alexa.execute();
};
