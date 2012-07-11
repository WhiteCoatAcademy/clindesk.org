(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,location,setInterval,YT,clearInterval,clearTimeout,pixelentity */
	
	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	
	$.pixelentity.peThemeContactForm = {	
		conf: {
			api: false
		} 
	};
	
	var ajaxurl = window.peContactForm ? decodeURIComponent(window.peContactForm.url) : false;
	var validateRegexps = {
			"email": /^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$/,
			"default": /.{4}/ 
		};
	
	function PeThemeContactForm(target, conf) {
		var fields = [];
		var msgOK,msgKO;
		
		// init function
		function start() {
			target
				.bind("submit",submit)
				.find("input,textarea")
				.each(addField)
				.bind("change",inlineValidation)
				.end();
			
			msgOK = $("#contactFormSent");
			msgKO = $("#contactFormError");
		}
		
		function addField() {
			var el = $(this);
			if (el.attr("type") == "submit") {
				return;
			}
			fields.push(el);
			el.attr("data-fieldID",fields.length-1);
		}
		
		function inlineValidation() {
			validate(fields[this.getAttribute("data-fieldID")]);
			return true;
		}
		
		function validate(field,submit) {
			var val = field.val();
			var type = field.attr("data-validation");
			var ok = true;
			if (val === "") {
				if (field.hasClass("required")) {
					ok = false;
				}
			} else {
				var rule = validateRegexps[type] ? validateRegexps[type] : validateRegexps["default"];
				ok = (val.match(rule) !== null);
			}
			
			var action = ok ? "removeClass" : "addClass";
			field[action]("error");
			field.closest(".control-group")[action]("error");
			return ok;
		}
		
		function submit(e) {
			var ok = true;
			var data = {};
			var val;
			var i;
			
			for (i=0; i<fields.length; i++){
				ok = validate(fields[i],true) && ok;
				if (ok) {
					val = fields[i].val();
					data[fields[i].attr("name")] = val;
				}
			}
			target.find("span.error")[ok ? "hide" : "show"]().end();
			target.find("span.success")[ok ? "show" : "hide"]().end();
			if (ok) {
				send(data);
				msgKO.hide();
			} else {
				msgKO.show();
			}
			return false;
		}
		
		function send(data) {
			jQuery.post(
				ajaxurl || target.attr("action"),
				{
					action : 'peThemeContactForm',
					data : data
				},
				result
			);
		}
		
		function result(response) {
			if (response.success) {
				for (var i=0; i<fields.length; i++){
					fields[i].val("");
				}
				msgOK.show();
				msgKO.hide();
			} else {
				msgKO.show();
				msgOK.hide();
			}
		}

		
		$.extend(this, {
			// plublic API
			destroy: function() {
				target.data("peThemeContactForm", null);
				target = undefined;
			}
		});
		
		// initialize
		start();
	}
	
	// jQuery plugin implementation
	$.fn.peThemeContactForm = function(conf) {
		
		// return existing instance	
		var api = this.data("peThemeContactForm");
		
		if (api) { 
			return api; 
		}
		
		conf = $.extend(true, {}, $.pixelentity.peThemeContactForm.conf, conf);
		
		// install the plugin for each entry in jQuery object
		this.each(function() {
			var el = $(this);
			api = new PeThemeContactForm(el, conf);
			el.data("peThemeContactForm", api); 
		});
		
		return conf.api ? api: this;		 
	};
	
}(jQuery));