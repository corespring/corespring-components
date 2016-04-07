# Dockerized regression test runner 
The purpose of this docker container is to run the component regression tests.  
It boots up a corespring-container with a mongo and a fake-s3.   
It configures a virtual framebuffer so that we can run firefox in headless mode.  
    

## Building the runner
It downloads/runs the target sources of the components and the container as a slug from heroku.
Only if you have changes in the Dockerfile or in the docker directory, you would have to build it.    

     docker build -t my-runner .
     
### Problems
+ Sometimes npm install doesn't work. If possible, try running npm install in the regression directory of your source files before running the docker build.      
       
## Running the regression tests 
     
     docker run -e SLUG="http://myslug.tgz" my-runner
        
### Options 
     -e SLUG="http://my-slug.tgz"      ## mandatory, see 'get slug url' below
   
     -e BROWSER_NAME="firefox"         ## optional, default firefox, chrome is the only other possible value
     -e GREP="some text"               ## optional, no default, use it to select tests
     -e GRUNT_DEBUG "false"            ## optional, default is false
     -e TIMEOUT=milliseconds           ## optional, default 60000
     -e WAIT_BEFORE_TEST=seconds       ## optional, default 30, increase if you tests fail to connect to localhost
     -e WEB_DRIVER_LOG_LEVEL "silent"  ## optional, default silent, other values: verbose|command|data|result, see: [webdriver docs](http://webdriver.io/guide/getstarted/configuration.html)
        
## Getting the slug url 

If you have a slug id "74f625e6-13af-4126-b83a-48521b6992fa" from the ci build you can use this curl to get the infor about the slug  
 
     curl -n https://api.heroku.com/apps/corespring-container-devt/slugs/74f625e6-13af-4126-b83a-48521b6992fa -H "Accept: application/vnd.heroku+json; version=3"
     
That returns some json which contains the download url 
 
     {
       "blob":{
         "method":"get",
         "url":"https://s3-external-1.amazonaws.com/herokuslugs/heroku.com/v1/74f625e6-13af-4126-b83a-48521b6992fa?AWSAccessKeyId=AKIAJWLOWWHPBWQOPJZQ&Signature=DL7vhYgb5JrNDUWSR3UfCwBflFs%3D&Expires=1459959632"
       },
       "buildpack_provided_description":null,
       "checksum":null,
       "commit":"7240c75",
       "commit_description":"{\"app\":\"3.0.0-SNAPSHOT\",\"hash\":\"7240c75\",\"tag\":null}",
       "created_at":"2016-03-31T21:41:41Z",
       "id":"74f625e6-13af-4126-b83a-48521b6992fa",
       "process_types":{
         "web":"bin/root -Dhttp.port=${PORT} -Dlogger.file=${ENV_LOGGER} ${JAVA_OPTS}"
       },
       "size":191377290,
       "updated_at":"2016-03-31T21:41:41Z",
       "stack":{
         "id":"f9f9cbd7-2970-41ef-8db5-3df7123b041f",
         "name":"cedar-14"
       }
     }

This url is what you pass to the docker container as 

     -e SLUG="https://s3-external-1.amazonaws.com/herokuslugs/heroku.com/v1/74f625e6-13af-4126-b83a-48521b6992fa?AWSAccessKeyId=AKIAJWLOWWHPBWQOPJZQ&Signature=DL7vhYgb5JrNDUWSR3UfCwBflFs%3D&Expires=1459959632"   
     
Note: The quotes are important, don't leave them out     
     
      
      

        