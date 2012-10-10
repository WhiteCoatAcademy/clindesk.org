// Handle our disclaimer & get a cookie, yo.
$(document).ready(function(){
    if (document.cookie.match('disclaimer') != null) {
	$('#disclaimer').hide();
    }
    $('#ackbutton').click(function(){
	var expires = new Date();
	// Quick expires for dev/staging, etc.
	expires.setTime(expires.getTime()+(60*1000));
	if (window.location.host == "www.clindesk.org" ||
	    window.location.host == "www.whitecoatacademy.org") {
	    expires.setTime(expires.getTime()+(24*60*60*1000));
	}
	document.cookie = "disclaimer=Meded_Should_Be_Open;expires=" + expires.toGMTString();
	$('#disclaimer').hide();
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

// This is some cool crazy stuff to fix stuff to the top through scrolling
// Derived from Bootstrap's doc's 'application.js'
$(document).ready(function(){
    // fix sub nav on scroll
    var $win = $(window)
    , $nav = $('.subnav')
    , $main = $('.mainContentWrap')
    , $logo = $('.brand')
    , $scrolllogo = $('.scroll-logo')
    , navTop = $('.subnav').length && $('.subnav').offset().top - 8
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
	    var scrollTop = $win.scrollTop()
	    if (scrollTop >= navTop && !isFixed) {
		isFixed = 1
		$('#slugtext').animate({"padding-left":"160px"},{queue:false,duration:400})
		$nav.addClass('subnav-fixed')
		$main.addClass('subnav-main-spacer')
		$scrolllogo.fadeIn(400)
		$('img',$logo).hide()
	    } else if (scrollTop <= navTop && isFixed) {
		isFixed = 0
		$('#slugtext').animate({"padding-left":"0px"},{queue:false,duration:400})
		$nav.removeClass('subnav-fixed')
		$main.removeClass('subnav-main-spacer')
		$scrolllogo.hide()
		$('img',$logo).show()
	    }
	}
    }
});

// CD-specific JS.