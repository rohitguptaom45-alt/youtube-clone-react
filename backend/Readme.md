# This app was made in order to learn the Backend from the Chai our Code yt


1st we have to make teh data base connection.there is various way to connectthe db we can write the connection copde in the index as we have tell teh node.js to execute from the index file mean it us the starting file of the program and another is that we can separate the code in different file this organize the code we will see teh both opproach


2 Thing to remember about the database 
   1) whenever we try to talk to alway wrap in the try catch becouse there may be the issue will arise and it is import that if the data not load then give the user response accordingly 
   2) DB is on the another continenet so there is the time require for this always use Async Await 

if you look at the 2nd commit we have establish the connecton with the DB

# thing to remember 
  1) if we use the Asyng fn it always return the promice which should be handle when fn call
# NodeJs package Explained
   1) mongoose-aggregate-paginate are help to perform the aggregation query(CRUD operation) reason we not use the default because it help in many complex queryies it also help on how many result should be showen when the page load like in on page 10 result in 2nd 10 result and so on help to paginate the queries it inject like the plugin 

   2) bcrypt package are use to encrypt the password before saving password in DB it is important to save the password in encrypted form 
   
   3) JWt(jsonwebtoken) are use to generate the token so that the user can access the service with this token and noyt sent thire info again and again in simple if user require the service they ask for t=it with this token to varify themselve    it is bearer Token mean whoever have this token data will be send to them 

   4) Multer are used to upload teh file wheter on the local or on the db our cloud services
      there are also number of alternative(express-fileupload,busboy,formidable) available but multer work best so it is more used  

# Access and refresh Tokens 
   Access Tokens are for the short period of time and refresh is long lived these tokens are use to use for authorization \
   if we have the Ac Token we can use the feature that rrequire the authorization but these AC token should expire shorly 
   User Are initially valided using these Access token but since it expire then the refresh token that are saved  in DB and user also has this so when the AcT expire client send the refresh token for continution of teh login and new Act are generated imidiatly


# Aggregation Pipeline
      Ap is the Stages Each stage perform the operation on the provided doc mean if the doc is 50 and we want the 25 so we can filter it and show only 25 document info to the user as the field 


      TOdo get all the twits and view calculation 