var util = (function(){
	var text = function(){

		function _getTextLines(text, width, bold, font, size, className) {        
			var rows = [],
	            height = 0,
	            words, lastRow, div;

	        if (!width || !text || !text.length)
	            return rows;

	        div = document.createElement('div');
	        div.innerHTML = '';

	        if (className)
	            div.setAttribute('class', className);
	        if (font)
	            div.style.fontFamily = font;
	        if (bold)
	            div.style.fontWeight = bold;
	        if (size)
	            div.style.fontSize = size + 'px';

	        div.style.width = width + 'px';

	        document.body.appendChild(div);

	        words = text.split(' ');
	        lastRow = 0;
	        words.forEach(function (word, i) {
	            var inserted = (!div.innerHTML.length) ? [] : div.innerHTML.split('');
	            inserted.push(word);
	            div.innerHTML = inserted.join(' ');
	            if (div.clientHeight != height) {
	                rows.push([]);
	                lastRow = rows.length - 1;
	                height = div.clientHeight;
	            }
	            rows[lastRow].push(word);
	        });

	        document.body.removeChild(div);
	        return rows.map(function (row) {
	            return row.join(' ');
	        });
	    };

		function getTextRows(text, width, bold, font, size, className) {        
			var rows = [],
	            height = 0,
	            lines, lastRow, div;

	        if (!width || !text || !text.length)
	            return rows;

	        lines = text.split(/\r\n|\r|\n/);
	        lines.forEach(function(line){
	        	var r = _getTextLines(line, width, bold, font, size, className);
	        	rows = rows.concat(r);
	        })
	        return rows;
	    };		

	    return {
	    	getTextRows: getTextRows
	    }
	};

	var color = function(){

		function invert(hexTripletColor) {
	        var color = hexTripletColor;
	        color = color.substring(1); // remove #
	        color = parseInt(color, 16); // convert to integer
	        color = 0xFFFFFF ^ color; // invert three bytes
	        color = color.toString(16); // convert to hex
	        color = ("000000" + color).slice(-6); // pad with leading zeros
	        color = "#" + color; // prepend #
	        return color;
	    };

	    return {
	    	invert: invert
	    }
	};

	var tree = function(){

		var linkLine = d3.svg.line().interpolate('basis')
			.x(function (d) { return d.x; })
			.y(function (d) { return d.y; });

		function _getLinkingPoints(coords, direction, xScale, yScale){
			direction = direction || 'tb';

			xScale = xScale || d3.scale.linear().domain([0, 1]).range([0, 1]);
			yScale = yScale || d3.scale.linear().domain([0, 1]).range([0, 1]);

			var s = {
				x: xScale(coords.x1),
				y: yScale(coords.y1)
			}, e = {
				x: xScale(coords.x2),
				y: yScale(coords.y2)
			};
			var z = {x: 0, y: 0};
			if (direction == 'lr'){
				z.x = e.x - s.x;
				z.x *= (z.x < 0) ? -0.1 : 0.325;
				z.x = Math.max(z.x, xScale(75) - xScale(0));
			} else {
				z.y = e.y - s.y;
				z.y *= (z.y < 0) ? -0.1 : 0.325;
				z.y = Math.max(z.y, yScale(75) - yScale(0));
			}
			var cs = { x: s.x + z.x, y: s.y + z.y },
				ce = { x: e.x - z.x, y: e.y - z.y };

			return { start: s, controlstart: cs, controlend: ce, end: e };
		};

		function drawLine(points, direction, xs, ys){
			var coords = _getLinkingPoints(points, direction, xs, ys);
			return linkLine([coords.start, coords.controlstart, coords.controlend, coords.end]);
		};

		function getDataById(id, dataset){
			var data = null;
			if (Array.isArray(dataset))
				for (var i = 0; i < dataset.length; i++){
					var d = dataset[i];
					if (d.id == id){
						data = d;
						break;
					}
				}
			return data;
		};

		function guid() {
			function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		};

		function getId(d){ return d.id; };

		function haveRelationship(id1, id2, set){
			set = set || [];
			return set.some(function(link){
					return (link.fromNode == id1 && link.toNode == id2) || (link.fromNode == id2 && link.toNode == id1);
			});
		};

		function getRelationshipBetween(fromId, toId, noOrder, set){
			set = set || [];
			noOrder = noOrder || false;

			var relLink = null;
			
			function applyCondition(link, id1, id2){
				var res = link.fromNode == id1 && link.toNode == id2;
				if (noOrder)
					res = res || (link.fromNode == id2 && link.toNode == id1);
				return res;
			}

			for (var i = 0; i < set.length; i++){
				var link = set[i];
				if (applyCondition(fromId, toId)){
					relLink = link;
					break;
				}
			}
			return relLink;
		};

		function getRelationshipsByPartner(id, set){
			set = set || [];
			return set.filter(function(link){
					return (link.fromNode == id || link.toNode == id);
			});	
		};

		function getChildLinksByRelationship(relId, set){
			set = set || [];
			return set.filter(function(link){
					return link.relId == relId;
			});	
		};

		function isChildOf(childId, parentId, dataRelLinks, dataChildLinks){
			if (!childId || !parentId)
				return false;
			var relLinks = getRelationshipsByPartner(parentId, dataRelLinks);
			return relLinks.some(function(rLink){
				return relLinks.hasChildren && getChildLinksByRelationship(rLink.id, dataChildLinks).filter(function(cLink){ return cLink.childId == childId; }).length == 1;
			});
		};

		function isParentOf(parentId, childId, dataRelLinks, dataChildLinks){
			return isChildOf(childId, parentId, dataRelLinks, dataChildLinks);
		};

		function getGroupsByNode(node, groups){
			var id = (typeof(node) == 'object') ? node.id : node;
			groups = groups || [];
			return groups.filter(function(g){ return g.nodes.indexOf(id) != -1; });
		};

		function getBrothers(id, dataChildLink, dataRelLinks){ // ID of node
			var brothers = [];
			dataChildLinks = dataChildLinks || [];
			dataRelLinks = dataRelLinks || [];
			if (!id)
				return brothers;
			var link = dataChildLink.filter(function(l){ return l.childId == id})[0];
			if (!link)
				return brothers;
			var relId = link.relId;
			for (var i = 0; i < dataRelLinks.length; i++){
				var r = dataRelLinks[i];
				if (r.relId == relId){
					var brother = getNodeById(r.childId);
					if (brother)
						brothers.push(brother);
				}
			}
			return brothers;
		};

		return {
			drawLine: drawLine,
			getDataById: getDataById,
			guid: guid,
			getId: getId,
			haveRelationship: haveRelationship,
			getRelationshipBetween: getRelationshipBetween,
			getRelationshipsByPartner: getRelationshipsByPartner,
			getChildLinksByRelationship: getChildLinksByRelationship,
			isChildOf: isChildOf,
			isParentOf: isParentOf,
			getGroupsByNode: getGroupsByNode,
			getBrothers: getBrothers
		};
	};

	var getPosition = function(ev, container){
		if (!ev)
			return [NaN, NaN];
		var x = 0, y = 0;
		if (ev.touches && ev.touches.length == 1)
			ev = ev.touches[0];
		if (ev.pageX || ev.pageY) {
			x = ev.pageX;
			y = ev.pageY;
		} else if (ev.clientX || ev.clientY) {
			x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		if (container){
			var bbox = container.getBoundingClientRect(),
				viewX = bbox.left,
				viewY = bbox.top;
			x -= viewX;
			y -=viewY;
		}
		return [x, y];
	};

	return {
		text: text(),
		color: color(),
		tree: tree(),
		getPosition: getPosition
	}
})();
