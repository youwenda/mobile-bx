KISSY.add("brix/bx-event", function (S, Event) {
	// body...
	var unSupportBubbleEvents = ['change', 'valuechange']
	
    var BxEvent = (function() {

        var METHODS = {
            bxDelegate: function(host) {

                var c = host.constructor
                while (c) {
                    this.bxDelegateMap(host, c.EVENTS)
                    c = c.superclass ? c.superclass.constructor : null
                }

                //外部动态传入的事件代理
                var events = host.get('events')
                if (events) {
                    this.bxDelegateMap(host, events)
                }
            },

            bxDelegateMap: function(host, eventsMap) {

                var self = this
                var el = host.get('el')
                var fn
                host.bxUnBubbleEvents = {}

                for (var sel in eventsMap) {
                    var events = eventsMap[sel]
                    for (var type in events) {
                        fn = events[type]

                        if (sel === 'self') {
                            el.on(type, fn, host)
                        } else if (sel === 'window') {
                            Event.on(window, type, fn, host)
                        } else if (sel === 'body') {
                           Event.on('body', type, fn, host)
                        } else if (sel === 'document') {
                            Event.on(document, type, fn, host)
                        } else {
                            if (S.inArray(type, unSupportBubbleEvents)) {
                                //将不冒泡事件做记录
                                host.bxUnBubbleEvents[sel] = host.bxUnBubbleEvents[sel] || []
                                host.bxUnBubbleEvents[sel].push({
                                    type: type,
                                    fn: fn
                                })
                                el.all(sel).on(type, fn, host)
                            } else {
                                el.delegate(type, sel, fn, host)
                            }

                        }
                    }

                }
            },

            bxUndelegate: function(host) {
                var c = host.constructor

                while (c) {
                    this.bxUndelegateMap(host, c.EVENTS)
                    c = c.superclass ? c.superclass.constructor : null
                }
                //外部动态传入的事件代理
                var events = host.get('events')
                if (events) {
                    this.bxUndelegateMap(host, events)
                }
            },

            bxUndelegateMap: function(host, eventsMap) {
                var el = host.get('el')
                var fn

                for (var sel in eventsMap) {
                    var events = eventsMap[sel]
                    for (var type in events) {
                        fn = events[type]

                        if (sel === 'self') {
                            el.detach(type, fn, host)
                        } else if (sel === 'window') {
                            Event.detach(window, type, fn, host)
                        } else if (sel === 'body') {
                            Event.detach('body', type, fn, host)
                        } else if (sel === 'document') {
                            Event.detach(document, type, fn, host)
                        } else {
                            if (S.inArray(type, unSupportBubbleEvents)) {
                                el.all(sel).detach(type, fn, host)
                            } else {
                                el.undelegate(type, sel, fn, host)
                            }
                        }
                    }
                }
            }
        };

        return METHODS;

    })();

    return BxEvent;
}, {
	requires: ['event']
});