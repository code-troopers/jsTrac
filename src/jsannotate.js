/**
 * jsAnnotate
 * A Javascript interface to annotate your webpages
 * Copyright © 2012 SRMVision https://www.srmvision.com/
 * Licensed MIT, see license.txt
 * 
 * Partly based on jsfeedback by Niklas von Hertzen.
 * http://hertzen.com/experiments/jsfeedback/
 * Modified by Romain Laï-King
 * @version 1.1
 */

 /**
  * Convert a SVG to PNG.
  * Utility method used in jsAnnotate but can also be useful for preprocessing.
  * @see http://code.google.com/p/canvg/
  * @param svg the svg to convert. See canvg for details on format.
  * @param width width of the svg
  * @param height height of the svg
  */

 function svg2png(svg,width,height){
    $('body').append("<canvas id='svgCanvas' width='"+width+"' height='"+height+"' ></canvas>");
    var canvas = document.getElementById('svgCanvas');
    canvg(canvas,svg);
	var ctx = document.getElementById('svgCanvas').getContext('2d');
	var img=ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
    var base64 = canvas.toDataURL('image/png');
    $('#svgCanvas').remove();
    return base64;
 }


(function($) {
	
	

	/**
	 * Based on http://stackoverflow.com/questions/3582344/draw-a-connection-line-in-raphaeljs 
	 * and  http://taitems.tumblr.com/post/549973287/drawing-arrows-in-raphaeljs
	 * Mixed the 2 to create an arrow
	 * This function draw arrows by dragging
	 * @class Line
	 * @param startX X coordinate of starting point
	 * @param startY Y coordinate of starting point
	 * @param endX X coordinate of the arrow end
	 * @param endY Y coordinate of the arrow end
	 * @param raphael the raphael canvas
	 */



	function Line(startX, startY, endX, endY, raphael) {
	    var start = {
	        x: startX,
	        y: startY
	    };
	    var end = {
	        x: endX,
	        y: endY
	    };
	    var getPath = function() {

	        return "M" + start.x + " " + start.y + " L" + end.x + " " + end.y  ;
	    };
		//Using the provided arrow end of raphaeljs doesn't work with svg2png, so we draw a path for the arrow
	    var getArrowPath = function() {
	            size=10;
	            return "M "+ end.x + " " + end.y + " L " + (end.x - size) + " " + (end.y - size) +  " L " + (end.x - size) + " " + (end.y + size) + " L " +     end.x + " " + end.y + " Z" ;
	        };
	    var redraw = function() {
	        var angle = Math.atan2(start.x-end.x,end.y-start.y);
	        angle = (angle / (2 * Math.PI)) * 360;

	        var angle = Raphael.angle(start.x,start.y,end.x,end.y);
	        arrow.attr("path",getArrowPath());
	        arrow.transform("r"+(angle+180)+","+end.x+","+end.y);
	        node.attr("path", getPath());
	    }


	    var node = raphael.path(getPath());
	    var arrow = raphael.path(getArrowPath());


	    arrow.attr("stroke","#ff0000");
	    arrow.attr("fill","#ff0000");
	    //We use jQuery's attr method for stroke-width, Raphael's attr generates errors in the console log.
	    $('#arrowOverlay').find('path').attr("stroke-width","7");
	    node.attr("stroke","#ff0000");
	    return {
	        updateStart: function(x, y) {
	            start.x = x;
	            start.y = y;
	            redraw();
	            return this;
	        },
	        updateEnd: function(x, y) {
	            end.x = x;
	            end.y = y;
	            redraw();
	            return this;
	        },
	        getNode: function(){
	            return node;
	        },
	        getArrow: function(){
	            return arrow;
	         }
	    };
	}


	/**
	* Function which create the whole annotation form
	*/

	$.fn.annotate = function(opts) {
		var pressedButton=this.selector;
		var inUse=false;
		var option={
				'zIndex':50000,
				'onRendered':null,
				'onOut':null,
				'loadingContent':null,
				'kbShortcut':null,
				'localization':'en',
				'getLocalization':null,
				'nsLocalization': null,
				'selfClick':false
		};
		$.extend(true,option,opts);
		
		var translation={
			'en':{
				'red':'Red',
				'green':'Green',
				'blue':'Blue',
				'mask':'Mask',
				'annotation':'Annotation',
				'drawFrame':'Draw a frame',
				'drawMask':'Hide your informations',
				'removeElement':'Remove an element',
				'arrow':'Arrow',
				'drawArrow':'Point an element',
				'addNote':'Add a text',
				'note':'Note',
				'crop':'Crop',
				'move':'Move',
				'selectCropArea':'Select the captured area',
				'loading':'Loading...',
				'cancel':'Cancel',
				'continue':'Continue'
			},
			'fr':{
				'red':'Rouge',
				'green':'Vert',
				'blue':'Bleu',
				'mask':'Masque',
				'annotation':'Annotation',
				'drawFrame':'Dessiner un cadre',
				'drawMask':'Cacher vos informations',
				'removeElement':'Supprimer un \u00e9l\u00e9ment',
				'arrow':'Fl\u00e8che',
				'drawArrow':'Pointer un \u00e9l\u00e9ment',
				'addNote':'Ajouter un texte',
				'note':'Note',
				'crop':'Recadrer',
				'move':'D\u00e9placer',
				'selectCropArea':'D\u00e9finir la zone de capture',
				'loading':'Chargement en cours...',
				'cancel':'Annuler',
				'continue':'Continuer'
			}
				
		};
		
		/**
		 * Function to localize. Can use another function with callback getTranslation.
		 * @param key to the string
		 * @returns translated string
		 */
		function iT(key){
			if (typeof option.getLocalization != 'function'){
				return translation[option.localization][key];
			}
			else{
				if(option.nsLocalization!=null){
					key= option.nsLocalization + key;
				}
				return option.getLocalization.call(this,key);
			}
		}
		
		$(this.selector).click(function(){

			var self = this;
			$(pressedButton).hide();
			inUse=true;
	        var deleteMode=false;
			var reset = {
				'margin' : 0
			}, createDiv, createDivLeft, createDivTop, overlay, feedbackDiv, line;
			//disable all selection
		    $('body').addClass('disableSelect');

			arrowOverlay = $('<span/>')
			.css(reset)
			.css('z-index',option.zIndex+9)
			.attr('id','arrowOverlay')
			.appendTo('body');
			var paper = Raphael(document.getElementById('arrowOverlay'),document.width,document.height);

	        arrowOverlay
	        .children('svg')
	        .css({
	            'pointer-events':'none',
	            'z-index':option.zIndex+10,
	            '-moz-user-drag': '-moz-none',
	            '-webkit-user-drag': 'none',
	            'user-drag': 'none',
	            'visibility':'visible'
	            });

	        var svgLayer = arrowOverlay.children('svg');

	         svgLayer.mouseup(
	         function(e) {
	             svgLayer.unbind('mousemove');
	             var st=paper.set();
	             st.push(line.getNode(),line.getArrow());
	            st.click(function() {
	                     if(deleteMode){
	                         st.remove();
	                     }
	                  });
	         });

	       // Safari bug with pointer-events http://code.google.com/p/chromium/issues/detail?id=55741
	       // Should be corrected with the upcomming release of Safari 6 and eventual maintenance release of Safari 5
	       // Opera 12.00 didn't implement pointer-events at the moment and 12.5 doesn't seem to fix this.
	       // Compatiblity mode switch the z-index of the svg+arrowOverlay layers to either the front or behind the overlay.



			compatilibityMode=false;

			var ua=$.browser;
			if (ua.webkit){
				var array= ua.version.split('.');
				if(array[0]<536){
					compatilibityMode=true;
				}
			}
			if (ua.opera||ua.msie){
				compatilibityMode=true;
			}


			function arrowForward(){
	             arrowOverlay.css('z-index',option.zIndex+9);
	             svgLayer.css('z-index',option.zIndex+10);
			}

			function arrowBackground(){
	               arrowOverlay.css('z-index',option.zIndex);
	               svgLayer.css('z-index',option.zIndex);
			}

			if(compatilibityMode){
				arrowBackground();
	        }

			// Button of the interface
			var color = '#faa';
			var feedbackClass= "feedbackRed";
			var red = $('<button>').text(iT('red')).addClass('btn  btn-small').button('toggle')
			.click(function() {
				changeButton();
				color = '#faa';
				feedbackClass = "feedbackRed";
			});
			var green = $('<button>').text(iT('green')).addClass('btn btn-small')
			.click(function() {
				changeButton();
				color = '#afa';
				feedbackClass = "feedbackGreen";
			});
			var blue = $('<button>').text(iT('blue')).addClass('btn btn-small')
			.click(function() {
				changeButton();
				color = '#aaf';
				feedbackClass = "feedbackBlue";
			});

			//Black mask, doesn't use hex value but a special case
			var black = $('<button>').text(iT('mask')).addClass('btn btn-small')
			.click(function() {
				changeButton();
				color = 'black';
				black.addClass('active');
			});

			var remove=$('<button>').text('X').addClass('btn btn-small')
	        .click(function() {
	            changeButton();
	            deleteMode=true;
	            svgLayer.children().css('pointer-events','all');
	            remove.addClass('active')
	            overlay.children().css({
	                'cursor' : 'pointer'
	            });
	            $('.feedbackBlack').css({
	                'cursor' : 'pointer'
	            });

	        });

			//This is provided for compatiblity mode. The svg layer need to be in front in order for the arrows to be removable.
	        var removeArrow=$('<button>').text(iT('arrow')).addClass('btn btn-small').css('margin-left','10px')
	        .click(function() {
	            changeButton();
	            deleteMode=true;
	            svgLayer.children().css('pointer-events','all');
	            removeArrow.addClass('active');
	            arrowForward();
	        });

	        var crop = $('<button>').text(iT('crop')).addClass('btn btn-small')
	        .click(function() {
	            changeButton();
	            color = 'white';
	            crop.addClass('active');
	        });





	        //Sticky note are based on http://stackoverflow.com/questions/10229294/javascript-sticky-notes
	        var sticky= $('<div>').addClass('stickyNoteHeader').css('z-index',option.zIndex+8);
	        $('<p>').text(iT('move')).appendTo(sticky);
	        $('<button>').attr('type','button').addClass('close closeNote').text('x').css('margin-right','5px').appendTo(sticky);
	        $('<div>').addClass('stickyNoteBody').append('<textarea>').appendTo(sticky);


	        var note = $('<button>').text(iT('note')).addClass('btn btn-small')
	        .click(function() {
	            changeButton();
	            color='none';
	            var clone=sticky.clone();
	            clone.draggable({'containment':'document'})
	            .css({
	            'position':'absolute',
	            'left':'50%',
	            'top':'50%',
	            'margin' :'-75px 0 0 -75px'
	            });
	            $('body').append(clone);
	            clone.find('textarea').val('');
	            $('.closeNote').click(function(){
	                    $(this).parent().remove();
	                });
	            });


	        var arrow=$('<button>').text(iT('arrow')).addClass('btn btn-small')
	            .click(function() {
	                changeButton();
	                svgLayer.css('pointer-events','all');
	                 svgLayer.mousedown(
	                 function(e) {
	                    x = e.pageX;
	                     y = e.pageY;
	                     line = Line(x, y, x, y, paper);
	                     svgLayer.bind('mousemove',function(e) {
	                         x = e.pageX;
	                         y = e.pageY;
	                         line.updateEnd(x, y);
	                     });
	                 });
	                 if(compatilibityMode){
	                 arrowForward();
	                 }

	                arrow.addClass('active');

	        });

			function changeButton(){
				$('#feedbackForm button').removeClass('active');
				svgLayer.css('pointer-events','none');
	            svgLayer.children().css('pointer-events','none');
	            svgLayer.unbind('mousedown');
	            if(compatilibityMode){
					arrowBackground();
	            }
				if(deleteMode){
					deleteMode=false;
					overlay.children().css({
						'cursor' : 'default'
					});
					$('.feedbackBlack').css({
						'cursor' : 'default'
					});
				}
			}

			//Creation of each line of the interface.
			var menuColor=$('<div>').addClass('feedbackMenuBar')
	        .append($('<label>').text(iT('drawFrame')))
	        .addClass('btn-group')
	        .attr('data-toggle','buttons-radio')
	        .append(red)
	        .append(green)
	        .append(blue);



	        var menuArrow=$('<div>').addClass('feedbackMenuBar')
	        .append($('<label>').text(iT('drawArrow')))
	        .append(arrow);

			var menuMask=$('<div>').addClass('feedbackMenuBar')
			.append($('<label>').text(iT('drawMask')))
			.append(black);

			var menuRemove=$('<div>').addClass('feedbackMenuBar')
			.append($('<label>').text(iT('removeElement')))
			.append(remove);

			if (compatilibityMode){
			menuRemove.append(removeArrow);
			}

			var menuCrop=$('<div>').addClass('feedbackMenuBar')
	        .append($('<label>').text(iT('selectCropArea')))
	        .append(crop);


	        var menuNote=$('<div>').addClass('feedbackMenuBar')
	        .append($('<label>').text(iT('addNote')))
	        .append(note);

			var cancel=$('<button>')
			.addClass('btn btn-small')
			.text(iT('cancel'))
			.click(function(){
				feedbackDiv.remove();
				overlay.remove();
				arrowOverlay.remove();
				svgLayer.remove();
				$('.stickyNoteHeader').remove();
				$('.feedbackBlack').remove();
				$(pressedButton).show();
				$('body').removeClass('disableSelect');
				inUse=false;
				if(typeof option.onOut== 'function')
					option.onOut.call(this);			});

			Mousetrap.bind('esc',function(){
				cancel.trigger('click');
			});


			//THE big button doing all the work
			var preview = $('<button>').text(iT('continue')).addClass('btn btn-primary').attr('id','feedbackPreview').click(function() {
			//Preprocessing before screenshot:remove stuff and reorder for screen
				changeButton();
				overlay.unbind('mousedown');
				feedbackDiv.remove();
				arrowForward();
				deleteMode=false;
				if(option.loadingContent!=null){
					var loading=$('<loading>').attr('id','screenshotLoading').appendTo('body');
					loading.append(option.loadingContent);
					loading.css({
						'margin-left': Math.round(loading.width()/-2),
						'margin-top': Math.round(loading.height()/-2),
						'z-index':option.zIndex+20
					});
				}
				
				$('.feedbackRed').css({
					'background' : 'none',
					'border' : 'solid 4px red'
				});
				$('.feedbackGreen').css({
		            'background' : 'none',
		            'border' : 'solid 4px green'
	            });
				$('.feedbackBlue').css({
	                'background' : 'none',
	                'border' : 'solid 4px blue'
	            });
				if ($('.feedbackCrop').length>0){
					var left = parseInt($('.feedbackCrop').css('left'));
		            var top = parseInt($('.feedbackCrop').css('top'));
		            var width = $('.feedbackCrop').width();
		            var height = $('.feedbackCrop').height();
				}
				//convert arrows svg to png
				//Fix for IE9
				svgLayer.removeAttr('xmlns');
				var svgString = $('<div></div>').append(svgLayer.clone()).html();
				svgLayer.remove();
				var arrowImg = svg2png(svgString);
				arrowOverlay.append("<img  src='"+arrowImg+"' />");
				overlay.css('background','none') ;
				$('.feedbackCrop').remove();
				feedbackDiv.remove();
				$('.stickyNoteHeader').css('position','absolute');

				$('body').css('cursor','wait');
				window.setTimeout(function() {
					html2canvas( [document.body] , {
						//parameter of html2canvas...
						
				        ignoreElements: "IFRAME|OBJECT|PARAM|LOADING",
				        iframeDefault:"transparent",
						onrendered:function(canvas) {
						var ctx = canvas.getContext('2d');
	                        if (typeof left!='undefined'){
	                            var img=ctx.getImageData(left,top,width,height);
	                            ctx.clearRect(0, 0, canvas.width, canvas.height)
	                            canvas.width=width;
	                            canvas.height=height;
	                            ctx.putImageData(img,0,0);
	                        }

							var base64 = canvas.toDataURL('image/png');
	                        $('#feedbackOverlay').remove();
	                        arrowOverlay.remove();
	                        $('.feedbackBlack').remove();
	                        if(option.loadingContent!=null)
	                        	loading.remove();
							$('.stickyNoteHeader').remove();
							$('body').css('cursor','auto');
							$(pressedButton).show();
							$('body').removeClass('disableSelect');
							inUse=false;
							if(typeof option.onRendered== 'function')
								option.onRendered.call(this,base64);
							if(typeof option.onOut== 'function')
								option.onOut.call(this);
						}
					});

				}, 1000);

			});

			var menuBottom=$('<div>').addClass('feedbackMenuBar').attr('id','feedbackControl')
			.append(preview)
			.append(cancel);

			//For the feedback popup
			feedbackDiv = $('<div />')
			.draggable({'containment':'document'})
			.attr('id','feedbackForm')
			.append($('<h1/>').text('Annotation'))
			.append(menuColor)
			.append(menuArrow)
			.append(menuNote)
			.append(menuMask)
			.append(menuCrop)
			.append(menuRemove)
			.append(menuBottom)
			.css({
				'position':'fixed',
				'bottom':'0px',
				'left':'Opx',
				'z-index':option.zIndex+15
			})
			.appendTo('body');


	        // the overlay for frame drawing, mask and cropping
			overlay = $('<div />')
			.css(reset)
			.css({
				'width':document.width,
				'height':document.height,
				'z-index':option.zIndex+2
			})
			.attr('id','feedbackOverlay')
			.appendTo('body').mousedown(function(e) {
			if(!deleteMode){
				createDiv = $('<div />')
				.css(reset)
				.css({
					'position' : 'absolute',
					'left' : e.pageX,
					'top' : e.pageY,
					'opacity' : 1,
					'cursor' : 'default',
				});

				if(color=='black'){
					createDiv.css({
						'background' : '#000',
						'z-index' : option.zIndex+7
						})
					.addClass('feedbackBlack')
					.appendTo('body')
					}
				else if(color=='white'){
					$('.feedbackCrop').remove();
					createDiv.css({
						'background' : '#fff',
						'z-index' : option.zIndex+5
					})

					.addClass('feedbackCrop')
					.appendTo(overlay);
				}
				else if(color=='none'){
					createDiv.remove();
				}
				else{
					createDiv.css({
						'background' : color,
						'z-index' : option.zIndex+6
					}) 
					.addClass(feedbackClass)
					.appendTo(overlay)
				}


				createDivLeft = e.pageX;
				createDivTop = e.pageY;
				//Remove div when clicking on it while in delete mode
				createDiv.click(function() {
					if(deleteMode){
						$(this).remove();
					}
				});

				overlay.bind('mousemove', function(e) {

					createDiv.width(Math.abs(e.pageX - createDivLeft));
					createDiv.height(Math.abs(e.pageY - createDivTop));

					if (e.pageX < createDivLeft) {
						createDiv.css('left', e.pageX);
					}

					if (e.pageY < createDivTop) {
						createDiv.css('top', e.pageY);
					}
				});
				}


			});
			$('body').mouseup(function(e) {
				overlay.unbind('mousemove');
			});
			 $(window).resize(function() {
	                paper.setSize(document.width,document.height);
					overlay.css({
						'width':document.width,
						'height':document.height
					});
	         });
		});
		if(option.kbShortcut!=null){
			Mousetrap.bind(option.kbShortcut,function(e){
				if(inUse==false && $(pressedButton+':hidden').length == 0 ) 
				$(pressedButton).trigger('click')}
			);
		}
		if(option.selfClick){
			$(pressedButton).trigger('click');
		}
		return this;
	};
})(jQuery); 