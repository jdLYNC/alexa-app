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
    this.response
      .speak('Welcome to Geo Facts, what would you like to do?')
      .listen('What would you like you to do?  I can teach or quiz you.');
    this.emit(':responseReady');
  }

};

const selectModeHandlers = Alexa.CreateStateHandler(states.select, {

  'SelectModeIntent': function() {
    const mode = this.event.request.intent.slots.mode.value;
    this.handler.state = states[mode];
    this.response
      .speak(`You have selected ${mode} mode.`);
    if (mode === states.quiz) this.emitWithState('AskCapitalIntent');
  },

  'Unhandled': function() {
    this.response.listen('I\'m sorry I didn\'t understand that, what would you like to do, teach or quiz?');
    this.emit(':responseReady');
  }

});

const teachModeHandlers = Alexa.CreateStateHandler(states.teach, {

  'GetCapitalIntent': function() {
    const country = this.event.request.intent.slots.country.value;

    Axios
      .get(`https://restcountries.eu/rest/v2/name/${country}?fields=capital`)
      .then(res => {
        this.response.speak(`The capital of ${country} is ${res.data[0].capital}.`);
        this.emit(':responseReady');
      });

  },

  'AMAZON.YesIntent': function() {
    this.handler.state = states.select;
    this.response.listen('OK, what would you like to do?');
    this.emit(':responseReady');
  },

  'AMAZON.NoIntent': function() {
    this.response.listen('OK, what would you like to know?');
    this.emit(':responseReady');
  },

  'AMAZON.StopIntent': function() {
    this.response.speak('Goodbye!');
    this.emitWithState('SessionEndedRequest');
  },

  'ChangeStateIntent': function() {
    this.response.listen('Would you like to change mode?');
    this.emit(':responseReady');
  },

  'Unhandled': function() {
    this.response.speak(`I'm sorry I don't recognise that command when in ${this.handler.state} mode.`);
    this.emitWithState('ChangeStateIntent');
  }

});

const quizModeHandlers = Alexa.CreateStateHandler(states.quiz, {

  'AskCapitalIntent': function() {

    Axios
      .get('https://restcountries.eu/rest/v2/all?fields=name;capital')
      .then(res => {
        this.attributes['country'] = res.data[Math.floor(Math.random() * res.data.length)];
        this.response.listen(`What is the capital of ${this.attributes.country.name}?`);
        this.emit(':responseReady');
      });
  },

  'AnswerIntent': function() {
    const correctAnswer = this.attributes['country'].capital;
    const userAnswer = this.event.request.intent.slots.city.value;

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      this.attributes['streak']++;
      this.response.speak(`Correct! The capital of ${this.attributes.country.name} is ${this.attributes.country.capital}.`);
    } else {
      this.attributes['streak'] = 0;
      this.response.speak(`Wrong! The capital of ${this.attributes.country.name} is ${this.attributes.country.capital}.`);
    }

    this.emit(':saveState');
    this.emitWithState('AskCapitalIntent');
  },

  'AMAZON.YesIntent': function() {
    this.handler.state = states.select;
    this.response.listen('OK, what would you like to do?');
    this.emit(':responseReady');
  },

  'AMAZON.NoIntent': function() {
    this.response.speak('OK, we\'ll carry on.');
    this.emitWithState('AskCapitalIntent');
  },

  'AMAZON.StopIntent': function() {
    this.response.speak('Goodbye!');
    this.emitWithState('SessionEndedRequest');
  },

  'SessionEndedRequest': function () {
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  },

  'ChangeStateIntent': function() {
    this.response.listen('Would you like to change mode?');
    this.emit(':responseReady');
  },

  'Unhandled': function() {
    this.response.speak(`I'm sorry I don't recognise that command when in ${this.handler.state} mode.`);
    this.emitWithState('ChangeStateIntent');
  }
});

exports.handler = function(event, context) {
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
