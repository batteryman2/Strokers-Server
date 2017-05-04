if(dpUI===undefined)
	var dpUI={data:{},options:{}};
	

dpUI.numberPicker = function(selector, options){
	var defaults = {
		start: 1,
		min: false,
		max: 12,
		step: 1,
		increaseText: "+",
		decreaseText: "-",
	};
	$(selector).each(function(){
		var el = this;
		var np = $(el);
		el.options = $.extend(defaults, options);
		el.number = el.options.start;
		el.lastTouch=0;
		np.addClass("dpui-numberPicker").html("<button class='dpui-numberPicker-decrease'>"+el.options.decreaseText+"</button><input type='text' class='dpui-numberPicker-input' /><button class='dpui-numberPicker-increase'>"+el.options.increaseText+"</button>");
		var input = np.find(".dpui-numberPicker-input");
		input.val(el.number+"");
		if(el.options.min!==false&&el.options.start==el.options.min)np.addClass("dpui-numberPicker-min");
		if(el.options.max!==false&&el.options.start==el.options.max)np.addClass("dpui-numberPicker-max");
		
		
		function set(num){
			np.removeClass("dpui-numberPicker-min").removeClass("dpui-numberPicker-max");
			if(el.options.min!==false&&num<=el.options.min){
				np.addClass("dpui-numberPicker-min");
				el.number = el.options.min;
			} else if(el.options.max!==false&&num>=el.options.max){
				np.addClass("dpui-numberPicker-max");
				el.number = el.options.max;
			} else {
				el.number = num;
			}
			input.val(el.number+"");
		};

		el.set = function(number){
			set(number);
		};
		el.increase = function(){
			set(el.number+el.options.step);
		};
		el.decrease = function(){
			set(el.number-el.options.step);
		};
		el.doubledec = function( e ){
			var t2 = e.timeStamp
		  , t1 = el.lastTouch || t2
		  , dt = t2 - t1
		  , fingers = e.originalEvent.touches.length;
			el.lastTouch = t2;
			if (!dt || dt > 500 || fingers > 1) 
				return; // not double-tap
			e.preventDefault(); // double tap - prevent the zoom also synthesize click events we just swallowed up
//			console.log("double-dec");
			set(el.number-1);
		};

		el.doubleinc = function( e ){
			var t2 = e.timeStamp
		  , t1 = el.lastTouch || t2
		  , dt = t2 - t1
		  , fingers = e.originalEvent.touches.length;
			el.lastTouch = t2;
			if (!dt || dt > 500 || fingers > 1) 
				return; // not double-tap
			e.preventDefault(); // double tap - prevent the zoom also synthesize click events we just swallowed up
//			console.log("double-inc");
			set(el.number+1);
		};

		np.find(".dpui-numberPicker-decrease").on("touchstart", el.doubledec);
		np.find(".dpui-numberPicker-increase").on("touchstart", el.doubleinc);
		np.find(".dpui-numberPicker-decrease").on("click", el.decrease);
		np.find(".dpui-numberPicker-increase").on("click", el.increase);
		input.on("change", function(){
			el.set(input.val());
		});
	});
};
(function($){
	$.fn.dpNumberPicker = function(options){
		if(typeof(options)=="string"){
			if(options.toLowerCase()=="increase")this.each(function(){this.increase();});
			else if(options.toLowerCase()=="decrease")this.each(function(){this.decrease();});
			else if(options.toLowerCase()=="set"&&arguments.length>1){
				var n = arguments[1];
				this.each(function(){this.set(n)});
			}
		} else dpUI.numberPicker(this.selector, options);
	};
}(jQuery));


(function( $ ){
	$.fn.labelauty = function(){

		return this.each(function()
		{
			var $object = $( this );
			var selected = $object.is(':checked');
			var label;
			var input_id;
			$object.addClass('labelauty');
			label = $object.attr( "data-labelauty" );
			
			$object.css({ display : "none" });	// Start hiding ugly checkboxes
			$object.removeAttr( "data-labelauty" );
			
			input_id = $object.attr( "id" );	// If there's no ID Attribute, then generate a new one

			if( input_id == null || input_id.trim() === "")
			{
				var input_id_number = 1 + Math.floor( Math.random() * 1024000 );
				input_id = "labelauty-" + input_id_number;
				while( $( input_id ).length !== 0 )
				{
					input_id_number++;
					input_id = "labelauty-" + input_id_number;
				}
				$object.attr( "id", input_id );
			}

			var element = jQuery(create( input_id, selected, label ));
			

			element.click(function(){
				if($object.is(':checked')){
					$(element).attr('aria-checked', false);
				}else{
					$(element).attr('aria-checked', true);
				}
			});
			
			element.keypress(function(event){
				event.preventDefault();
				if(event.keyCode === 32 || event.keyCode === 13){		
					if($object.is(':checked')){
						$object.prop('checked', false);
						$(element).attr('aria-checked',false);
					}else{
						$object.prop('checked', true);
						$(element).attr('aria-checked', true);
					}
				}
			});
			$object.after(element);
		});
	};

	function create( input_id, selected, label)
	{	
		return '<label for="' + input_id + '" >' + '<span class="labelauty-unchecked-image"></span>' + '<span class="labelauty-unchecked">' + label + '</span>' +
						'<span class="labelauty-checked-image"></span>' +'<span class="labelauty-checked">' + label + '</span>' +	'</label>';
	}

}( jQuery ));

(function($) {
  $.fn.nodoubletapzoom = function() {
	  $(this).bind('touchstart', function preventZoom(e) {
		var t2 = e.timeStamp
		  , t1 = $(this).data('lastTouch') || t2
		  , dt = t2 - t1
		  , fingers = e.originalEvent.touches.length;
		$(this).data('lastTouch', t2);
		if (!dt || dt > 500 || fingers > 1) 
			return; // not double-tap
		e.preventDefault(); // double tap - prevent the zoom also synthesize click events we just swallowed up
//		console.log("trigger");
//		$(this).set(20);
		$(this).trigger('click').trigger('click');
	  });
  };
})(jQuery);	


(function( $ ){

	$.fn.rwschk = function( options )
	{
		/*
		 * Our default settings
		 * Hope you don't need to change anything, with these settings
		 */
		var settings = $.extend(
		{
			// Development Mode
			// This will activate console debug messages
			development: false,

			// Trigger Class
			// This class will be used to apply styles
			class: "rwschk",

			// Use icon?
			// If false, then only a text label represents the input
			icon: true,

			// Use text label ?
			// If false, then only an icon represents the input
			label: true,

			// Separator between labels' messages
			// If you use this separator for anything, choose a new one
			separator: "|",

			// Default Checked Message
			// This message will be visible when input is checked
			checked_label: "Checked",

			// Default UnChecked Message
			// This message will be visible when input is unchecked
			unchecked_label: "Unchecked",

			// Force random ID's
			// Replace original ID's with random ID's,
			force_random_id: false,

			// Minimum Label Width
			// This value will be used to apply a minimum width to the text labels
			min_width: false,

			// Use the greatest width between two text labels ?
			// If this has a true value, then label width will be the greatest between labels
			same_width: false,
			
			margin_set:false,

			onChange: function(){},

//			same_width: true
		}, options);

		/*
		 * Let's create the core function
		 * It will try to cover all settings and mistakes of using
		 */
		return this.each(function()
		{
			var $object = $( this );
			var selected = $object.is(':checked');
			var type = $object.attr('type');
			var use_icons = true;
			var use_labels = true;
			var labels;
			var wolf=false;
			var popping=false;
			var pelosi=false;
			var user=false;
			var labels_object;
			var input_id;
			
			//Get the aria label from the input element
			var aria_label = $object.attr( "aria-label" );
			
			// Hide the object form screen readers
			$object.attr( "aria-hidden", true );
			
			// Test if object is a check input
			// Don't mess me up, come on
			if( $object.is( ":checkbox" ) === false && $object.is( ":radio" ) === false )
				return this;

			// Add "rwschk" class to all checkboxes
			// So you can apply some custom styles
			$object.addClass( settings.class );
			
			// Get the value of "data-rwschk" attribute
			// Then, we have the labels for each case (or not, as we will see)
			labels = $object.attr( "data-rwschk" );
			if($object.attr( "data-wolf" ))
				wolf = true;
			if($object.attr( "data-pelosi" ))
				pelosi = true;
			if($object.attr( "data-popping" ))
				popping=true;
			if($object.attr( "data-user" ))
				user = true;
			
			use_labels = settings.label;
			use_icons = settings.icon;

			// It's time to check if it's going to the right way
			// Null values, more labels than expected or no labels will be handled here
			if( use_labels === true )
			{
				if( labels == null || labels.length === 0 )
				{
					// If attribute has no label and we want to use, then use the default labels
					labels_object = [settings.unchecked_label, settings.checked_label]
				}
				else
				{
					// Ok, ok, it's time to split Checked and Unchecked labels
					// We split, by the "settings.separator" option
					labels_object = labels.split( settings.separator );

					// Now, let's check if exist _only_ two labels
					// If there's more than two, then we do not use labels :(
					// Else, do some additional tests
					if( labels_object.length > 2 )
					{
						use_labels = false;
						debug( settings.development, "There's more than two labels. rwschk will not use labels." );
					}
					else
					{
						// If there's just one label (no split by "settings.separator"), it will be used for both cases
						// Here, we have the possibility of use the same label for both cases
						if( labels_object.length === 1 )
							debug( settings.development, "There's just one label. rwschk will use this one for both cases." );
					}
				}
			}

			/*
			 * Let's begin the beauty
			 */

			// Start hiding ugly checkboxes
			// Obviously, we don't need native checkboxes :O
			$object.css({ display : "none" });
						
			// We don't need more data-rwschk attributes!
			// Ok, ok, it's just for beauty improvement
			$object.removeAttr( "data-rwschk" );
			
			// Now, grab checkbox ID Attribute for "label" tag use
			// If there's no ID Attribute, then generate a new one
			input_id = $object.attr( "id" );

			if( settings.force_random_id || input_id == null || input_id.trim() === "")
			{
				var input_id_number = 1 + Math.floor( Math.random() * 1024000 );
				input_id = "rwschk-" + input_id_number;

				// Is there any element with this random ID ?
				// If exists, then increment until get an unused ID
				while( $( input_id ).length !== 0 )
				{
					input_id_number++;
					input_id = "rwschk-" + input_id_number;
					debug( settings.development, "Holy crap, between 1024 thousand numbers, one raised a conflict. Trying again." );
				}

				$object.attr( "id", input_id );
			}

			// Now, add necessary tags to make this work
			// Here, we're going to test some control variables and act properly
			
			var element = jQuery(create( user, popping, wolf, pelosi, settings.class, input_id, aria_label, selected, type, labels_object, use_labels, use_icons ));
			
			element.click(function(event){
				if($object.is(':checked')){
					$(element).attr('aria-checked', false);
					settings.onChange.call(this, event,this.htmlFor);
				}else{
					$(element).attr('aria-checked', true);
					settings.onChange.call(this, event, this.htmlFor);
				}
			});
			
			element.keypress(function(event){
				event.preventDefault();
				if(event.keyCode === 32 || event.keyCode === 13){		
					if($object.is(':checked')){
						$object.prop('checked', false);
						$(element).attr('aria-checked',false);
					}else{
						$object.prop('checked', true);
						$(element).attr('aria-checked', true);
					}
				}
			});
			
			$object.after(element);
			
			// Now, add "min-width" to label
			// Let's say the truth, a fixed width is more beautiful than a variable width
			if( settings.min_width !== false )
//				$object.next( "label[for=" + input_id + "]" ).css({ "min-width": settings.min_width });
				$object.next( "label[for=" + input_id + "]" ).css({ "width": settings.min_width });
				
			if(	settings.margin_set !== false )
				$object.next( "label[for=" + input_id + "]" ).css({ "margin": settings.margin_set});

			// Now, add "min-width" to label
			// Let's say the truth, a fixed width is more beautiful than a variable width
			if( settings.same_width != false && settings.label == true )
			{
				var label_object = $object.next( "label[for=" + input_id + "]" );
				var unchecked_width = getRealWidth(label_object.find( "span.rwschk-unchecked" ));
				var checked_width = getRealWidth(label_object.find( "span.rwschk-checked" ));

				if( unchecked_width > checked_width )
					label_object.find( "span.rwschk-checked" ).width( unchecked_width );
				else
					label_object.find( "span.rwschk-unchecked" ).width( checked_width );
			}
		});
	};

	/*
	 * Tricky code to work with hidden elements, like tabs.
	 * Note: This code is based on jquery.actual plugin.
	 * https://github.com/dreamerslab/jquery.actual
	 */
	function getRealWidth( element )
	{
		var width = 0;
		var $target = element;
		var style = 'position: absolute !important; top: -1000 !important; ';

		$target = $target.clone().attr('style', style).appendTo('body');
		width = $target.width(true);
		$target.remove();

		return width;
	}

	function debug( debug, message )
	{
		if( debug && window.console && window.console.log )
			window.console.log( "jQuery-rwschk: " + message );
	}

	function create( user, popping, wolf, pelosi, myclass, input_id, aria_label, selected, type, messages_object, label, icon )
	{	
		var block;
		var unchecked_message;
		var checked_message;
		var aria = "";
		var pops = '';
		var wolfs = '';
		

		
		if( messages_object == null )
			unchecked_message = checked_message = "";
		else
		{
			unchecked_message = messages_object[0];

			// If checked message is null, then put the same text of unchecked message
			if( messages_object[1] == null )
				checked_message = unchecked_message;
			else
				checked_message = messages_object[1];
		}
		
		if(aria_label == null)
			aria = "";	
		else
			aria = 'tabindex="0" role="' + type + '" aria-checked="' + selected + '" aria-label="' + aria_label + '"';
			
/*		block = '<label for="' + input_id + '" ' + aria + '>' +
						'<span class="'+myclass+'-pop"></span>' +
						'<span class="'+myclass+'-unchecked-image"></span>' +
						'<span class="'+myclass+'-unchecked">' + unchecked_message + '</span>' +
						'<span class="'+myclass+'-checked-image"></span>' +
						'<span class="'+myclass+'-checked">' + checked_message + '</span>' +
						'<span class="'+myclass+'-wolf"></span>' +
					'</label>';
*/
		if(user)
			pops = '<span class="'+myclass+'-user"></span>';
		if(popping)
			pops = '<span class="'+myclass+'-pop"></span>';
		if(wolf)
			wolfs = '<span class="'+myclass+'-wolf"></span>';
		if(pelosi)
			wolfs = '<span class="'+myclass+'-pelosi"></span>';
					
		block = '<label for="' + input_id + '" ' + aria + '>' +
						'<span class="'+myclass+'-unchecked-image"></span>' +
						'<span class="'+myclass+'-checked-image"></span>' + pops  +
						'<span class="'+myclass+'-msg">' + unchecked_message + '</span>' + wolfs +
					'</label>';


		
/*		block = '<label for="' + input_id + '" ' + aria + '>' +
				'<span class="'+myclass+'-unchecked-image"></span>' +
				'<span class="'+myclass+'-unchecked">' + unchecked_message + '</span>' +
				'<span class="'+myclass+'-checked-image"></span>' +
				'<span class="'+myclass+'-checked">' + checked_message + '</span>' +
				'</label>';
*/
		return block;
	}

}( jQuery ));

