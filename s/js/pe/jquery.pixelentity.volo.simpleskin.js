(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,location,setInterval,YT,clearInterval,clearTimeout,pixelentity */
	
	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	
	$.pixelentity.peVoloSimpleSkin = {	
		conf: {
			api: false
		} 
	};
	
	function PeVoloSimpleSkin(target, conf) {
		var slider;
		var slides;
		var prevC,nextC,bulletsC;
		var w,h;
		
		function resizeControls() {
			if (!w) {
				setTimeout(resize,100);
				return;
			}
			var offset = 0;
			if (nextC) {
				offset = w-nextC.width()-12;
				nextC.css({top: h-nextC.height()-8,left: offset}).show();
				offset -= (prevC.width()-2);
				prevC.css({top: h-prevC.height()-8,left: offset}).show();
			}
			
			if (bulletsC) {
				bulletsC.css({top: h-bulletsC.height()-12,left: 9}).show();
			}
		}
		
		function prev() {
			slider.prev();
			return false;
		}
		
		function next() {
			slider.next();
			return false;
		}
		
		function jump(el) {
			var idx = el.currentTarget.getAttribute("data-idx");
			slider.show(parseInt(idx,10)+1);
			return false;
		}
		
		function select(idx) {
			if (bulletsC) {
				bulletsC.find("a").removeClass("selected").eq(idx).addClass("selected");
			}			
		}

		
		function change(e,data) {
			select(data.slideIdx-1);
		}


		
		function buildUI() {
			prevC = $('<div class="peVoloPrev"><a href="#"></a></div>').find("a").click(prev).end().hide();
			nextC = $('<div class="peVoloNext"><a href="#"></a></div>').find("a").click(next).end().hide();
			bulletsC = $('<div class="peVoloBullets"></div>').hide();
			for (var i=0;i<slides;i++) {
				bulletsC.append('<a href="#" data-idx="'+i+'"></a>').delegate("a","click",jump);
			}
			select(0);
			target.prepend(prevC).prepend(nextC).prepend(bulletsC);
			resizeControls();
		}

		
		function ready(e,data) {
			slides = data.slides;
			if (slides > 1) {
				buildUI();
			}
		}
		
		function resize() {
			w = target.width();
			h = target.height();
			resizeControls();
		}

		
		
		// init function
		function start() {
			slider = target.addClass("peVolo").wrapInner('<div class="peWrap"></div>').peVolo({api:true});
			slider.bind("ready.pixelentity",ready);
			slider.bind("resize.pixelentity",resize);
			slider.bind("change.pixelentity",change);
		}
		
		$.extend(this, {
			// plublic API
			destroy: function() {
				target.data("peVoloSimpleSkin", null);
				target = undefined;
			}
		});
		
		// initial0ize
		start();
	}
	
	// jQuery plugin implementation
	$.fn.peVoloSimpleSkin = function(conf) {
		
		// return existing instance	
		var api = this.data("peVoloSimpleSkin");
		
		if (api) { 
			return api; 
		}
		
		conf = $.extend(true, {}, $.pixelentity.peVoloSimpleSkin.conf, conf);
		
		// install the plugin for each entry in jQuery object
		this.each(function() {
			var el = $(this);
			api = new PeVoloSimpleSkin(el, conf);
			el.data("peVoloSimpleSkin", api); 
		});
		
		return conf.api ? api: this;		 
	};
	
}(jQuery));