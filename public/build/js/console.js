// Array.prototype.diff = function(a) {
// 	return this.filter(function(i) {return a.indexOf(i) < 0;});
// };

// (function(w){
// 	OriginalConsole = w.console;

// 	var CONST_LIMIT = 50;
// 	var CONST_TIMER_CLEAR = 5000;

// 	var Console = {
// 		count: 0,
// 		timer: null,
// 		log: function(){
// 			var _this = Console;
// 			if(_this.count >= CONST_LIMIT) OriginalConsole.error('Limit log exceeded');
// 			_this.count++;

// 			OriginalConsole.log.apply(null, arguments);

// 			clearTimeout(_this.timer);
// 			_this.timer = setTimeout(function(){
// 				_this.count = 0;
// 			}, CONST_TIMER_CLEAR);
// 		}
// 	}

// 	w.console = Console;
// }(window))