(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,location,setInterval,YT,clearInterval,clearTimeout,pixelentity */
	
	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	
	$.pixelentity.peIsotope = {	
		conf: {
			api: false
		} 
	};
	
	$.Isotope.prototype._fitRowsLayout = function( $elems ) {
		var instance = this,containerWidth = this.element.width(),props = this.fitRows,margin = 0;
		
		$elems.each( function() {
			var $this = $(this),atomW = $this.outerWidth(true),atomH = $this.outerHeight(true);
			
			if (atomW*1.1 > containerWidth) {
				$this.width(containerWidth).data("resized",true).addClass("no-transition");
				atomW = $this.width();
				atomH = $this.height();
			} else if ($this.data("resized")) {
				$this.css("width","").data("resized",false).removeClass("no-transition");
				atomW = $this.width();
				atomH = $this.height();
			}
			
			if ( props.x !== 0 && atomW + props.x > containerWidth ) {
				// if this element cannot fit in the current row
				props.x = 0;
				props.y = props.height;
			}
			
			var mleft = parseInt($this.css("margin-left").replace(/px/,""),10);
			margin = Math.max(margin,mleft);

			if (props.x === 0 && mleft > 0) {
				props.x = -mleft;
			} 
			
			if (props.x > 0 && mleft === 0) {
				props.x += margin;
			}
			
			
			// position the atom
			instance._pushPosition( $this, props.x, props.y );

			props.height = Math.max( props.y + atomH, props.height );
			props.x += atomW;
			
		});
		
    };
	
	function PeIsotope(target, conf) {
		
		var container;
		var filters;
		var isotope;
		
		// init function
		function start() {
			container = target.find(".peIsotopeContainer");
			//container = target;
			$.pixelentity.preloader.load(container,loaded);
		}
		
		function filter(e) {
			var search = e.currentTarget.getAttribute("data-category");
			filters.removeClass("active").filter(e.currentTarget).addClass("active");
			search = search ? ".filter-"+search : "";
			container.isotope({filter: search});
			return false;
		}
		
		function loaded() {
			isotope = container.isotope({
				hiddenStyle: {opacity : 0 },
				visibleStyle: {opacity : 1 }, 
				itemSelector : '.peIsotopeItem',
				layoutMode: "fitRows",
				resizable: false
				}).data("isotope");
			filters = target.find(".peIsotopeFilter a").click(filter);
			setTimeout(resizable,500);
		}
		
		
		function resize() {
			isotope.resize();
			setTimeout(reLayout,1000);
		}
		
		function reLayout() {
			isotope.reLayout();
		}

		
		function resizable() {
			$(window).bind('smartresize.isotope',resize);
			isotope.reLayout();
		}

		
		$.extend(this, {
			// plublic API
			destroy: function() {
				target.data("peIsotope", null);
				target = undefined;
			}
		});
		
		// initialize
		start();
	}
	
	// jQuery plugin implementation
	$.fn.peIsotope = function(conf) {
		
		// return existing instance	
		var api = this.data("peIsotope");
		
		if (api) { 
			return api; 
		}
		
		conf = $.extend(true, {}, $.pixelentity.peIsotope.conf, conf);
		
		// install the plugin for each entry in jQuery object
		this.each(function() {
			var el = $(this);
			api = new PeIsotope(el, conf);
			el.data("peIsotope", api); 
		});
		
		return conf.api ? api: this;		 
	};
	
}(jQuery));