// Handle our disclaimer & get a cookie, yo.
$(document).ready(function(){
	if (document.cookie.match('disclaimer') != null) {
	    $('#disclaimer').hide();
	}
	$('#ackbutton').click(function(){
		$.ajax({
			type: "POST",
			    url: "/setcookie",
			    success: function() {
			    $('#disclaimer').hide();
			}
		    });
	    });
    });


// Auto-tab highlighting.
$(document).ready(function(){
	
    };