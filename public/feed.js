var MAX_ITEMS = 7;
var ITEMS = 0;

function buildItem(msg) {
  var itemWrapper = $('<div></div>').addClass('category-item').html(msg.item),
      timestamp   = $('<div></div>')
                      .addClass('timestamp')
                      .html( (new Date(msg.timestamp)).toLocaleString() );

  var inserted = $('<li></li>')
    .css(
      {
        display: 'none',
        opacity : '0px'
      })
    .addClass(msg.category)
    .append(timestamp)
    .append(itemWrapper);

  return inserted;
}

function fadeInOneItem(msg, list, animate){
  //add to top of list as invisible
  var item = buildItem(msg)
  item.prependTo(list);
  ITEMS += 1;

  //remove the last item if we're at our max
  while(ITEMS > MAX_ITEMS){
    if(animate) {
      list.children(':last').fadeOut(function(){
        $(this).remove();
      });
    } else {
      list.children(':last').remove();
    }
    ITEMS--;
  }

  if(animate) {
    //animate in the new item
    item
      .slideDown({queue:false, duration:700})
      .animate( {opacity:1}, {queue:false, duration:800} );
  }
}

function fillFeed(queue, queueName) {
  var qul = $('<ul></ul>').attr('id', queueName + '_list').addClass('category-list');
  queue.forEach(function(e) {
    fadeInOneItem(queue.pop(), qul, false);
  });
  $list.append(qul);
}

function msgReceived(msg){
  if(msg.clients) {
    $clientCounter.html(msg.clients);

  } else if(msg.item) {
    var animate_category = (msg.item.category == $visible_category);
    fadeInOneItem(msg.item, $('#' + msg.item.category + '_list'), animate_category);
    fadeInOneItem(msg.item, $('#all_list'), !animate_category);

  } else if(msg.queues) {
    var categories = Object.keys(msg.queues)

    categories.forEach(function(category) {
      if(msg.queues[category]) {
        var q = Queue.coerceToQueue(msg.queues[category]);
        fillFeed(q, category);
      }
    });

    $('#all_list > li').css({ opacity: 1 }).show();

  } else if(msg.apps){
    var styles = "<style type='text/css'>"

    var apps = Object.keys(msg.apps);
    apps.forEach(function (app){
      styles = styles + ' .' + msg.apps[app].token + ' {color:'+msg.apps[app].color+';}'
      $categories.append('<li class='+msg.apps[app].token +'>' + msg.apps[app].name + '</li>');
    });
    $(styles + '</style>').appendTo('head');
  }
}

$(document).ready(function () {
  $list = $("#feed_list");
  $categories = $("#category_list");
  $clientCounter = $("#client_count");
  $visible_category = 'all';

  var socket = new io.Socket(null, {port: 3000});
  socket.connect();
  socket.on('message', function(msg){
    msgReceived(msg);
  });
});
