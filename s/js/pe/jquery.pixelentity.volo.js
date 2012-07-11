(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,setInterval,clearInterval,clearTimeout,WebKitCSSMatrix,pixelentity */
	
	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	
	$.pixelentity.peVolo = {	
		conf: {
			api: false,
			count: 1,
			transition: 500
		} 
	};
	
	$.extend($.easing,{
		easeOutQuad: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		}
	});
	
	var style = document.createElement("div").style;
	var prefix,prefixes = ["O","ms","Webkit","Moz"];
	var test,
	 loop,
	 transform = false,
	 transitionDuration = false,
	 use3d = false;
	
	for (var i=0; i<prefixes.length;i++) {
		test = prefixes[i]+"Transform";
		if (test in style) {
			transform = test;
			prefix = prefixes[i];
			continue;
		}
	}
	
	if (transform) {
		use3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
		test = prefix+"Transition";
		transitionDuration = (test in style) ? test : false;
	}
	
	if (!transitionDuration) {
		loop = window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame || 
			window.oRequestAnimationFrame || 
			window.msRequestAnimationFrame ||
			function (callback) {
				setTimeout(callback,25);
			};		
	}
	
	function PeVolo(target, conf) {
		var w;
		var slides = [];
		var max;
		var wrapper;
		var current = 0;
		var from = 0;
		var to = 0;
		var begin = 0;
		var scroller;
		var isScrolling = false;
		var touchX,touchAmountX,touchScrollX;
		var currentPos = 0;
		var delay = 0;
		var pausedFrom = 0;
		var mouseOver = false;
		var timer;
		var minH = 1;
		var maxH = Number.MAX_VALUE;
		var rH = "auto";
		var inited = false;
		var showAtOnce = conf.count;
		var slideWidth;
		
		// init function
		function start() {
			inited = true;

			var tokens = (target.attr("data-height") || "").split(/,| /);
			
			if (tokens[0]) {
				minH = parseInt(tokens[0],10);
			}
			
			if (tokens[1]) {
				rH = tokens[1] === "auto" ? "auto" : parseFloat(tokens[1],10);
			} 
			
			if (tokens[2]) {
				maxH = parseInt(tokens[2],10);
			}
			
			if (rH === 0) {
				if (minH > 1) {
					target.height(minH);
				}
			} else if (rH === "auto") {
				var firstImg = target.find("img:first");
				if (firstImg.length > 0) {
					rH = (firstImg[0].naturalWidth / firstImg[0].naturalHeight)*showAtOnce;
				} else {
					rH = 0;
				}
			}
			
			slideWidth = target.attr("data-slidewidth");
			if (slideWidth) {
				conf.slideWidth = parseInt(slideWidth,10);
			}
			
			wrapper = target.find("> div:eq(0)");
			var allSlides = wrapper.find("> div").each(addSlide);
			scroller = wrapper[0].style;
			max = slides.length;
			resize();
			wrapper.css("visibility","visible");
			allSlides.css("visibility","visible").show();
			$(window).bind("resize",windowHandler);
			target.bind("touchstart touchmove touchend",touchHandler);
			if (target.attr("data-autopause") !== "disabled") {
				target.bind("mouseenter mouseleave",mouseHandler);
			}
			
			if (transitionDuration) {
				target.bind(prefix.toLowerCase()+"TransitionEnd transitionend",setTimer);
			}
			setTimer();
			setTimeout(fireReady,100);
			//target.trigger("resize.pixelentity");
			return true;

		}
		
		function fireReady() {
			target.trigger("ready.pixelentity",{"slides":slides.length});			
		}

		
		function startTimer() {
			if (!inited || delay === 0) {
				return;
			}
			var pause = pausedFrom > 0 ? $.now() - pausedFrom : 0;
			pausedFrom = 0;
			pause = delay - pause;
			if (pause > 0) {
				stopTimer();
				timer = setTimeout(next,pause);				
			} else {
				next();
			}
		}
		
		function pauseTimer() {
			if (!inited) {
				return;
			}
			pausedFrom = $.now();
			stopTimer();
		}
		
		function stopTimer() {
			clearTimeout(timer);
		}
		
		function addSlide(idx,el) {
			slides.push($(el));
		}

		function resize(size) {
			if (!inited) {
				return;
			}
			size = typeof size === "undefined" ? target.width() : size;
			
			if (size === w) {
				return;
			}
			
			w = size;
			
			var slide,img,ratio;
			
			if (slideWidth > 0) {
				showAtOnce = Math.floor(w/200);				
			}
			
			if (showAtOnce > 1) {
				size = Math.floor(w/showAtOnce)*showAtOnce;
				target.css("margin-right",(w-size));
				w = size;
			}
			
			for (var i = 0; i < max; i++) {
				slide = slides[i];
				slide.width(w/showAtOnce);
				if (slide.hasClass("scale")) {
					img = slide.find("img:eq(0)");
					if (img.length > 0) {
						if (transform) {
							ratio = (w/img[0].naturalWidth)/showAtOnce;
							img[0].style[transform] = "scale("+ratio+","+ratio+")";							
						} else {
							img.width(w/showAtOnce);
						}
					}
				}
			}
			wrapper.width(w*max/showAtOnce);
			
			if (rH > 0) {
				var newH = (w/rH)/showAtOnce;
				target.height(Math.max(minH,Math.min(maxH,newH)));
			}
			
			if (!isScrolling) {
				scroll(currentPos,0);
			}
			
			target.trigger("resize.pixelentity");
		}
		
		function next() {
			if (!inited || max <= showAtOnce) {
				return;
			}
			current = (current + 1) % (max-showAtOnce+1);

			jumpTo(current);
		}
		
		function prev() {
			if (!inited || max <= showAtOnce) {
				return;
			}
			current--;
			if (current < 0) {
				current += (max-showAtOnce+1);
			}
			jumpTo(current);
		}

		
		function jumpTo(idx) {
			if (!inited) {
				return;
			}
			current = idx;
			from = to;
			to = 100*(idx/max);
			begin = $.now();
			touchAmountX = 0;
			isScrolling = true;
			target.trigger("change.pixelentity",{"slideIdx":idx+1});
			if (transitionDuration) {
				currentPos = to;
				scroll(to,conf.transition);
			} else {
				tick();				
			}
		}
		
		function scroll(pos,duration) {
			pos =-pos;
			if (transform) {
				if (transitionDuration && typeof duration !== "undefined") {
					scroller[transitionDuration] = duration+"ms";
				}
				scroller[transform] = use3d ? "translate3d("+pos+"%,0,0)" : "translate("+pos+"%,0)";
			} else {
				wrapper.css("margin-left",parseInt(pos*(w*max/showAtOnce)/100,10));
			}
		}
		
		function tick() {
			if (touchAmountX !== 0) {
				return;
			}
			var elapsed = Math.min(conf.transition,$.now()-begin);
			var pos = $.easing.easeOutQuad(0,elapsed,from,to-from,conf.transition);
			currentPos = pos;
			scroll(pos,0);
			setTimer();
			if (elapsed < conf.transition) {
				loop(tick);
			} else {
				setTimer();
			}
		}
		
		function setTimer() {
			isScrolling = false;
			var sdelay = parseInt(slides[current].attr("data-delay"),10)*1000;
			if (sdelay > 0) {
				delay  = sdelay;
				if (mouseOver) {
					pauseTimer();
				} else {
					startTimer();					
				}
				
			}
		}

		
		function touchHandler(e) {
			var type = e.type;
			var te = e.originalEvent;
			
			
			switch (type) {
			case "touchstart":
				if(te.touches.length > 1 || te.scale && te.scale !== 1) {
					return;
				}
				touchX = te.touches[0].pageX;
				touchAmountX = 0;
				break;
			case "touchmove":
				if(te.touches.length > 1 || te.scale && te.scale !== 1) {
					return;
				}
				stopTimer();
				touchAmountX = (te.touches[0].pageX - touchX);
				touchScrollX = currentPos-100*touchAmountX/(w*max);
				e.preventDefault();
				e.stopPropagation();
				scroll(touchScrollX,0);
				break;
			case "touchend":
				
				if (touchAmountX === 0) {
					return;
				}
				
				to = touchScrollX;
				
				var jumped = false;
				
				if (touchAmountX > 10 && current > 0) {
					jumped = true;
					prev();
				}
				
				if (touchAmountX < -10 && current < (max-showAtOnce)) {
					jumped = true;
					next();
				} 
				
				if (!jumped) {
					jumpTo(current);
				}
				
				touchAmountX = 0;
				
				break;
			}
		}

		function mouseHandler(e) {
			if (e.type === "mouseenter") {
				mouseOver = true;
				pauseTimer();
			} else {
				mouseOver = false;
				startTimer();
			}
		}
		
		function windowHandler(e) {
			resize();
		}

		
		function bind() {
			return target.bind.apply(target,arguments);
		}
		
		$.extend(this, {
			// plublic API
			bind: bind,
			show: function (idx) {
				jumpTo(idx-1);
			},
			next: next,
			prev: prev,
			pause: pauseTimer,
			resume: startTimer,
			resize: resize,
			current: function () {
				return current;
			},
			currentPos: function () {
				return currentPos;
			},
			destroy: function() {
				$(window).unbind("resize",windowHandler);
				
				target
					.unbind("touchstart touchmove touchend",touchHandler)
					.unbind("mouseenter mouseleave",mouseHandler)
					.unbind(prefix.toLowerCase()+"TransitionEnd transitionend",setTimer)
					.data("peVolo", null);
				
				target = undefined;
			}
		});
		
		// initialize
		$.pixelentity.preloader.load(target,start);
	}
	
	// jQuery plugin implementation
	$.fn.peVolo = function(conf) {
		
		// return existing instance	
		var api = this.data("peVolo");
		
		if (api) { 
			return api; 
		}
		
		conf = $.extend(true, {}, $.pixelentity.peVolo.conf, conf);
		
		// install the plugin for each entry in jQuery object
		this.each(function() {
			var el = $(this);
			api = new PeVolo(el, conf);
			el.data("peVolo", api); 
		});
		
		return conf.api ? api: this;		 
	};
	
}(jQuery));