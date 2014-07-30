var config;
try {
  config = require("./config");
} catch(e) {
  console.log("Failed to find local config, falling back to environment variables");
  config = {
    app_id: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET
  }
}

var Activity = require("./Activity");

var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");

var app = express();
var root = __dirname + "/..";

// --------------------------------------------------------------------
// SET UP PUSHER
// --------------------------------------------------------------------
var Pusher = require("pusher");
var pusher = new Pusher({
  appId: config.app_id,
  key: config.key,
  secret: config.secret
});

// --------------------------------------------------------------------
// SET UP EXPRESS
// --------------------------------------------------------------------

// Parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Simple logger
app.use(function(req, res, next){
  console.log("%s %s", req.method, req.url);
  console.log(req.body);
  next();
});

// Error handler
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

// Basic protection on _servers content
app.get("/nodejs/*", function(req, res) {
  res.send(404);
});

app.get("/php/*", function(req, res) {
  res.send(404);
});

// Message proxy
app.get("/trigger_activity", function(req, res) {
  var activityType = req.query.activity_type;
  var activityData = req.query.activity_data;
  var email = req.query.email;

  var actionText = getActionText(activityType, activityData);

  var options = {};

  if (email) {
    options.email = email;
    options.get_gravatar = true;
  }

  var activity = new Activity(activityType, actionText, options, function(result) {
    var data = result.getMessage();

    // Trigger message
    var response = pusher.trigger("site-activity", activityType, data);

    var status = 200;
    var body = {"activity": data, "pusherResponse": response};
    
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.setHeader("Content-Type", "application/json");

    res.send(status, body);
  });
});

// Serve static files from directory
app.use(express.static(root));

// Open server on specified port
console.log("Starting Express server");
app.listen(process.env.PORT || 5001);

var sanitiseInput = function(input) {
  return escapeHTML(input).slice(0, 300);
};

var getActionText = function(activityType, activityData) {
  var actionText = 'just did something unrecognisable.';
  switch(activityType) {
    case 'page-load':
      actionText = 'just navigated to the Activity Streams example page.';
      break;
    case 'test-event':
      actionText = 'just clicked the <em>Send Test</em> button.';
      break;
    case 'scroll':
      actionText = 'just scrolled to the ' + activityData['position'] + ' of the page';
      break;
    case 'like':
      actionText = 'just liked: "' + activityData['text'] + '"';
      break;
  }
  return actionText;
};