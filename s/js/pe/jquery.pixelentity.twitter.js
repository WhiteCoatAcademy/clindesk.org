// some code borrowed from jquery.tweet.js (MIT LICENSE)- See http://tweet.seaofclouds.com/ or https://github.com/seaofclouds/tweet for more info
(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */

	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	
	$.pixelentity.twitter = {	
		conf: { 
			username: "",
			topDate: false,
			callback: false,
			count: 3,
			api: false
		} 
	};
	
	var storage = $.jStorage;
	
	var filters = {
			url : {
				// See http://daringfireball.net/2010/07/improved_regex_for_matching_urls
				from: /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi,
				to: '<a href="$1" target="_blank">$1</a>'
			},
			user: {
				from: /@(\w+)/gi,
				to: '<a href="http://twitter.com/$1" target="_blank">@$1</a>'
			},
			hash: {
				from: /(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi,
				to:' <a href="http://search.twitter.com/search?q=&tag=$1&lang=all&from=[USERNAME]" target="_blank">#$1</a>'
			}
		};
	
	// 30 minutes;
	var expire = 30*60*1000;
	
	function ago(date) {
		var delta = parseInt(($.now() - Date.parse(date.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'))) / 1000, 10);
		var r = '';
		if (delta < 60) {
			r = delta + ' seconds';
		} else if(delta < 120) {
			r = '1 minute';
		} else if(delta < (45*60)) {
			r = (parseInt(delta / 60, 10)).toString() + ' minutes';
		} else if(delta < (2*60*60)) {
			r = '1 hour';
		} else if(delta < (24*60*60)) {
			r = '' + (parseInt(delta / 3600, 10)).toString() + ' hours';
		} else if(delta < (48*60*60)) {
			r = '1 day';
		} else {
			r = (parseInt(delta / 86400, 10)).toString() + ' days';
		}
		return r;
    }
	
	function PeTwitter(target, conf) {
		var key;
	
		
		function start() {
			if (!conf.username) {
				return;
			}
			key = "peTwitter"+conf.username;
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
			//return "twitter.js";
			var proto = ('https:' == document.location.protocol ? 'https:' : 'http:');
			var retweets = false;
			return proto+'//api.twitter.com/1/statuses/user_timeline.json?screen_name='+conf.username+'&count='+10+(retweets ? '&include_rts=1' : '')+'&callback=?';
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
					tweets: content
				});
			}
		}
		
		function parse(content) {
		
			var current;
			var html = [];
			var links;
			var text;
			var max = Math.min(conf.count,content.length);
			for (var i=0;i<max;i++) {
				current = content[i];
				text = current.text;
				if (!current) {
					break;
				}
				
				for (var filter in filters) {
					text = text.replace(filters[filter].from,filters[filter].to);
				}
				text = text.replace("[USERNAME]",conf.username);
				if (conf.topDate) {
					html.push('<p class="tweet">'+'<span>'+ago(current.created_at)+' ago</span>'+text+'</p>');					
				} else {
					html.push('<p class="tweet">'+text+'<span>'+ago(current.created_at)+' ago</span></p>');					
				}
			}
			if (html.length > 0) {
				html[html.length-1] = html[html.length-1].replace('class="tweet"','class="tweet last"');
				target.html(html.join(""));
				if (conf.callback) {
					conf.callback();
				}
			}
		}
		
		$.extend(this, {
			destroy: function() {
				target.data("peTwitter", null);
				target = undefined;	
			}
		});
		
		start();
		
	}
	
	// jQuery plugin implementation
	$.fn.peTwitter = function(conf) {
	
		// return existing instance	
		var api = this.data("peTwitter");
		
		if (api) { 
			return api; 
		}

		conf = $.extend(true, {}, $.pixelentity.twitter.conf, conf);
		
		this.each(function() {
			api = new PeTwitter($(this), conf);
			$(this).data("peTwitter", api); 
		});
		
		return conf.api ? api: this;		 
	};
	
		
}(jQuery));