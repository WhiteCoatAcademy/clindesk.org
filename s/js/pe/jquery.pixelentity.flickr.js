// some code borrowed from jquery.tweet.js (MIT LICENSE)- See http://tweet.seaofclouds.com/ or https://github.com/seaofclouds/tweet for more info
(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */

	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	
	$.pixelentity.flickr = {	
		conf: { 
			userID: "",
			callback: false,
			count: 6,
			cols: 3,
			api: false
		} 
	};
	
	var storage = $.jStorage;
	
	// 30 minutes;
	var expire = 30*60*1000;
	
	function PeFlickr(target, conf) {
		var key;
	
		
		function start() {
			if (!conf.userID) {
				return;
			}
			key = "peFlickr"+conf.userID;
			var cache = storage ? storage.get(key) : false;
			if (cache) {
				if (cache.photos) {
					// cache lasts 10 minutes
					if (($.now() - cache.time) > expire) {
						fetch();
					} else {
						parse(cache.photos);
					}
				} else {
					if (typeof cache == "array") {
						storage.get(key).push(parse);
					} else {
						fetch();
					}
				}
			} else {
				fetch();
			}
		}
		
		function fetch() {
			if (storage) {
				storage.set(key,[]);
			}	
			$.getJSON(getUrl(), show);
		}
		
		function getUrl() {
			var proto = ('https:' == document.location.protocol ? 'https:' : 'http:');
			return proto+'//api.flickr.com/services/feeds/photos_public.gne?id='+conf.userID+'&lang=en-us&format=json&jsoncallback=?';
		}
		
		function show(content) {
			parse(content);
			if (storage) {
				if (storage.get(key).length > 0) {
					var widget;
					while ((widget = storage.get(key).pop())) {
						widget(content);
					}
				}
				storage.set(key, {
					time: $.now(),
					photos: content
				});
			}
		}
		
		function parse(content) {
		
			var current;
			var html = [];
			var i;
			var img;
			
			for (i=0;i<conf.count;i++) {
				current = content.items[i];
				if (!current) {
					break;
				}
				img = current.media.m.replace("_m.","_s.");
				html.push('<a style="background-image: url('+img+')" class="'+((i % conf.cols === 0) ? "first" : "")+'" href="'+current.link+'" target="_blank"><img width="58" height="58" src="img/blank.png"/></a>');
				//html.push('<a class="'+((i % conf.cols === 0) ? "first" : "")+'" href="'+current.link+'" target="_blank"><img width="58" height="58" src="'+img+'"/></a>');
			}
			var n = html.length;
			if (n > 0) {
				
				var lower = Math.max((Math.floor(n / conf.cols)-1)*conf.cols,0);
				
				for (i=lower;i<n;i++) {
					html[i] = html[i].replace('class="','class="lower ');
				}
				
				target.html(html.join(""));
				if (conf.callback) {
					conf.callback();
				}
			}
		}
		
		$.extend(this, {
			destroy: function() {
				target.data("peFlickr", null);
				target = undefined;	
			}
		});
		
		start();
		
	}
	
	// jQuery plugin implementation
	$.fn.peFlickr = function(conf) {
	
		// return existing instance	
		var api = this.data("peFlickr");
		
		if (api) { 
			return api; 
		}

		conf = $.extend(true, {}, $.pixelentity.flickr.conf, conf);
		
		this.each(function() {
			api = new PeFlickr($(this), conf);
			$(this).data("peFlickr", api); 
		});
		
		return conf.api ? api: this;		 
	};
	
		
}(jQuery));