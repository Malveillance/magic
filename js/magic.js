function htmlDecode(input) {
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
}

$('.control-dnd-base input').on('change', function() {
	var blob = this.files[0];

	if (blob && (blob.type == 'image/jpeg' || blob.type == 'image/png')) {
		$('#dnd-canvas').empty();

		var image = new Image();
		$(image).one('load', function() {
			var w = Math.floor(this.naturalWidth/2);
			var h = Math.floor(this.naturalHeight/2);

			var base = $('<div/>', {
				'class': 'base',
				'data-file': blob.name,
				css: {
					width: w,
					height: h,
					backgroundImage: 'url(' + URL.createObjectURL(blob) + ')'
				},
				appendTo: '#dnd-canvas'
			});

			$('.control-dnd-base .title').attr('data-badge', w + 'х' + h);
		});

		image.src = URL.createObjectURL(blob);

		$(this).next().children('.form-file-text').html(blob.name);

		var name = blob.name.split('.').slice(0, -1).join('.');
		var next = Number(name) ? Number(name) + 1 : 1;
		$('.control-dnd-solution input').val(('00000' + next).slice(-6));

		$('.control-dnd-shape .title').attr('data-badge', 0);

		$('.control.group-dnd-base.fade').addClass('show');
		$('.control.group-dnd-shape.fade').removeClass('show');

		URL.revokeObjectURL(blob);
	}

	$(this).val('');
});

$('.control-dnd-shape button').on('click', function() {
	$('.control-dnd-shape input').click();
});

$('.control-dnd-shape input').on('change', function() {
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

				var shape = $('<div/>', {
					'class': 'shape',
					'data-file': blob.name,
					'data-size': w + 'x' + h,
					title: htmlDecode('&larr;&uarr;&rarr;&darr;: &plusmn;1 px\nDelete: Удалить'),
					css: {
						position: 'absolute',
						left: x*i,
						top: y,
						width: w,
						height: h,
						opacity: $('.control-dnd-opacity input').val(),
						backgroundImage: 'url(' + URL.createObjectURL(blob) + ')'
					},
					draggable: {
						containment: '#dnd-canvas',
						cursor: 'grabbing',
						snap: '#dnd-canvas .shape',
						snapTolerance: 10
					},
					on: {
						mousedown: function() {
							if ($(this).hasClass('selected')) return;

							$('#dnd-canvas .shape').removeClass('selected');
							$(this).addClass('selected');
						}
					},
					appendTo: '#dnd-canvas'
				});
			});

			image.src = URL.createObjectURL(blob);

			var data = Number($('.control-dnd-shape .title').attr('data-badge'));
			$('.control-dnd-shape .title').attr('data-badge', ++data);

			$('.control.group-dnd-shape.fade').addClass('show');

			URL.revokeObjectURL(blob);
		}
	});

	$(this).val('');
});

$('.control-dnd-opacity input').on('input', function() {
	$('#dnd-canvas .shape').css('opacity', $(this).val());
	$('.control-dnd-opacity .title').attr('data-badge', $(this).val()*100 + '%');
});

$(window).on('mousedown', function(e) {
	if ($(e.target).hasClass('selected')) return;

	$('.canvas .ui-draggable').removeClass('selected');
});

$(document).on('keydown', function(e) {
	var object = $('.canvas .selected');
	if (!object.length) return;

	switch (e.which) {
		case 37: // Left arrow key
			if ($(object).position().left > 0) {
				e.preventDefault();
				$(object).finish().animate({ left: '-=1' }, 0);
			}
		break;
		case 38: // Up arrow key
			if ($(object).position().top > 0) {
				e.preventDefault();
				$(object).finish().animate({ top: '-=1' }, 0);
			}
		break;
		case 39: // Right arrow key
			if ($(object).position().left + $(object).width() < $(object).parent().width()) {
				e.preventDefault();
				$(object).finish().animate({ left: '+=1' }, 0);
			}
		break;
		case 40: // Down arrow key
			if ($(object).position().top + $(object).height() < $(object).parent().height()) {
				e.preventDefault();
				$(object).finish().animate({ top: '+=1' }, 0);
			}
		break;
		case 46: // Delete key
			$(object).remove();

			var length = $('#dnd-canvas .shape').length;
			$('.control-dnd-shape .title').attr('data-badge', length);
			if (!length) $('.control.group-dnd-shape.fade').removeClass('show');
		break;
	}
});

(function($) {
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
}($));

$('.code-copy').on('click', function() {
	$(this).parents('.modal-content').find('textarea.code').select();
	document.execCommand('copy');
});

$('#dnd-modal, .control-dnd-step input').on('show.bs.modal change', function() {
	var next = $('.control-dnd-solution input').val();
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

		var rx = Number($('.control-dnd-step input').val()) || 50;
		var ry = ch - h;

		code += '\t<shape file="' + $(this).data('file') + '" width="' + w + '" height="' + h + '" coords="' + rx*i + ', ' + ry + '">\n';
		code += '\t\t<region type="rect" coords="' + x + ', ' + y + ', ' + (x + w) + ', ' + (y + h) + '" precMove="20"/>\n';
		code += '\t</shape>\n';
	});

	code += '</dnd>';

	$('#dnd-modal .code').val(code);
});

$('#ddl-modal').on('show.bs.modal', function() {
	var separator = ',';

	var text = $('#ddl-text').val();
	var code = '<dropdownlist>\n\t<sentence>';

	var number = 1, words = [];
	text.split(/\r?\n/).forEach(string => {
		if (string === '') return;

		var p = string.replace(/\[(.*?)\]/g, function(match, items) {
			var word = '\n\n\t<word number="' + number + '">';

			items.split(separator).forEach(item => {
				word += '\n\t\t<variant valid="false"><varianttext>' + item.trim() + '</varianttext></variant>';
			});

			word += '\n\t</word>';
			words.push(word);

			return '<field number="' + (number++) + '"/>';
		});

		code += '\n\t\t<p>' + p + '</p>';
	});

	code += '\n\t</sentence>' + words.join('') + '\n</dropdownlist>';

	$('#ddl-modal .code').val(code);
});
