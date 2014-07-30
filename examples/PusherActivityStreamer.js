function PusherActivityStreamer(activityChannel, ulSelector, options) {
  var self = this;
  
  this._email = null;
  
  options = options || {};
  this.settings = $.extend({
    maxItems: 10
  }, options);
  
  this._activityChannel = activityChannel;
  this._activityList = $(ulSelector);
  
  this._activityChannel.bind('activity', function(activity) {
      self._handleActivity.call(self, activity, activity.type);
    });
  this._activityChannel.bind('page-load', function(activity) {
      self._handleActivity.call(self, activity, 'page-load');
    });
  this._activityChannel.bind('test-event', function(activity) {
      self._handleActivity.call(self, activity, 'test-event');
    });
  this._activityChannel.bind('scroll', function(activity) {
      self._handleActivity.call(self, activity, 'scroll');
    });
  this._activityChannel.bind('like', function(activity) {
      self._handleActivity.call(self, activity, 'like');
    });
    
  this._itemCount = 0;
};

PusherActivityStreamer.prototype._handleActivity = function(activity, eventType) {
  var self = this;
  ++this._itemCount;
  
  var activityItem = PusherActivityStreamer._buildListItem(activity);
  activityItem.addClass(eventType);
  activityItem.hide();
  this._activityList.prepend(activityItem);
  activityItem.slideDown('slow');
  
  if(this._itemCount > this.settings.maxItems) {
    this._activityList.find('li:last-child').fadeOut(function(){
      $(this).remove();
      --self._itemCount;
    });
  }
};

PusherActivityStreamer._timeToDescription = function(time) {
  if(time instanceof Date === false) {
    time = Date.parse(time);
  }
  var desc = "dunno";
  var now = new Date();
  var howLongAgo = (now - time);
  var seconds = Math.round(howLongAgo/1000);
  var minutes = seconds/60;
  var hours = minutes/60;
  if(seconds === 0) {
    desc = "just now";
  }
  else if(minutes < 1) {
    desc = seconds + " seconds ago";
  }
  else if(minutes < 60) {
    desc = minutes + " minutes ago";
  }
  else if(hours < 24) {
    desc = hours + "hours ago";
  }
  else {
    desc = time.getDay() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"][time.getMonth()]
  }
  return desc;
};

PusherActivityStreamer.prototype.sendActivity = function(activityType, activityData) {
  var data = {
    activity_type: activityType,
    activity_data: activityData
  };
  if(this._email) {
    data.email = this._email;
  }
  $.ajax({
    url: 'php/trigger_activity.php', // PHP
    // url: '/trigger_activity', // Node.js
    data: data
  })
};

PusherActivityStreamer.prototype.setEmail = function(value) {
  this._email = value;
};

PusherActivityStreamer._buildListItem = function(activity) {
  var li = $('<li class="activity"></li>');
  li.attr('data-activity-id', activity.id);
  var item = $('<div class="stream-item-content"></div>');
  li.append(item);
  
  var imageInfo = activity.actor.image;
  var image = $('<div class="image">' +
                  '<img src="' + imageInfo.url + '" width="' + imageInfo.width + '" height="' + imageInfo.height + '" />' +
                '</div>');
  item.append(image);
  
  var content = $('<div class="content"></div>');
  item.append(content);
  
  var user = $('<div class="activity-row">' +
                '<span class="user-name">' +
                  '<a class="screen-name" title="' + activity.actor.displayName + '">' + activity.actor.displayName + '</a>' +
                  //'<span class="full-name">' + activity.actor.displayName + '</span>' +
                '</span>' +
              '</div>');
  content.append(user);
  
  var message = $('<div class="activity-row">' +
                    '<div class="text">' + activity.body + '</div>' +
                  '</div>');
  content.append(message);
  
  var time = $('<div class="activity-row">' + 
                '<a href="' + activity.link + '" class="timestamp">' +
                  '<span title="' + activity.published + '">' + PusherActivityStreamer._timeToDescription(activity.published) + '</span>' +
                '</a>' +
                '<span class="activity-actions">' +
                  '<span class="tweet-action action-favorite">' +
                    '<a href="#" class="like-action" data-activity="like" title="Like"><span><i></i><b>Like</b></span></a>' +
                  '</span>' +
                '</span>' +
              '</div>');
  content.append(time);
                
  
  return li;
};