# Corespring components 
    
## Overview
  * consists of three main parts: render.js and config.js and server/index.js
  * render is a angular directive for the player
  * config is a angular directive to be used in the visual editor
  * server/index.js is a commonJs module used for calculating the result of an interaction
      all part are embedded in a commonJs kind of module (exports)
      Still all components are loaded into the same angular application, so it is important to properly namespace the directives and the css properties 
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


