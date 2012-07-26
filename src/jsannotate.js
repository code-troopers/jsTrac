/**
 * Based on jsfeedback by Niklas von Hertzen.
 * http://hertzen.com/experiments/jsfeedback/
 * Modified by Romain Laï-King
 *
 * Original file header are provided just below.
 * This has been renamed to jsAnnotate
 * as the original developper is planning a new version
 * and didn't participate in the development of this library
 */



/**
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 13.7.2011
 * @website http://hertzen.com
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

/**
 * Based on http://jsfiddle.net/rRtAq/2039/ and  http://taitems.tumblr.com/post/549973287/drawing-arrows-in-raphaeljs
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
            return "M "+ end.x + " " + end.y + " L " + (end.x - size) + " " + (end.y - size) +  " L " + (end.x - size) + " " + (end.y + size) + " L " +     end.x + " " + end.y ;
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


(function($) {

	/**
	* Function which create the whole annotation form
	*/

	$.fn.annotate = function(opts) {
		var pressedButton=this.selector;
		var option={
				'zIndex':50000,
				'onPreprocessing':null,
				'onRendered':null,
				'loadingDivId':null,
				'onOut':null
		};
		$.extend(true,option,opts);
		$(this.selector).click(function(){
			if(typeof option.onPreprocessing== 'function')
				option.onPreprocessing.call(this);
			var self = this;
			$(pressedButton).hide();
	        var deleteMode=false;
			var reset = {
				'margin' : 0
			}, createDiv, createDivLeft, createDivTop, overlay, feedbackDiv, line;
			


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
			if (ua.opera){
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
			var red = $('<button>').text('Red').addClass('btn  btn-small').button('toggle')
			.click(function() {
				changeButton();
				color = '#faa';
				feedbackClass = "feedbackRed";
			});
			var green = $('<button>').text('Green').addClass('btn btn-small')
			.click(function() {
				changeButton();
				color = '#afa';
				feedbackClass = "feedbackGreen";
			});
			var blue = $('<button>').text('Blue').addClass('btn btn-small')
			.click(function() {
				changeButton();
				color = '#aaf';
				feedbackClass = "feedbackBlue";
			});

			//Black mask, doesn't use hex value but a special case
			var black = $('<button>').text('Mask').addClass('btn btn-small')
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
	        var removeArrow=$('<button>').text('Arrow').addClass('btn btn-small').css('margin-left','10px')
	        .click(function() {
	            changeButton();
	            deleteMode=true;
	            svgLayer.children().css('pointer-events','all');
	            removeArrow.addClass('active');
	            arrowForward();
	        });

	        var crop = $('<button>').text('Crop').addClass('btn btn-small')
	        .click(function() {
	            changeButton();
	            color = 'white';
	            crop.addClass('active');
	        });





	        //Sticky note are based on http://jsfiddle.net/EnigmaMaster/aQMhk/6/
	        var sticky= $('<div>').addClass('stickyNoteHeader').css('z-index',option.zIndex+8);
	        $('<p>').text('Move').appendTo(sticky);
	        $('<button>').attr('type','button').addClass('close closeNote').text('x').css('margin-right','5px').appendTo(sticky);
	        $('<div>').addClass('stickyNoteBody').append('<textarea>').appendTo(sticky);


	        var note = $('<button>').text('Note').addClass('btn btn-small')
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
	            $('.closeNote').click(function(){
	                    $(this).parent().remove();
	                });
	            });


	        var arrow=$('<button>').text('Arrow').addClass('btn btn-small')
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
	        .append("<label>Draw a frame</label>")
	        .addClass('btn-group')
	        .attr('data-toggle','buttons-radio')
	        .append(red)
	        .append(green)
	        .append(blue);



	        var menuArrow=$('<div>').addClass('feedbackMenuBar')
	        .append("<label>Point an element</label>")
	        .append(arrow);

			var menuMask=$('<div>').addClass('feedbackMenuBar')
			.append("<label>Hide your informations</label>")
			.append(black);

			var menuRemove=$('<div>').addClass('feedbackMenuBar')
			.append("<label>Remove an element</label>")
			.append(remove);

			if (compatilibityMode){
			menuRemove.append(removeArrow);
			}

			var menuCrop=$('<div>').addClass('feedbackMenuBar')
	        .append("<label>Select the visible area</label>")
	        .append(crop);


	        var menuNote=$('<div>').addClass('feedbackMenuBar')
	        .append("<label>Add text</label>")
	        .append(note);

			var cancel=$('<button>')
			.addClass('btn btn-small')
			.text('Annuler')
			.click(function(){
				feedbackDiv.remove();
				overlay.remove();
				arrowOverlay.remove();
				$('.stickyNoteHeader').remove();
				$('.feedbackBlack').remove();
				$(pressedButton).show();
				if(typeof option.onOut== 'function')
					option.onOut.call(this);			});

			Mousetrap.bind('esc',function(){
				cancel.trigger('click');
			});


			//THE big button doing all the work
			var preview = $('<button>').text('Continue').addClass('btn btn-primary').attr('id','feedbackPreview').click(function() {
			//Preprocessing before screenshot
				feedbackDiv.remove();
				arrowForward();
				deleteMode=false;
				var loading=$('<span>').attr('id','tracLoading').text('Loading');
				$('#'+option.loadingDivId).prepend(loading);
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
					html2canvas( [ document.body ], {
						//parameter of html2canvas...
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
							loading.remove();
							$('.stickyNoteHeader').remove();
							$('body').css('cursor','auto');
							$(pressedButton).show();
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
		return this;
	};
})(jQuery); 