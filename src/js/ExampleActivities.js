function ExampleActivities(activityMonitor, pusher) {
  
  pusher.connection.bind('connected', function() {
    activityMonitor.sendActivity('page-load');
  });
  
  $("#gravatar").slideDown();
  $('ul.activity-stream').removeClass('no-actions');
  
  var defaultEmailValue = 'Email [optional]';
  var emailEl = $('#email');
  emailEl.focus(function() {
    var val = $.trim(emailEl.val());          
    if(val === defaultEmailValue) {
      emailEl.val('');
      activityMonitor.setEmail('');
    }
  });
  emailEl.blur(function() {
    var val = $.trim(emailEl.val());
    if(val.length === 0) {
      emailEl.val(defaultEmailValue);
      activityMonitor.setEmail('');
    }
    else {
      activityMonitor.setEmail(val);
    }
  });
  var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  emailEl.keyup(function() {
    var val = $.trim(emailEl.val());
    var data = null;
    if(emailRegEx.test(val)){
      activityMonitor.setEmail(val);
    }
    else {
      activityMonitor.setEmail('');
    }
  });
  
  $(window).scroll(function() {
    var win = $(this);
    var scrollTop = win.scrollTop();
    if(scrollTop === 0) {
      activityMonitor.sendActivity('scroll', {position: 'top'});
    }
    else if (scrollTop == (document.body.scrollHeight - win.innerHeight())) {
      activityMonitor.sendActivity('scroll', {position: 'bottom'})
    }
  });
  
  $(".activity-actions a").live('click', function() {
    var el = $(this);
    var activityType = el.attr('data-activity');
    var li = el.parents('*[data-activity-id]');
    var id = li.attr('data-activity-id');
    var text = li.find('.text').text();
    activityMonitor.sendActivity(activityType, {id: id, text: text});
    
    return false;
  });
  
};