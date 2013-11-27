define("brix/bx-event", ["magix/view", "magix/body"], function  (require, exports, module) {
	// body...
	var $ = Zepto;
	var EMPTY = "";
	var View = require("magix/view");
	var Body = require("magix/body");



	var unSupportBubbleEvents = ['change', 'valuechange']
    
    module.exports = {

        bxDelegate: function() {

            var c = this.constructor
            while (c) {
                this.bxDelegateMap(c.EVENTS)
                c = c.superclass ? c.superclass.constructor : null
            }

            //外部动态传入的事件代理
            var events = this.get('events')
            if (events) {
                this.bxDelegateMap(events)
            }
        },

        bxDelegateMap: function(eventsMap) {
        	var self = this;
        	var el = this.get('el');

        	var elID = el.attr('id');

        	var fn, fnName, fnText;

        	// sel选择器类型 events 相应选择器下的事件
        	for (var sel in eventsMap) {
        		var events = eventsMap[sel];
        		for (var type in events) {
        			// 
        			fn = events[type];
    			    fnName = 'mx-' + type;
    				fnText = elID + '_' + type + '{bxId:' + elID + '}';

        			if (sel == 'self') {
        				el.attr(fnName, fnText);
                        View.mixin({
                            'xxx':function(e){
                                me.xx();
                            }
                        })
                        
        			} else if (sel == 'body' || sel == 'document') {
        				$(document.body).attr(fnName, fnText);
        			} else if (sel == 'window') {
        				$(window).on(type, fn);
        			} else {
        				// 非冒泡事件也不处理了
        				$(sel, el).attr(fnName, fnText);
        			}

        		}
        	}

        },

        bxUndelegate: function() {
            var c = this.constructor

            while (c) {
                this.bxUndelegateMap(c.EVENTS)
                c = c.superclass ? c.superclass.constructor : null
            }
            //外部动态传入的事件代理
            var events = this.get('events')
            if (events) {
                this.bxUndelegateMap(events)
            }
        },

        // 仅仅detach window methods
        bxUndelegateMap: function(eventsMap) {
            var el = this.get('el')
            var fn

            for (var sel in eventsMap) {
                var events = eventsMap[sel]
                for (var type in events) {
                    fn = events[type]

                    if (sel == 'window') {
                    	$(window).off(type, fn);
                    }
                }
            }
        }
    }

})