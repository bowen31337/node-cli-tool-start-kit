#!/usr/bin/env node
function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var figlet = _interopDefault(require('figlet'));

'use strict';

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var escapeStringRegexp = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var ansiStyles = createCommonjsModule(function (module) {
'use strict';

function assembleStyles () {
	var styles = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});

	return styles;
}

Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});
});

'use strict';
var ansiRegex$1 = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g;
};

'use strict';
var ansiRegex = ansiRegex$1();

var stripAnsi = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};

'use strict';

var re = new RegExp(ansiRegex$1().source); // remove the `g` flag
var hasAnsi = re.test.bind(re);

'use strict';
var argv = process.argv;

var terminator = argv.indexOf('--');
var hasFlag = function (flag) {
	flag = '--' + flag;
	var pos = argv.indexOf(flag);
	return pos !== -1 && (terminator !== -1 ? pos < terminator : true);
};

var supportsColor = (function () {
	if ('FORCE_COLOR' in process.env) {
		return true;
	}

	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false')) {
		return false;
	}

	if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

'use strict';





var defineProps = Object.defineProperties;
var isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

function Chalk(options) {
	// detect mode if not set manually
	this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
}

// use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001b[94m';
}

var styles = (function () {
	var ret = {};

	Object.keys(ansiStyles).forEach(function (key) {
		ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

		ret[key] = {
			get: function () {
				return build.call(this, this._styles.concat(key));
			}
		};
	});

	return ret;
})();

var proto = defineProps(function chalk() {}, styles);

function build(_styles) {
	var builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder.enabled = this.enabled;
	// __proto__ is used because we must return a function, but there is
	// no way to create a function with a different prototype.
	/* eslint-disable no-proto */
	builder.__proto__ = proto;

	return builder;
}

function applyStyle() {
	// support varags, but simply cast to string in case there's only one arg
	var args = arguments;
	var argsLen = args.length;
	var str = argsLen !== 0 && String(arguments[0]);

	if (argsLen > 1) {
		// don't slice `arguments`, it prevents v8 optimizations
		for (var a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || !str) {
		return str;
	}

	var nestedStyles = this._styles;
	var i = nestedStyles.length;

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	var originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
		ansiStyles.dim.open = '';
	}

	while (i--) {
		var code = ansiStyles[nestedStyles[i]];

		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;
	}

	// Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
	ansiStyles.dim.open = originalDim;

	return str;
}

function init() {
	var ret = {};

	Object.keys(styles).forEach(function (name) {
		ret[name] = {
			get: function () {
				return build.call(this, [name]);
			}
		};
	});

	return ret;
}

defineProps(Chalk.prototype, init());

var chalk = new Chalk();
var styles_1 = ansiStyles;
var hasColor = hasAnsi;
var stripColor = stripAnsi;
var supportsColor_1 = supportsColor;

chalk.styles = styles_1;
chalk.hasColor = hasColor;
chalk.stripColor = stripColor;
chalk.supportsColor = supportsColor_1;

console.log(
  chalk.red(
    figlet.textSync('MyCli', { horizontalLayout: 'full' })
  )
);

console.log("this is my first nodejs Cli");
//# sourceMappingURL=myCli.cjs.js.map
