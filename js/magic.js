function htmlDecode(s) {
	var d = new DOMParser().parseFromString(s, 'text/html');
	return d.documentElement.textContent;
}

const MO_CONFIG = { childList: true, attributes: false, characterData: false };

new MutationObserver(function() {
	var length = $('#dnd-canvas .shape').length;
	$('.dnd-add .title').attr('data-badge', length);

	if (length) $('.dnd-group-2').removeClass('invisible').addClass('show');
	else $('.dnd-group-2.show').one('transitionend', e => $(e.target).addClass('invisible')).removeClass('show');
}).observe($('#dnd-canvas')[0], MO_CONFIG);

$('.dnd-base input[type="file"]').on('change', function() {
	var blob = this.files[0];

	if (blob && (blob.type == 'image/jpeg' || blob.type == 'image/png')) {
		$('#dnd-canvas').empty();

		var image = new Image();
		$(image).one('load', function() {
			var w = Math.floor(this.naturalWidth/2);
			var h = Math.floor(this.naturalHeight/2);

			$('<div/>', {
				'class': 'base',
				'data-file': blob.name,
				css: {
					width: w,
					height: h,
					backgroundImage: 'url(' + URL.createObjectURL(blob) + ')'
				},
				appendTo: '#dnd-canvas'
			});

			$('.dnd-base .title').attr('data-badge', w + 'х' + h);

			URL.revokeObjectURL(blob);
		});

		image.src = URL.createObjectURL(blob);

		var id = blob.name.split('.').slice(0, -1).join('.');
		var next = Number(id) ? Number(id) + 1 : 1;
		$('.dnd-solution input').val(('00000' + next).slice(-6));

		$('.dnd-group-1').removeClass('invisible').addClass('show');
	}
});

$('.dnd-add button').on('click', function() {
	$('.dnd-add input[type="file"]').click();
});

$('.dnd-add input[type="file"]').on('change', function() {
	var count = $(this.files).length;

	$(this.files).each(function(i) {
		var blob = $(this)[0];

		if (blob && (blob.type == 'image/jpeg' || blob.type == 'image/png')) {
			var image = new Image();
			$(image).one('load', function() {
				var w = Math.floor(this.naturalWidth/2);
				var h = Math.floor(this.naturalHeight/2);

				var x = count > 1 ? Math.floor(($('#dnd-canvas').width() - w)/(count - 1)) : 0;
				if (x > w) x = w;
				var y = $('#dnd-canvas').height() - h;

				$('<div/>', {
					'class': 'shape',
					'data-file': blob.name,
					title: htmlDecode(blob.name + '\n' + w + 'x' + h + '\n&larr;&uarr;&rarr;&darr;: &plusmn;1 px\nDelete: Удалить'),
					tabindex: 0,
					css: {
						position: 'absolute',
						left: x*i,
						top: y,
						width: w,
						height: h,
						opacity: $('.dnd-opacity input').val(),
						backgroundImage: 'url(' + URL.createObjectURL(blob) + ')'
					},
					draggable: {
						containment: '#dnd-canvas',
						cursor: 'grabbing',
						snap: '#dnd-canvas .shape',
						snapTolerance: 10
					},
					on: {
						mousedown: e => {
							if (e.target === e.currentTarget) $(e.target).focus();
						},
						keydown: e => {
							var target = $(e.target);

							switch (e.which) {
								case 37: // Left arrow key
									if (target.position().left > 0) {
										e.preventDefault();
										target.finish().animate({ left: '-=1' }, 0);
									}
								break;
								case 38: // Up arrow key
									if (target.position().top > 0) {
										e.preventDefault();
										target.finish().animate({ top: '-=1' }, 0);
									}
								break;
								case 39: // Right arrow key
									if (target.position().left + target.width() < target.parent().width()) {
										e.preventDefault();
										target.finish().animate({ left: '+=1' }, 0);
									}
								break;
								case 40: // Down arrow key
									if (target.position().top + target.height() < target.parent().height()) {
										e.preventDefault();
										target.finish().animate({ top: '+=1' }, 0);
									}
								break;
								case 46: // Delete key
									e.preventDefault();
									target.remove();
								break;
							}
						}
					},
					appendTo: '#dnd-canvas'
				});

				URL.revokeObjectURL(blob);
			});

			image.src = URL.createObjectURL(blob);
		}
	});

	$(this).val('');
});

$('.dnd-opacity input').on('input', function() {
	$('#dnd-canvas .shape').css('opacity', $(this).val());
	$('.dnd-opacity .title').attr('data-badge', +($(this).val()*100).toFixed());
});

new MutationObserver(function() {
	var length = $('#label-canvas .label').length;
	$('.label-add .title').attr('data-badge', length);

	if (length) $('.label-group-2').removeClass('invisible').addClass('show');
	else $('.label-group-2.show').one('transitionend', e => $(e.target).addClass('invisible')).removeClass('show');
}).observe($('#label-canvas')[0], MO_CONFIG);

$('.label-base input[type="file"]').on('change', function() {
	var blob = this.files[0];

	if (blob && (blob.type == 'image/jpeg' || blob.type == 'image/png')) {
		$('#label-canvas').empty();

		var image = new Image();
		$(image).one('load', function() {
			var w = Math.floor(this.naturalWidth/2);
			var h = Math.floor(this.naturalHeight/2);

			$('<div/>', {
				'class': 'base',
				'data-file': blob.name,
				css: {
					width: w,
					height: h,
					backgroundImage: 'url(' + URL.createObjectURL(blob) + ')'
				},
				appendTo: '#label-canvas'
			});

			$('.label-base .title').attr('data-badge', w + 'х' + h);

			URL.revokeObjectURL(blob);
		});

		image.src = URL.createObjectURL(blob);

		$('.label-group-1').removeClass('invisible').addClass('show');
	}
});

const LABEL_NAME = 'Текст';

$.fn.edit = function() {
	var prev = this.text();
	var w = this.width() + 9;

	this.text('');

	$('<input/>', {
		type: 'text',
		value: prev,
		title: '',
		css: {
			width: (w > 160 ? w : 160)
		},
		on: {
			keydown: e => {
				e.stopPropagation();
				if (e.which == 13 || e.which == 27) {
					$(e.target).remove();
					this.focus();
				}
			},
			focus: e => {
				e.target.setSelectionRange(0, $(e.target).val().length);
			},
			blur: e => {
				$(e.target).remove();
			}
		},
		one: {
			remove: e => {
				this.text(htmlDecode($(e.target).val()) || prev);
			}
		},
		appendTo: this
	}).focus();

	return this;
};

$('.label-add button').on('click', function() {
	$('<div/>', {
		'class': 'label',
		text: LABEL_NAME,
		title: htmlDecode('&larr;&uarr;&rarr;&darr;: &plusmn;1 px\nEnter: Редактировать\nDelete: Удалить'),
		tabindex: 0,
		css: {
			position: 'absolute',
			left: 0,
			top: 0
		},
		draggable: {
			containment: '#label-canvas',
			cursor: 'grabbing'
		},
		on: {
			mousedown: e => {
				if (e.target === e.currentTarget) $(e.target).focus();
			},
			keydown: e => {
				var target = $(e.target);

				switch (e.which) {
					case 37: // Left arrow key
						if (target.position().left > 0) {
							e.preventDefault();
							target.finish().animate({ left: '-=1' }, 0);
						}
					break;
					case 38: // Up arrow key
						if (target.position().top > 0) {
							e.preventDefault();
							target.finish().animate({ top: '-=1' }, 0);
						}
					break;
					case 39: // Right arrow key
						if (target.position().left + target.width() < target.parent().width()) {
							e.preventDefault();
							target.finish().animate({ left: '+=1' }, 0);
						}
					break;
					case 40: // Down arrow key
						if (target.position().top + target.height() < target.parent().height()) {
							e.preventDefault();
							target.finish().animate({ top: '+=1' }, 0);
						}
					break;
					case 13: // Enter key
					case 113: // F2 key
						e.preventDefault();
						target.edit();
					break;
					case 46: // Delete key
						e.preventDefault();
						target.remove();
					break;
				}
			},
			dblclick: e => {
				if (e.target === e.currentTarget) $(e.target).edit();
			}
		},
		appendTo: '#label-canvas'
	}).focus();
});

$('.accent-source .btn-secondary').on('click', e => {
	navigator.clipboard.readText().then(buffer => {
		var text = htmlDecode(buffer).replace(/(?:\r\n|\r|\n)/g, '<br/>').replace(/([аеиоуыэюя]\u0301)|(?:[аеиоуыэюя])/gi, (m, p) => '<span class="vowel' + (p ? ' acute' : '') + '">' + m + '</span>');

		$('#accent-text').html(text);
		$('#accent-text .vowel').click(e => {
			var span = $(e.target);
			var letter = span.text();

			span.text(span.hasClass('acute') ? letter.replace('\u0301', '') : (letter + '\u0301')).toggleClass('acute');
		});
	}).catch(error => {
		console.log(error);
	});
});

$('.text-clear').on('click', e => {
	$(e.target.dataset.target).val('');
});

$('.code-copy').on('click', e => {
	$(e.target.dataset.target).select();
	document.execCommand('copy');
});

$.fn.shuffle = function() {
	// credits: http://bost.ocks.org/mike/shuffle/
	var m = this.length, t, i;

	while (m) {
		i = Math.floor(Math.random()*m--);

		t = this[m];
		this[m] = this[i];
		this[i] = t;
	}

	return this;
};

$('#dnd-modal').on('show.bs.modal', function() {
	var next = $('.dnd-solution input').val();
	var code = '<solution>\n\t<step>\n\t\t<figure align="center">\n\t\t\t<object excel="' + next + '" border="0"/>\n\t\t</figure>\n\t</step>\n</solution>\n\n';

	var file = $('#dnd-canvas .base').data('file') || '';
	var cw = $('#dnd-canvas').width() || '0';
	var ch = $('#dnd-canvas').height() || '0';
	code += '<dnd file="' + file + '" width="' + cw + '" height="' + ch + '" border="0" mask="0, 0, ' + cw + ', ' + ch + '">\n';

	$('#dnd-canvas .shape').shuffle().sort(function(a, b) {
		return $(b).height() - $(a).height();
	}).each(function(i) {
		var w = $(this).width();
		var h = $(this).height();

		var x = $(this).position().left;
		var y = $(this).position().top;

		var rx = Number($('.dnd-step input').val()) || 50;
		var ry = ch - h;

		code += '\t<shape file="' + $(this).data('file') + '" width="' + w + '" height="' + h + '" coords="' + rx*i + ', ' + ry + '">\n';
		code += '\t\t<region type="rect" coords="' + x + ', ' + y + ', ' + (x + w) + ', ' + (y + h) + '" precMove="20"/>\n';
		code += '\t</shape>\n';
	});

	code += '</dnd>';

	$('#dnd-modal .code').val(code);
});

$('#ddl-modal').on('show.bs.modal', function() {
	var brackets = new Array(/\[(.*?)\]/g, /\((.*?)\)/g)[$('.ddl-brackets select').val()];
	var separator = new Array(',', ';', '/', ' ')[$('.ddl-separator select').val()];

	var quote = $('#ddl-quote').prop('checked');
	var mix = $('#ddl-mix').prop('checked') ? '' : ' mix="false"';
	var align = $('#ddl-align').prop('checked') ? ' align="left"' : '';

	var text = $('#ddl-text').val();
	var code = '<dropdownlist' + mix + '>\n\t<sentence>';

	var number = 1, words = [];
	text.split(/\r?\n/).forEach(line => {
		if (line === '') return;

		var p = line.trim().replace(brackets, (m, items) => {
			var word = '\n\n\t<word number="' + number + '">';

			items.trim().split(separator).forEach((item, i) => {
				var cur = item.trim();
				if (cur === '') return;

				if (quote) cur = '<style type="quote">' + cur + '</style>';
				word += '\n\t\t<variant valid="false"><varianttext>' + cur + '</varianttext></variant>';
			});

			word += '\n\t</word>';
			words.push(word);

			return '<field number="' + (number++) + '"/>';
		});

		if (quote) p = '<style type="quote">' + p + '</style>';
		code += '\n\t\t<p' + align + '>' + p + '</p>';
	});

	code += '\n\t</sentence>' + words.join('') + '\n</dropdownlist>';

	$('#ddl-modal .code').val(code);
});

$('#label-modal').on('show.bs.modal', function() {
	var id = $('#label-canvas .base').data('file').split('.').slice(0, -1).join('.');
	var cw = $('#label-canvas').width() || '0';
	var ch = $('#label-canvas').height() || '0';
	var code = '<figure align="center">\n\t<object excel="' + id + '" width="' + cw + '" height="' + ch + '" border="0">\n';

	$('#label-canvas .label').each(function(i) {
		var x = $(this).position().left;
		var y = $(this).position().top;

		code += '\t\t<label coords="' + x + ', ' + y + '">' + $(this).text() + '</label>\n';
	});

	code += '\t</object>\n</figure>';

	$('#label-modal .code').val(code);
});

$('#accent-modal').on('show.bs.modal', function() {
	var text = $('#accent-text').html().replace(/(?:<br>)/g, '\n').replace(/(?:&nbsp;)/g, '&amp;nbsp;');
	$('#accent-modal .code').val(htmlDecode(text));
});
