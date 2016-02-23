(function ($) {
    function initData($el) {
        var _ARS_data = $el.data('_ARS_data');
        if (!_ARS_data) {
            _ARS_data = {
                scale: 1,
            };
            $el.data('_ARS_data', _ARS_data);
        }
        return _ARS_data;
    }
    
    function scale(el, val) {
        var $self = $(el), data = initData($self);
        
        if (typeof val == 'undefined') {
            return data.scale;
        }
        
        data.scale = val;
    
		$self.css('transform', 'scale(' + data.scale + ',' + data.scale + ')');    
        
        return this;
    };

    // fx.cur() must be monkey patched because otherwise it would always
    // return 0 for current scale values
    var curProxied = $.fx.prototype.cur;
    $.fx.prototype.cur = function () {
		if (this.prop == 'scale') {
            return parseFloat(scale(this.elem));
        }
        return curProxied.apply(this, arguments);
    };
    
    $.fx.step.scale = function (fx) {
        scale(fx.elem, fx.now);
    };

	$.fn.scaleNDrag = function (opts) {
        var x, y, top, left, down;
        var $scrollArea = $(this);
		var contentOverflow=false;
		var scaleActual=1;
		var scrollY=0;
		var scrollX=0;
		var scaleOverflow=1;
		
		var op = $.extend({
							selScaleContent:'',
							scaleRate:0.1,
							scaleMax:5,
							scaleMin:0
							//selScaleIn:'',
							//selScaleOut:''
							}, opts);
		
		$scaleArea = $scrollArea.find(op.selScaleContent);

		if($scaleArea.length){
			var xScaleOverflow = (($scrollArea.outerWidth()/$scaleArea.outerWidth()) - 1) / op.scaleRate;
			var yScaleOverflow = (($scrollArea.outerHeight()/$scaleArea.outerHeight()) - 1) / op.scaleRate;
			
			scaleOverflow = Math.min(xScaleOverflow, yScaleOverflow);
			
			contentOverflow = $scaleArea.outerWidth() >= $scrollArea.outerWidth() ||
									$scaleArea.outerHeight() >= $scrollArea.outerHeight();
		}

        $($scrollArea).attr("onselectstart", "return false;");   // Disable text selection in IE8
		
        $($scrollArea).mousedown(function (e) {
            if(contentOverflow){
				e.preventDefault();
				down = true;
				x = e.pageX;
				y = e.pageY;
				top = $(this).scrollTop();
				left = $(this).scrollLeft();
				$($scaleArea).css({'pointer':'-webkit-grabbing'});
			}
        });
        $($scrollArea).mouseleave(function (e) {
            down = false;
			$(this).css('pointer','');
        });
        $("body").mousemove(function (e) {
            if (down) {
                var newX = e.pageX;
                var newY = e.pageY;
                $($scrollArea).scrollTop(top - newY + y);
                $($scrollArea).scrollLeft(left - newX + x);
				scrollY = $($scrollArea).scrollTop();
				scrollY = $($scrollArea).scrollLeft();
            }
        });
        $("body").mouseup(function (e) {
			down = false; 
			if(contentOverflow)
				$($scaleArea).css('pointer','-webkit-grab');
		});
		
		function trigScale(isScaleIn){
			var y = 0;
			var x = 0;
			var newWidth = $scaleArea.outerWidth() * scaleActual;
			var newHeight = $scaleArea.outerHeight() * scaleActual;
			var overflowX = newWidth > $scrollArea.outerWidth();
			var overflowY = newHeight > $scrollArea.outerHeight();
			
			contentOverflow=newWidth >= $scrollArea.outerWidth() || newHeight >=$scrollArea.outerHeight();
						
			if(overflowX || overflowY){
				var delta = (1 + Math.abs(scaleActual-scaleOverflow));
				if(isScaleIn){
					if(overflowX)
						x = scrollX/delta;
					if(overflowY)
						y=scrollY/y;
				}
				else{
					if(overflowX)
						x = scrollX*delta;
					if(overflowY)
						y=scrollY*y;
				}
			}
			$scrollArea.animate({scrollTop: y, scrollLeft: x}, 500);
			$scaleArea.animate({scale:scaleActual}, 500);
		}

		if(op.selScaleIn && $(op.selScaleIn).length){
			$(op.selScaleIn).on('click', function(){
				if(scaleActual + op.scaleRate <= op.scaleMax){
					scaleActual += op.scaleRate;
					trigScale(true);
				}
			});
		}
		if(op.selScaleOut && $(op.selScaleOut).length){
			$(op.selScaleOut).on('click', function(){
				if(scaleActual - op.scaleRate >= op.scaleMin){
					scaleActual -= op.scaleRate;
					trigScale(false);
				}
			});
		}
    };
})(jQuery);
