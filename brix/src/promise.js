
/**
 * ref https://github.com/neojski/promise-me/blob/master/promiseme.js
 */

define("brix/promise", function (require) {
	// body...
	var Promise = {
		deferred: function() {
			var callbacks = [];
			var done = null;
			var promise = {
				then: function(onFulfilled, onRejected) {
					var d = promiseme.deferred();
					callbacks.push({
					  fulfill: onFulfilled,
					  reject: onRejected,
					  deferred: d
					});
					if (done) {
					  process.apply(null, done);
					}
					return d.promise;
				}
			};
			function process(type, data) {
			  setTimeout(function() {
					for (var i = 0; i < callbacks.length; i++) {
					  	var fn = callbacks[i][type];
					  	var df = callbacks[i].deferred;
						if (typeof fn === 'function') {
							try {
							  	var val = fn(data);
								if (val && typeof val.then === 'function') {
									val.then(df.fulfill, df.reject);
								} else {
									df.fulfill(val);
								}
							} catch (e) {
							  df.reject(e);
							}
						} else {
							df[type](data);
						}
					}
					callbacks = [];
				}, 0);
			}
			return {
				promise: promise,
				fulfill: function(value) {
					done = ['fulfill', value];
					process.apply(null, done);
				},
				reject: function(reason) {
					done = ['reject', reason];
					process.apply(null, done);
				}
			};
		}
	};

	return Promise;
});