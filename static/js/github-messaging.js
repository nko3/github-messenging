$(document).ready(function() {
  var messageTo
    ;

  $('#friends ul li').on('click', function(e) {
    // Remove existing active class
    $('#friends ul li').each(function() {
      $(this).removeClass('active');
    });
    messageTo = $(this).text();
    $(this).toggleClass('active');
  });
});
