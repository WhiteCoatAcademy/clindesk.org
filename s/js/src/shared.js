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
	var page = location.href.split(/\//)[3];
	if(page) {
	    if(page.indexOf('.') == -1) {
		page += '/';
	    }
	} else {
	    page = 'index.html';
	}
	var m = $("header ul.nav");
	m.find('a[href$="'+page+'"]').parents("li").addClass("active");
    });
// TODO: Add that mobile tag from pixelentity.controller.js ?
//  if mobile, $("html").addClass("mobile");
