'use strict';

// Hide disclaimer if cookie is set
if (document.cookie.match('disclaimer') !== null) {
    $('#disclaimer').hide();
}

// Set cookie on disclaimer dismissal
$('#ackbutton').click(function(){
    var expires = new Date();
    expires.setTime(expires.getTime()+(24*60*60*1000));
    document.cookie = 'disclaimer=Meded_Should_Be_Open;expires=' + expires.toGMTString();
    $('#disclaimer').hide();
});
