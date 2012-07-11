(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,location,setInterval,YT,clearInterval,clearTimeout,pixelentity */
	
	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	
	$.pixelentity.peNewsletter = {	
		conf: {
			api: false
		} 
	};
	
	var validateRegexps = {
			email: /^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$/,
			"default": /.{4}/ 
		};

	
	function PeNewsletter(target, conf) {
		
		var defaultMessage;
		var subscribedMessage;
		var newsletterForm;
		var email;

		
		// init function
		function start() {
			defaultMessage = target.attr("data-default") || "";
			subscribedMessage = target.attr("data-subscribed");
			newsletterForm = target.is("form") ? target : target.find("form");
			
			email = newsletterForm.find('input[name="email"]');
			if (defaultMessage) {
				email.val(defaultMessage).focus(signUp).focusout(restore);				
			}
			
			newsletterForm.change(signUp);
			newsletterForm.submit(signUpAndSend);

		}
		
		/* newsletter code */
		function newsletter(send) {
			var check = true;
			
			if (email.val() == defaultMessage || email.val() == subscribedMessage) {
				email.val("");
				email.removeClass("error").closest(".control-group").removeClass("error").removeClass("success");
				if (!send) {
					check = false;
				}
			} 
			
			if (check) {
				if(validateRegexps.email.test(email.val())) {
					// valid mail
					email.removeClass("error").closest(".control-group").removeClass("error");
					if (send) {
						$.post(target.attr("action"), newsletterForm.serialize(), function(data) {
							email.removeClass("error").closest(".control-group").addClass("success");
							email.val(subscribedMessage);
							if (!defaultMessage) {
								email.one("focus",signUp);
							}
						});
						email.val("sending");
					}
					
				} else {
					// invalid mail
					email.addClass("error").closest(".control-group").addClass("error");
				}
			}
			
			
			return false;
		}
		
		function restore(e) {
			var jqEl = $(e.currentTarget);
			if (jqEl.val() === "") {
				jqEl.val(defaultMessage);
				email.removeClass("error").closest(".control-group").removeClass("error");
			}
			return true;
		}
		
		function signUp() {
			return newsletter(false);
		}
		
		function signUpAndSend() {
			return newsletter(true);
		}

		
		$.extend(this, {
			// plublic API
			destroy: function() {
				target.data("peNewsletter", null);
				target = undefined;
			}
		});
		
		// initialize
		start();
	}
	
	// jQuery plugin implementation
	$.fn.peNewsletter = function(conf) {
		
		// return existing instance	
		var api = this.data("peNewsletter");
		
		if (api) { 
			return api; 
		}
		
		conf = $.extend(true, {}, $.pixelentity.peNewsletter.conf, conf);
		
		// install the plugin for each entry in jQuery object
		this.each(function() {
			var el = $(this);
			api = new PeNewsletter(el, conf);
			el.data("peNewsletter", api); 
		});
		
		return conf.api ? api: this;		 
	};
	
}(jQuery));