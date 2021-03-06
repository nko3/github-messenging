$(document).ready(function() {
  var toId = undefined
    , toName = undefined
    ;

  $('#friends ul li').on('click', function(e) {
    // Remove existing active class
    $('#friends ul li').each(function() {
      $(this).removeClass('active');
    });
    messageTo = $(this).text();
    // Get the github id of this user
    for (var i = 0; i < GM.following.length; i++) {
      if ( GM.following[i].login === messageTo ) {
        toId = GM.following[i].id;
        toName = GM.following[i].login;
      }
    }
    $(this).toggleClass('active');
  });

  $('#messages form button').on('click', function(e) {
    e.preventDefault();
    if ( messageTo === undefined ) {
      return false;
    }

    var message = $("#messages form input[name='new_message']").val();
    if ( message === undefined || message === '' ) {
      return false;
    }

    $.ajax({
      type: "GET",
      url: "/message/add",
      data: { to_id: toId, to_name: toName, message: message },
      success: function(data) { 
        console.log(data);
      }
    });
  });
});
