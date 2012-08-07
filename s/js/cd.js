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
	var page = location.href.split(/\//)[3].split(/#/)[0];
	if(page) {
	    if(page.indexOf('.') == -1) {
		page += '/';
	    }
	} else {
	    page = 'index.html';
	}
	$("header ul.nav").find('a[href$="'+page+'"]').parents("li").addClass("active");
    });
// TODO: Add that mobile tag from pixelentity.controller.js ?
//  if mobile, $("html").addClass("mobile");

// This is some cool crazy stuff to fix stuff to the top through scrolling
// Derived from Bootstrap's doc's 'application.js'
$(document).ready(function(){
	// fix sub nav on scroll
	var $win = $(window)
	    , $nav = $('.subnav')
	    , $main = $('.mainContentWrap')
	    , $logo = $('.brand')
	    , navTop = $('.subnav').length && $('.subnav').offset().top - 45
	    , isFixed = 0

	    processScroll()

	    // hack sad times - holdover until rewrite for 2.1
	    $nav.on('click', function () {
		    if (!isFixed) setTimeout(function () {  $win.scrollTop($win.scrollTop() - 47) }, 10)
				      })

	    $win.on('scroll', processScroll)

	    function processScroll() {
	    if($(this).width() < 767) {
		// Narrow device? No fixed nav.
	    } else {
		var i, scrollTop = $win.scrollTop()
		if (scrollTop >= navTop && !isFixed) {
		    isFixed = 1
		    $nav.addClass('subnav-fixed')
		    $main.addClass('subnav-main-spacer')
		    $logo.addClass('scroll-logo')
		    $('img',$logo).hide()
		} else if (scrollTop <= navTop && isFixed) {
		    isFixed = 0
		    $nav.removeClass('subnav-fixed')
		    $main.removeClass('subnav-main-spacer')
		    $logo.removeClass('scroll-logo')
		    $('img',$logo).show()
		}
	    }
	}
    });

// CD-specific JS.