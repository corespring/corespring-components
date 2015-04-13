# Corespring components 
    
## Overview
  * consists of three main parts: render.js and config.js and server/index.js
  * render is a angular directive for the player
  * config is a angular directive to be used in the visual editor
  * server/index.js is a commonJs module used for calculating the result of an interaction
  * all three parts are commonJs modules, which explicitely export their contents. Still all components are loaded into the same angular application. Therefore it is important to properly namespace the directives and the css properties 
  * name of directive is created dynamically from the directory and file name
      /components/corespring/match/config.js => corespringMatchConfig angular directive
      /components/corespring/match/render.js => corespringMatchRender angular directive
      
## Render
  * communicates with the outside world via the containerBridge    

```
    {
      setDataAndSession: function(dataAndSession){},
      getSession: function(){return {}},
      setResponse: function (response){},
      setMode: function(newMode) {},
      reset: function(){},
      resetStash: function() {},
      isAnswerEmpty: function(){ return false;},
      editable: function(editable){}
    }
```

  * component provides undo/restart
  * provides warning if no answer has been selected
  * the editor calls setDataAndSession every time when it changes the config
  * the editor is able to execute the server side javascript locally for demo/testing purposes
    
##Config

  * communicates with the world via containerBridge
```
  {
    setModel: function(model){},
    getModel: function(){ return {}}        
  }
```

  *  changes to the model are saved automatically
  *  defaultData.json is used to create a new component from scratch in the visual editor

##Server
  * provides function createOutcome(question, answer, settings){return response;} which calculates feedback and score for an interaction. 
  * A typical response looks like
```
  {
    score: 1, //a number between 0 and 1
    correctness: "correct", //correct or incorrect 
    correctClass: "correct, incorrect, warning, partial", //this is the style of the feedback, name needs change? 
    feedback: "some feedback",
    studentResponse: {}, //the answer that has been passed in to createOutcome
    correctResponse: {} //the correct response for displaying the solution
  }
```
  * The feedback is added only if settings.showFeedback is true 
  * The correctResponse is added only if the students answer is not empty and not correct
  * Optionally provides function preprocess(json){ return json;} to preprocess the json before it is passed to the rendering component
  
