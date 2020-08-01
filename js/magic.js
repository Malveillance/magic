function htmlDecode(input) {
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
}

$('#dnd-base').on('change', function() {
	var blob = this.files[0];

	if (blob && (blob.type == 'image/jpeg' || blob.type == 'image/png')) {
		$('.dnd-canvas').empty();

		var base = $('<div/>', {
			'class': 'base fade',
			'data-file': blob.name
		}).appendTo('.dnd-canvas');

		var image = new Image();
		$(image).one('load', function() {
			var w = Math.floor(this.naturalWidth/2);
			var h = Math.floor(this.naturalHeight/2);

			$(base).css({
				'width': w,
				'height': h,
				'background-image': 'url(' + URL.createObjectURL(blob) + ')'
			});

			$('#dnd-width').val(w);
			$('#dnd-height').val(h);
		});

		image.src = URL.createObjectURL(blob);

		$('#dnd-base-name').html(blob.name);

		var name = blob.name.split('.').slice(0, -1).join('.');
		var next = Number(name) ? Number(name) + 1 : 1;
		$('#dnd-solution').val(('00000' + next).slice(-6));

		$(base).addClass('show');
		$('.dnd-base-group.fade').addClass('show');
		$('.dnd-shape-group.fade').removeClass('show');

		URL.revokeObjectURL(blob);
	}

	$(this).val('');
});

$('#dnd-add-shape').on('click', function() {
	$('#dnd-shape').click();
});

$('#dnd-shape').on('change', function() {
	var count = $(this.files).length;

	$(this.files).each(function(i) {
		var blob = $(this)[0];

		if (blob && (blob.type == 'image/jpeg' || blob.type == 'image/png')) {
			var shape = $('<div/>', {
				'class': 'shape fade',
				'data-file': blob.name,
				'title': htmlDecode('&larr;&uarr;&rarr;&darr;: &plusmn;1 px\nDelete: Удалить')
			}).appendTo('.dnd-canvas');

			var image = new Image();
			$(image).one('load', function() {
				var w = Math.floor(this.naturalWidth/2);
				var h = Math.floor(this.naturalHeight/2);

				var x = count > 1 ? Math.floor(($('.dnd-canvas').width() - w)/(count - 1)) : 0;
				if (x > w) x = w;
				var y = $('.dnd-canvas').height() - h;

				$(shape).css({
					'left': x*i,
					'top': y,
					'width': w,
					'height': h,
					'opacity': $('#dnd-opacity').val(),
					'background-image': 'url(' + URL.createObjectURL(blob) + ')'
				});

				$(shape).attr('data-size', w + 'x' + h);
			});

			image.src = URL.createObjectURL(blob);

			$(shape).draggable({
				containment: '.dnd-canvas',
				cursor: 'grabbing',
				snap: '.dnd-canvas .shape',
				snapTolerance: 10
			});

			$(shape).on('mousedown', function() {
				if ($(this).hasClass('selected')) return;

				$('.dnd-canvas .shape').removeClass('selected');
				$(this).addClass('selected');
			});

			$('#dnd-shape-name').html(blob.name);

			$(shape).addClass('show');
			$('.dnd-shape-group.fade').addClass('show');

			URL.revokeObjectURL(blob);
		}
	});

	$(this).val('');
});

$('#dnd-opacity').on('input', function() {
	$('.dnd-canvas .shape').css('opacity', $(this).val());
	$(this).attr('title', $(this).val()*100 + '%');
});

$('#dnd-opacity').on('change', function() {
	$(this).attr('title', $(this).val()*100 + '%');
});

$(window).on('mousedown', function(e) {
	if ($(e.target).hasClass('selected')) return;

	$('.dnd-canvas .shape').removeClass('selected');
});

$(document).on('keydown', function(e) {
	var shape = $('.dnd-canvas .shape.selected');
	if (!shape.length) return;

	switch (e.which) {
		case 37: // Left arrow key
			if ($(shape).position().left > 0) {
				e.preventDefault();
				$(shape).finish().animate({ left: '-=1' }, 0);
			}
		break;
		case 38: // Up arrow key
			if ($(shape).position().top > 0) {
				e.preventDefault();
				$(shape).finish().animate({ top: '-=1' }, 0);
			}
		break;
		case 39: // Right arrow key
			if ($(shape).position().left + $(shape).width() < $(shape).parent().width()) {
				e.preventDefault();
				$(shape).finish().animate({ left: '+=1' }, 0);
			}
		break;
		case 40: // Down arrow key
			if ($(shape).position().top + $(shape).height() < $(shape).parent().height()) {
				e.preventDefault();
				$(shape).finish().animate({ top: '+=1' }, 0);
			}
		break;
		case 46: // Delete key
			$(shape).remove();
			if (!$('.dnd-canvas .shape').length) $('.dnd-shape-group.fade').removeClass('show');
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

$('#dnd-modal, #dnd-step').on('show.bs.modal change', function() {
	var next = $('#dnd-solution').val();
	var code = '<solution>\n\t<step>\n\t\t<figure align="center">\n\t\t\t<object excel="' + next + '" border="0"/>\n\t\t</figure>\n\t</step>\n</solution>\n\n';

	var file = $('.dnd-canvas .base').attr('data-file') || '';
	var cw = $('.dnd-canvas').width() || '0';
	var ch = $('.dnd-canvas').height() || '0';
	code += '<dnd file="' + file + '" width="' + cw + '" height="' + ch + '" border="0" mask="0, 0, ' + cw + ', ' + ch + '">\n';

	$('.dnd-canvas .shape').shuffle().sort(function(a, b) {
		return $(b).height() - $(a).height();
	}).each(function(i) {
		var w = $(this).width();
		var h = $(this).height();

		var x = $(this).position().left;
		var y = $(this).position().top;

		var rx = Number($('#dnd-step').val()) || 50;
		var ry = ch - h;

		code += '\t<shape file="' + $(this).attr('data-file') + '" width="' + w + '" height="' + h + '" coords="' + rx*i + ', ' + ry + '">\n';
		code += '\t\t<region type="rect" coords="' + x + ', ' + y + ', ' + (x + w) + ', ' + (y + h) + '" precMove="20"/>\n';
		code += '\t</shape>\n';
	});

	code += '</dnd>';

	$('.dnd-code').val(code);
});

$('#dnd-copy').on('click', function() {
	$('.dnd-code').select();
	document.execCommand('copy');
});
