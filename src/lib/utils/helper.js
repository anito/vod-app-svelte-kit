// @ts-nocheck
export function sortByTitle(a, b) {
	let _a = a.title?.toUpperCase() || '';
	let _b = b.title?.toUpperCase() || '';
	return (_a < _b && -1) || (_a > _b && 1) || 0;
}

export function sortByName(a, b) {
	let _a = a.name?.toUpperCase() || '';
	let _b = b.name?.toUpperCase() || '';
	return (_a < _b && -1) || (_a > _b && 1) || 0;
}

export function sortByStartDate(a, b) {
	let aStart = a._joinData.start || new Date('3000');
	let bStart = b._joinData.start || new Date('3000');
	return new Date(bStart) - new Date(aStart);
}

export function sortByEndDate(a, b) {
	let aEnd = a._joinData.end || new Date('3000');
	let bEnd = b._joinData.end || new Date('3000');
	return new Date(bEnd) - new Date(aEnd);
}

export function equals(obj_1, obj_2) {
	let json_1 = typeof obj_1 === 'object' && JSON.stringify(obj_1);
	let json_2 = typeof obj_2 === 'object' && JSON.stringify(obj_2);
	if (!!json_1 && !!json_2) {
		return json_1 === json_2;
	}
	return false;
}

export function minDigits(m) {
	toLocaleString('en-US', {
		//this is the function that formats the numbers
		minimumIntegerDigits: 2, //change this to your minimum length
		useGrouping: false
	});
}
export function formatter(d) {
	let h, hrs, m, min, s, sec;
	hrs = d / 1000 / 60 / 60;
	min = !isNaN(((hrs % Math.floor(hrs)) * 60) % 60) || 0;
	sec = !isNaN(((min % Math.floor(min)) * 60) % 60) || 0;
	return `${Math.floor(hrs)}:${Math.floor(min)}:${Math.floor(sec)}`;
}

export function createRedirectSlug(url) {
	let path, query;
	const ignore_paths = ['login'];

	if (typeof url === 'string') {
		url = new URL(url, window.location.hostname);
		query = new URLSearchParams(url);
	} else {
		query = url.searchParams;
	}
	path = url.pathname;

	for (let ignore_path of ignore_paths) {
		let regex = new RegExp(`\\b${ignore_path}`, 'g');
		path = path.replace(regex, '');
	}
	return `?redirect=${path}${parseQuery(query)}`;
}

export function processRedirect(page, session = {}) {
	const isAdmin = session.role === 'Administrator';
	let redirect, uid, path;
	if ((redirect = page.url.searchParams.get('redirect'))) {
		return redirect;
	} else {
		uid = session.user?.id;
		path = isAdmin ? `/users/${uid}` : '/videos';
		return path.concat(parseQuery(page.url.searchParams));
	}
}

export function parseQuery(query) {
	let concatenated = '?',
		exclude = ['token', 'redirect'];
	for (let entry of query) {
		exclude.indexOf(entry[0]) < 0 &&
			(concatenated = concatenated.concat(`${entry[0]}=${entry[1]}&`));
	}
	return concatenated.slice(0, -1);
}

export function windowSize() {
	var width = 0,
		height = 0;
	if (
		document.documentElement &&
		(document.documentElement.clientWidth || document.documentElement.clientHeight)
	) {
		width = document.documentElement.clientWidth;
		height = document.documentElement.clientHeight;
	} else {
		if ('number' == typeof window.innerWidth) {
			width = window.innerWidth;
			height = window.innerHeight;
		} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
			width = document.body.clientWidth;
			height = document.body.clientHeight;
		}
	}
	return {
		height: height,
		width: width
	};
}

// https://gist.github.com/faisalman/4213592
export let convert = (() => {
	const convertBase = (num) => {
		return {
			from: (baseFrom) => {
				return {
					to: (baseTo) => {
						return parseInt(num, baseFrom).toString(baseTo);
					}
				};
			}
		};
	};

	return {
		dec2Hex: (num, rel) => {
			rel && (num *= 255);
			return convertBase(num).from(10).to(16);
		}
	};
})();

export const proxyEvent = function (eventType, detail = {}) {
	let type = typeof eventType === 'string' ? eventType : detail.eventType;
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent(type, { detail }));
	}
};

// https://gist.github.com/codeguy/6684588
export function slugify(str) {
	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();

	// remove accents, swap ñ for n, etc
	var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
	var to = 'aaaaeeeeiiiioooouuuunc------';
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	str = str
		.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes

	return str;
}

export function placeholderDotComAvatar(name = '?') {
	const placeholder = 'https://via.placeholder.com/100x100.png?text=';
	return `${placeholder}${name
		.split(' ')
		.map((val) => val.substring(0, 1))
		.join('')}`;
}

export function svg(fn, colors) {
	colors = (!Array.isArray(colors) && [colors]) || colors;
	return (
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			fn.apply(
				null,
				((c) => {
					for (var fillColors = [], i = 0; i < c.length; i++) {
						fillColors.push(c[i]);
					}
					return fillColors;
				})(colors)
			)
		)
	);
}

Array.prototype.unique = function () {
	return this.filter((val, index, self) => self.indexOf(index) != val);
};

String.prototype.remove = function (val) {
	let arr = this.split(' ');
	return arr
		.filter((item) => item != val)
		.unique()
		.join(' ')
		.trim();
};

String.prototype.add = function (val) {
	let arr = this.split(' ');
	return arr.concat(val).unique().join(' ').trim();
};

export const __key__ = {};
export const __session__ = {};
export const __ticker__ = {};
