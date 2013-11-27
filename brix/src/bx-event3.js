define("brix/bx-event", function  (require, exports, module) {
	// body...
	var $ = Zepto;
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

            var self = this
            var el = this.get('el')
            var fn
            self.bxUnBubbleEvents = {}

            for (var sel in eventsMap) {
                var events = eventsMap[sel]
                for (var type in events) {
                    fn = events[type]

                    if (sel === 'self') {
                        el.on(type, fn);
                    } else if (sel === 'window') {
                        $(window).on(type, fn)
                    } else if (sel === 'body') {
                        $(document.body).on(type, fn)
                    } else if (sel === 'document') {
                        $(document).on(type, fn);
                    } else {
                        if ($.inArray(type, unSupportBubbleEvents)) {
                            //将不冒泡事件做记录
                            self.bxUnBubbleEvents[sel] = self.bxUnBubbleEvents[sel] || []
                            self.bxUnBubbleEvents[sel].push({
                                type: type,
                                fn: fn
                            })
                            $(sel, el).on(type, fn)
                        } else {
                            el.on(type, sel, fn)
                        }

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

        bxUndelegateMap: function(eventsMap) {
            var el = this.get('el')
            var fn

            for (var sel in eventsMap) {
                var events = eventsMap[sel]
                for (var type in events) {
                    fn = events[type]

                    if (sel === 'self') {
                        el.off(type, fn)
                    } else if (sel === 'window') {
                        $(window).off(type, fn)
                    } else if (sel === 'body') {
                        $(document.body).off(type, fn)
                    } else if (sel === 'document') {
                        $(document).off(type, fn)
                    } else {
                        if ($.inArray(type, unSupportBubbleEvents)) {
                            $(sel, el).off(type, fn)
                        } else {
                        	el.off(type, sel, fn)
                        }
                    }
                }
            }
        }
    };
})