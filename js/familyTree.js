var familyTree = (function (isTouchDevice){
		
	var dataNodes = [];
	var dataRelLinks = [];
	var dataChildLinks = [];
	var dataGroups = [];

	var createdNodes = { createdId: 0, allCreated: {}},
		createdGroups = { createdId: 0, allCreated: {}},
		createdRelLinks = { createdId: 0, allCreated: {}},
		createdChildLinks = { createdId: 0, allCreated: {}},
		deletedObjects = { deletedId: 0, allDeleted: {}},
		addedNodesToGroup = { addedId: 0, allAdded: {}},
		removedNodesFromGroup = { removedId: 0, allRemoved: {}};
	
	function clearAllActions() {
        HistoryManager.reset();
        createdNodes = { createdId: 0, allCreated: {} };
        createdGroups = { createdId: 0, allCreated: {}};
		createdRelLinks = { createdId: 0, allCreated: {}};
		createdChildLinks = { createdId: 0, allCreated: {}};
		deletedObjects = { deletedId: 0, allDeleted: {}};
		addedNodesToGroup = { addedId: 0, allAdded: {}};
		removedNodesFromGroup = { removedId: 0, allRemoved: {}};
    };
	
	var svg, 
		nodeWidth = 200, //200,
		nodeHeight = 120, //90,
		nodePadding = 10,
		imageSize = 0, //nodeHeight - 2 * nodePadding,
		resizersSide = 8,
		groupColor = '#85e1e1',
		groupPadding = 10,
		currentScale, xScale, yScale, zoom,
		brush, brushLayer,
		isCreatingRel = null,
		isCreatingChild = false,
		nodeOver = null,
		groupOver = null,
		relLinkOver = null,
		tmpRelLink, tmpChildLink, tmpNode, tmpFromNode, tmpToNode, tmpGroup,
		isResizingGroup = null;
	
	var HistoryManager = actionHistory();
	var TooltipManager = tooltipManager();
	var CtxMenuManager = contextMenuManager();
	
	// private methods
	function _getViewport(nodes, groups){
		var nViewport = _getNodesViewport(nodes),
			gViewport = _getGroupsViewport(groups);

		if (!gViewport)
			return nViewport;

		var canvasInfo = {        
			xRange : [
				Math.min(nViewport.xRange[0], gViewport.xRange[0]),
				Math.max(nViewport.xRange[1], gViewport.xRange[1])
			],
			yRange : [
				Math.min(nViewport.yRange[0], gViewport.yRange[0]),
				Math.max(nViewport.yRange[1], gViewport.yRange[1])
			]
		};

        canvasInfo.w = canvasInfo.xRange[1] - canvasInfo.xRange[0];
        canvasInfo.h = canvasInfo.yRange[1] - canvasInfo.yRange[0];

        canvasInfo.padding = Math.max(canvasInfo.w, canvasInfo.h) * 0.5;
        canvasInfo.w += 2 * canvasInfo.padding;
        canvasInfo.h += 2 * canvasInfo.padding;

        return canvasInfo;
	};

	function _getNodesViewport(nodes){
		nodes = nodes || [];
		var canvasInfo = {};
        if (!nodes.length) {
            canvasInfo.padding = 0;
            canvasInfo.xRange = xScale.domain();
            canvasInfo.yRange = yScale.domain();
            canvasInfo.w = canvasInfo.xRange[1] - canvasInfo.xRange[0];            
            canvasInfo.h = canvasInfo.yRange[1] - canvasInfo.yRange[0];
        } else {
            canvasInfo.xRange = [
                d3.min(nodes, function (d) { return d.x; }),
                d3.max(nodes, function (d) { return d.x + nodeWidth; })
            ];
            canvasInfo.yRange = [
                d3.min(nodes, function (d) { return d.y; }) ,
                d3.max(nodes, function (d) { return d.y + nodeHeight; })
            ];

            canvasInfo.w = canvasInfo.xRange[1] - canvasInfo.xRange[0];
            canvasInfo.h = canvasInfo.yRange[1] - canvasInfo.yRange[0];

            canvasInfo.padding = Math.max(canvasInfo.w, canvasInfo.h) * 0.5;
            canvasInfo.w += 2 * canvasInfo.padding;
            canvasInfo.h += 2 * canvasInfo.padding;
        }
        return canvasInfo;
	};

	function _getGroupsViewport(groups){
		groups = groups || dataGroups;
		var canvasInfo = {};
        if (!groups.length) {
            canvasInfo = null;
        } else {
            canvasInfo.xRange = [
                d3.min(groups, function (d) { return d.x; }) ,
                d3.max(groups, function (d) { return d.x + d.width; })
            ];
            canvasInfo.yRange = [
                d3.min(groups, function (d) { return d.y; }),
               	d3.max(groups, function (d) { return d.y + d.height; })
            ];

            canvasInfo.w = canvasInfo.xRange[1] - canvasInfo.xRange[0];
            canvasInfo.h = canvasInfo.yRange[1] - canvasInfo.yRange[0];

            canvasInfo.padding = Math.max(canvasInfo.w, canvasInfo.h) * 0.5;
            canvasInfo.w += 2 * canvasInfo.padding;
            canvasInfo.h += 2 * canvasInfo.padding;
        }
        return canvasInfo;
	};
	
	function _onZoom(){
        CtxMenuManager.hide();
		
		if (!svg || svg.empty())
			return;
		
        var w = parseInt(svg.attr('width')),
            h = parseInt(svg.attr('height'));

        if (dataNodes.length) {
            var canvasInfo = _getViewport(dataNodes, dataGroups);
            var t = d3.event.translate;
            currentScale = d3.event.scale;
            var minScale = Math.min(Math.min(h / canvasInfo.h, w / canvasInfo.w), 1);
            zoom.scaleExtent([minScale, 1]).translate(t);
        }
        update();
	};

	function reset(){
		clearAllActions();
		loadTree();
		loadGroups();
		draw();
	};

	function loadTree(tree){
		loadNodes(tree);
		loadLinks(tree);
	};
	
	function loadNodes(dataset){
		dataNodes = dataset || [];
		dataNodes.forEach(function(node){
			node.isNode = true;
			node.lastX = node.x;
			node.lastY = node.y;
			node.visible = {
				name: _setVisibleText(node.name, node.id, 'name'),
				surname: _setVisibleText(node.surname, node.id, 'surname')
			};
			node.updateId = 0;
			node.allUpdated = { 
				'0': { 
					name: node.name, 
					surname: node.surname, 
					description : node.description,
					sex: node.sex 
				}
			};
		});
		return dataNodes;
	};

	function _setVisibleText(label, id, className) { // one row and tagName text
        var visibleLabel = label;
        var width = nodeWidth - (3 * nodePadding + imageSize);
        var d3Text;

        if (!svg || svg.empty())
            return visibleLabel;

        d3Text = svg
            .append('text')
            .attr('id', 'pre-compute-' + id)
            .attr('class', className)
            .text(visibleLabel);

        while (d3Text.node().getComputedTextLength() >= width) {
            visibleLabel = label.substring(0, visibleLabel.length - 1);
            d3Text.text(visibleLabel + '...');
        }

        if (visibleLabel != label) visibleLabel += '...';
        d3.selectAll('#pre-compute-' + id).remove();
        return visibleLabel;
    };

	
	function loadLinks(dataset){
		dataRelLinks = [];
		dataChildLinks = [];
		dataset = dataset || [];
				
		dataset.forEach(function(data){
			var id = data.id;
			if (Array.isArray(data.relationships)){
				data.relationships.forEach(function(rel){
					var partnerId = rel.partnerId;
					if (!util.tree.haveRelationship(id, partnerId, dataRelLinks)){
						var relId = util.tree.guid(),
							direction = rel.direction;
						var relLink = {
							id: relId,
							fromNode: (direction == 'to') ? id : partnerId,
							toNode: (direction == 'to') ? partnerId : id
						};
						dataRelLinks.push(relLink);
						var children = rel.children;
						if (Array.isArray(children) && children.length){
							relLink.hasChildren = true;
							children.forEach(function(childId){
								dataChildLinks.push({
									id: util.tree.guid(),
									childId: childId,
									relId: relId
								});
							});
						}
					}					
				});
				delete data.relationships;
			}	
		});
	};

	function loadGroups(dataset){
		dataset = dataset || [];
		dataGroups = [];

		var groupsList = [];
		dataset.forEach(function(g){
			g.isGroup = true;
			g.lastX = g.x;
			g.lastY = g.y;
			g.updateId = 0;
			g.allUpdated = {
	    		'0': {
					color: g.color, 
					textSize: g.textSize,
					width: g.width,
					height: g.height, 
					text: g.text
	    		}
	    	};
			dataGroups.push(g);
			groupsList.push({id: g.id, text: g.text});
		});

		groupsList.sort(function(a, b) {
			var tA = a.text.toUpperCase(); // ignore upper and loadd-to-new-groupwercase
			var tB = b.text.toUpperCase(); // ignore upper and lowercase
			if (tA < tB) return -1;
			if (tA > tB) return 1;
			// texts must be equal
			return 0;
		});
		
		var lastEl = $('#add-to-new-group').parent('li'),
			menu = lastEl.parents('.dropdown-submenu').find('.dropdown-menu');
			
		menu.find('.existing-group,.divider').each(function(){$(this).remove()});
		if (groupsList.length){
			groupsList.forEach(function(g){
				var text = g.text.split(/\r\n|\r|\n/),
					li = '<li class="existing-group"><a tabindex="-1" href="#" id="add-to-existing-group-' + g.id + '">';
				li += text[0];
				if (text.length > 1) 
					li += '...</a></li>';
				lastEl.before(li);
			});
			lastEl.before('<li class="divider"></li>');
			menu.on('click', '.existing-group a', function(){
				var el = this,
					$el = $(this),
					id = $el.attr('id').substring(22);
				while (el && el.className.indexOf('dropdown-menu') == -1)
					el = el.parentNode;
				if (el)
					$(el).hide();
				CtxMenuManager.getContextMenu('node').hide();
				var group = getGroupById(id),
					nodesToAdd = dataNodes.filter(function(n){return n.selected == true && group.nodes.indexOf(n.id) == -1;});
				addNodesTo(nodesToAdd, group);
			})
		}
	};
	
	function getNodeById(id, dataset){
		return util.tree.getDataById(id, dataset || dataNodes);
	};
	
	function getRelLinkById(id, dataset){
		return util.tree.getDataById(id, dataset || dataRelLinks);
	};
	
	function getChildLinkById(id, dataset){
		return util.tree.getDataById(id, dataset || dataChildLinks);
	};

	function getGroupById(id, dataset){
		return util.tree.getDataById(id, dataset || dataGroups);
	};	

	function getD3Node(node){
		if (!svg || svg.empty() || !node)
			return null;
		var nodeId = (typeof(node) == 'string') ? node : node.id;
		return svg.select('.nodes').select('#node-' + nodeId);
	};

	function getD3RelLink(link){
		if (!svg || svg.empty() || !link)
			return null;
		var linkId = (typeof(link) == 'string') ? link : link.id;
		return svg.select('.relationship-links').select('#link-' + linkId);
	};

	function getD3ChildLink(link){
		if (!svg || svg.empty() || !link)
			return null;
		var linkId = (typeof(link) == 'string') ? link : link.id;
		return svg.select('.children-links').select('#link-' + linkId);
	};

	function getD3Group(group){
		if (!svg || svg.empty() || !group)
			return null;
		var groupId = (typeof(group) == 'string') ? group : group.id;
		return svg.select('.groups').select('#group-' + groupId);
	};

    function _addEventsToNodes(nodes){
    	if (!nodes || nodes.empty())
    		return nodes;

 /*		if (isTouchDevice){
			console.log('to do');
			return;
		}
*/		
		
		function onMouseOverNode(node){
			var d3Node = d3.select(this);

			// It is creating a new relationship
			if (isCreatingRel == 'right' && !d3Node.classed('rel-from')){ // changing toNode
				var fromNode = d3.select('.rel-from').datum();
				if (!util.tree.haveRelationship(node.id, fromNode.id, dataRelLinks))
					d3Node.classed('rel-to', true);
			} else if (isCreatingRel == 'left' && !d3Node.classed('rel-to')) {// changing fromNode
				var toNode = d3.select('.rel-to').datum();
				if (!util.tree.haveRelationship(node.id, toNode.id, dataRelLinks))
					d3Node.classed('rel-from', true);
			}

			// It is creating a new "child" link
			if (isCreatingChild && tmpChildLink && !d3Node.classed('child-node')){
				var relId = tmpChildLink.relId;
				var alreadyExist = dataChildLinks.some(function(clink){
					return clink.relId == relId && clink.childId == node.id;
				});
				var rel = getRelLinkById(relId)
					isParent = rel.fromNode == node.id || rel.toNode == node.id;
				d3Node.classed('child-node', !alreadyExist && !isParent);
			}

			// show partners' ports
			d3Node.selectAll('.partner-port').classed('hide', false);

			nodeOver = node;
			
			// show tooltip if nodes are too small or they have partial texts
			var toShow = currentScale < 0.75 || node.hasPartialDescr || false;
			if (!toShow){
				for (var x in nodeOver.visible){
					toShow = toShow || (nodeOver[x] != nodeOver.visible[x]);
					if (toShow) 
						break;
				}
			}
			
			if (toShow)
				TooltipManager.show(nodeOver);
		};

		function onMouseOutNode(node){
			nodeOver = null;
			var toElement = d3.event.toElement;
			while (toElement != null && toElement != this)
				toElement = toElement.parentNode;				
			if (toElement)
				return;

			var d3Node = d3.select(this),
				relLinks = util.tree.getRelationshipsByPartner(node.id, dataRelLinks);

			if (isCreatingChild){	
				d3Node.classed('child-node', false);
			}
			
			if (isCreatingRel == 'right') // update toNode
				d3Node.classed('rel-to', false);
			else if (isCreatingRel == 'left') // update fromNode
				d3Node.classed('rel-from', false);

			if (relLinks.length){
				var from = relLinks.some(function(rel){ return rel.fromNode == node.id;});
				var to = relLinks.some(function(rel){ return rel.toNode == node.id;});
				d3Node.selectAll('.partner-port.right').classed('hide', !from);
				d3Node.selectAll('.partner-port.left').classed('hide', !to);
			} else 
				d3Node.selectAll('.partner-port').classed('hide', true);

			TooltipManager.hide(200);
		};

		function onMouseDownNode(node) {
			CtxMenuManager.hide();
			if (node.selected) { // multiple selection
				if (d3.event.ctrlKey)
					deselectNode(node);
			} else {
				if (!d3.event.ctrlKey) // single selection
					deselectAll();
				selectNode(node);
			}
		};

		function onClickNode(node) {
			if (!d3.event.ctrlKey) {
				deselectAll();
				selectNode(node);
			}
		};
		
/*		if (isTouchDevice){
			console.log('to do');
			return;
		}
*/
		nodes.on('mouseover', onMouseOverNode)
			.on('mouseout', onMouseOutNode)
			.on('mousedown', onMouseDownNode)
			.on('click', onClickNode );

		CtxMenuManager.onRightClick('node', nodes, svg, {
			getSelectionCount: function(){
				var count = dataNodes.filter(function(n){return n.selected;}).length;
					count += dataRelLinks.filter(function(n){return n.selected;}).length;
					count += dataChildLinks.filter(function(n){return n.selected;}).length;
					count += dataGroups.filter(function(n){return n.selected;}).length;
				return count;
			},
			updateItems: function(){
				_updateAddToGroupsItem();
				_updateLinkToPartnerItem();
				_updateRemoveFromGroupsItem();
			}
		});
				
		nodes.call(
			d3.behavior.drag()
				.on('dragstart', onStartToMoveNodes)
				.on('drag', onMovingNodes)
				.on('dragend', onFinishToMoveNodes)
		);
		
		nodes.selectAll('.partner-port')
			.call(
				d3.behavior.drag()
                    .on('dragstart', onStartRelLink)
                    .on('drag', onMoveRelLink)
                    .on('dragend', onEndRelLink)
            );

		return nodes;
    };	

    function drawNodes() {
		if (!svg || svg.empty())
			return;

		var nodes = svg.select('.nodes').selectAll('.node')
			.data(dataNodes, util.tree.getId);
			
		nodes.exit().remove();

		var newNodes = _createD3Nodes(nodes.enter(), _addEventsToNodes);
		_updateD3Nodes(nodes);
	};

    function _createD3Nodes(nodesToAdd, addEventsCallback) {
		var newNodes = nodesToAdd.append('g').attr('class', 'node')
			.attr('id', function (d) { return 'node-' + d.id; });
			
		newNodes.append('rect').attr({
			'class': 'node-base',
			width: nodeWidth,
			height: nodeHeight
		});

		var iconPos = nodePadding;
		/*
		newNodes.append('rect')
            .attr({
                'class': 'bg-node-image node-image',
                'x': iconPos,
                'y': iconPos,
                'width': imageSize,
                'height': imageSize,
                'rx': nodePadding,
                'ry': nodePadding
            });
        
        newNodes.append('image')
            .attr({
                'class': 'node-image',
                'x': iconPos,
                'y': iconPos,
                'width': imageSize,
                'height': imageSize,
                'rx': nodePadding,
                'ry': nodePadding,
                'href': './resources/icons/blank-user.jpg'
            });
		*/
		var fontSize = 20,
			fromTop = fontSize + nodePadding;

		newNodes.append('text').attr({
			'class': 'name', 
			'text-rendering': 'geometricPrecision',
			x: nodeWidth * 0.5,//2 * nodePadding + imageSize,
			y: fromTop
		});

		fromTop += fontSize + 3;
		
		newNodes.append('text').attr({
			'class': 'surname', 
			'text-rendering': 'geometricPrecision',
			x: nodeWidth * 0.5,//2 * nodePadding + imageSize,
			y: fromTop
		});

		fromTop += 3 * 2;

		newNodes.append('g')
			.attr('class', 'description')
			.attr('transform', 'translate(' + (2 * nodePadding + imageSize) + ',' + fromTop + ')');
		
		var parentPort = newNodes.append('circle')
			.attr({
				'class': 'parent-port',
				r: '5px',
				cx: (nodeWidth * 0.5) + 'px'
			});

		newNodes.append('polygon')
			.attr({
				'class': 'partner-port left hide',
				points: '0,' + (0.5 * nodeHeight - 5) + ' 5,' + (0.5 * nodeHeight)
							+ ' 0,' + (0.5 * nodeHeight + 5) + ' -5,' + (0.5 * nodeHeight)
			});
			
		newNodes.append('polygon')
			.attr({
				'class': 'partner-port right hide',
				points: nodeWidth + ',' + (0.5 * nodeHeight - 5) + ' ' + (nodeWidth + 5) +',' + (0.5 * nodeHeight)
							+ ' ' + nodeWidth + ',' + (0.5 * nodeHeight + 5) + ' ' + (nodeWidth - 5) + ',' + (0.5 * nodeHeight)
			});

		_updateD3Nodes(newNodes, true);

		if (addEventsCallback)
			newNodes = addEventsCallback(newNodes);
		return newNodes;
	};

    function _updateD3Nodes(nodes, onlyBasicInfo) {		
		if (!nodes || nodes.empty())
			return;
		
		if (onlyBasicInfo === true){ // includes image, texts and sex
			_updateD3NodeTexts(nodes);
			_updateD3NodeColors(nodes);
			_updateD3NodeImages(nodes);
			return;
		}

		//extraParams is an array of relationship links
		
		nodes.classed('selected', function (d) { return d.selected; });

		var xS = xScale(1) - xScale(0),
			yS = yScale(1) - yScale(0);
				
		nodes.each(function(d){
			var d3selection = d3.select(this);
			var tx = xScale(d.x);
			var ty = yScale(d.y);
			d3selection.attr('transform', 'translate(' + tx + ', ' + ty + ') scale(' + xS + ',' + yS + ')');
			d3selection.selectAll('.node-base, .partner-port, circle').attr('stroke-width', 2 / currentScale);
			// image section
			d3selection.selectAll('.node-image').attr('stroke-width', 1 / currentScale);			
		});

		nodes.selectAll('.partner-port').classed('hide', function(d){
			var relLinks = util.tree.getRelationshipsByPartner(d.id, dataRelLinks);
			if (relLinks.length){
				if (relLinks.some(function(rel){ return rel.fromNode == d.id;}) && d3.select(this).classed('right'))
					return false;
				if (relLinks.some(function(rel){ return rel.toNode == d.id;}) && d3.select(this).classed('left'))
					return false;
			}
			return true;
		});
	};

    function _updateD3NodeColors(nodes){
		if (!nodes || nodes.empty())
			return;	
		nodes.classed('male', function (d) { return d.sex.toUpperCase() == 'M'; });
		nodes.classed('female', function (d) { return d.sex.toUpperCase() == 'F'; });
	};

	function _updateD3NodeImages(nodes){
		if (!nodes || nodes.empty())
			return;
		nodes.selectAll('img.node-image').attr('href', function(d){ return d.image || null; });
	};

	function _updateD3NodeTexts(nodes){
		if (!nodes || nodes.empty())
			return;

		nodes.each(function(d){
			var selection = d3.select(this);
			selection.selectAll('.name').text(d.visible.name);
			selection.selectAll('.surname').text(d.visible.surname);
			_setD3NodeDescription(selection);
		});
	};

	function _setD3NodeDescription(nodeD3){
		if (!nodeD3 || nodeD3.empty())
            return;
	
		var node = nodeD3.datum();
        if (!node)
        	return;
        
        node.hasPartialDescr = false;

        var text = node.description;

        var descrDom = nodeD3.select('.description').node();
        while (descrDom.lastChild)
            descrDom.removeChild(descrDom.lastChild);
        
        // remove all children of description group element
        var d3descr = d3.select(descrDom);
        d3descr.empty();

        var descrFontSize = 14,
        	descrFont = '"Helvetica Neue",Helvetica,Arial,sans-serif',
        	descrFontWeight = 600,
        	fontSize = 20,
    		descrW = nodeWidth - (3 * nodePadding + imageSize), 
			descrH = nodeHeight - (2 * fontSize + 3 * 3 + 2 * nodePadding);

        var rowSpace = 2;

        var rows = util.text.getTextRows(text, descrW, descrFontWeight, descrFont, descrFontSize, null);
        rows.forEach(function(row, i){
        	d3descr.append('text')
        		.attr('x', descrW * 0.5)
        		.attr('y', descrFontSize * (i + 1) + rowSpace * i)
        		.text(row);
        });
        
        descrDom = d3descr.node();
        var boxH = descrDom.getBBox().height;	

        if (descrDom.getBBox().height <= descrH || !descrDom.lastChild)
        	return;

        node.hasPartialDescr = true;

        while (boxH > descrH && descrDom.lastChild){
        	descrDom.removeChild(descrDom.lastChild);
        	boxH = descrDom.getBBox().height;
        }

        if (!descrDom.lastChild){
        	d3descr.append('text').attr('x', descrW * 0.5).attr('y', descrFontSize).text('...');
        } else {
        	var t = descrDom.lastChild.innerHTML;
        	descrDom.lastChild.innerHTML = t  + '...';
        	while (descrDom.lastChild.getBBox().width > descrW && t.length){
        		console.log(t, descrDom.lastChild.getBBox().width, descrW)
        		t = t.substr(0, t.length - 1);
        		descrDom.lastChild.innerHTML = t  + '...';
        	}
        }
    };

    function _addEventsToGroups(groups){
    	if (!groups || groups.empty())
    		return groups;

    	/*		if (isTouchDevice){
			console.log('to do');
			return;
		}
*/
		var textarea = groups.selectAll('.group-textarea');

		function onMouseOverGroup(g){
        	groupOver = g;

            d3.select(this).selectAll('.resizers').classed('hidden', false);
            // show tooltip if nodes are too small or they have partial texts
			var maxScale = g.textSize || 14;
			maxScale = 0.75 * 14 / maxScale; 
			var toShow = currentScale < maxScale || g.hasPartialText;
			if (toShow)
				TooltipManager.show(groupOver, 200);
        };

        function onMouseOutGroup(g){
            d3.select(this).selectAll('.resizers').classed('hidden', true);
            // hide tooltip
            groupOver = null;
			TooltipManager.hide(200);
        };

		function onMouseDownGroup(g){
			CtxMenuManager.hide();
			if (g.selected) { // multiple selection
				if (d3.event.ctrlKey)
					deselectGroup(g);
			} else {
				if (!d3.event.ctrlKey) // single selection
					deselectAll();
				selectGroup(g);
			}
		};

		function onClickGroup(g){
			if (!d3.event.ctrlKey) {
				deselectAll();
				selectGroup(g);
			}
		};

		// Add event listeners
		CtxMenuManager.onRightClick('group', textarea, svg, { 
			getSelectionCount: function(){
				var count = dataNodes.filter(function(n){return n.selected;}).length;
					count += dataRelLinks.filter(function(n){return n.selected;}).length;
					count += dataChildLinks.filter(function(n){return n.selected;}).length;
					count += dataGroups.filter(function(n){return n.selected;}).length;
				return count;
			}
		});

        textarea
            .on('mousedown', onMouseDownGroup)
			.on('click', onClickGroup)
            .on('mouseover', onMouseOverGroup)
            .on('mouseout', onMouseOutGroup)
            .call(
            	d3.behavior.drag()
		            .on('dragstart', onStartToMoveGroups)
		            .on('drag', onMovingGroups)
		            .on('dragend', onFinishToMoveGroups)
	        );

		return groups;
    };	   
	
	function drawGroups() {
		if (!svg || svg.empty())
			return;
		
		var groups = svg.select('.groups').selectAll('.group')
			.data(dataGroups, function(g){return g.id});

		groups.exit().remove();

		_createD3Groups(groups.enter(), _addEventsToGroups);
		_updateD3Groups(groups);
	};

	function _createD3Groups(groupsToAdd, addEventsCallback){
		var groups = groupsToAdd.append('g').attr('class', 'group')
			.attr('id', function (d) { return 'group-' + d.id; });
			
		groups.append('polyline').attr('class', 'group-area');
		groups.append('line').attr('class', 'pointer');

		var textarea = groups.append('g').attr('class', 'group-textarea');

		textarea.append('rect').attr('class', 'background')
			.attr({ x: -2, y: -2});

		textarea.append('rect').attr('class', 'textarea');
		textarea.append('g').attr('class', 'textarea');

		groups.each(function(){_updateD3GroupText(d3.select(this))});

		var resizers = textarea.append('g').attr('class', 'resizers hidden');
		resizers.append('rect').attr('class', 'resizer bottom-right')
			.attr('width', resizersSide)
        	.attr('height', resizersSide);

/*		if (isTouchDevice){
			console.log('to do');
			return;
		}
*/
		if (addEventsCallback)
			groups = addEventsCallback(groups);

		return groups;
	};



	function _updateD3GroupText(d3group){
        if (!d3group || d3group.empty())
        	return;

        var data = d3group.datum();
        if (!data)
        	return;
        
        var text = data.text;

        data.hasPartialText = false;
		
        var textareaDom = d3group.select('g.textarea').node();
        while (textareaDom.lastChild)
            textareaDom.removeChild(textareaDom.lastChild);
        
        // remove all children of group's textarea element
        var d3textarea = d3.select(textareaDom);
        d3textarea.empty();

        var textSize = data.textSize,
        	textFont = 'font-family: Verdana, sans-serif;',
    		areaW = data.width - 4 * groupPadding, 
			areaH = data.height - 3 * groupPadding,
			rowSpace = 2 * textSize / 14;

        var rows = util.text.getTextRows(text, areaW, null, textFont, textSize, null);
        rows.forEach(function(row, i){
        	d3textarea.append('text')
        		.attr('text-rendering', 'geometricPrecision')
        		.attr('y', textSize * (i + 1) + rowSpace * i)
        		.text(row);
        });
        
        textareaDom = d3textarea.node();
        var box = textareaDom.getBBox(),
        	boxH = box.height,
        	boxW = box.width;	

        if ((boxH <= areaH && boxW <= areaW)|| !textareaDom.lastChild)
        	return;

        data.hasPartialText = true;

        while (boxH > areaH && textareaDom.lastChild){
        	textareaDom.removeChild(textareaDom.lastChild);
        	boxH = textareaDom.getBBox().height;
        }

        if (!textareaDom.lastChild){
        	d3textarea.append('text').attr('text-rendering', 'geometricPrecision').attr('y', textSize).text('...');
        } else {
        	d3textarea.selectAll('text').each(function(){
	        	var tDom = this;
        		var t =  tDom.innerHTML;
        		while (tDom.getBBox().width > areaW && t.length){
	        		t = t.substr(0, t.length - 1);
	        		tDom.innerHTML = t  + '...';
	        	}
        	});
        }
    }

	function _renderGroup(d3selection, g, xs, ys, scale){
		if (!d3selection || d3selection.empty() || !g)
			return;

		xs = xs || xScale;
		ys = ys || yScale;
		scale = scale || currentScale;

		var arrowHeadSide = 20,
			color = g.color || groupColor;

		// rectangle which groups nodes
		var nodes = [];
		g.nodes.forEach(function(nId){
			var node = getNodeById(nId);
			if (node) nodes.push(node);
		});
		var canvasInfo = _getNodesViewport(nodes);
		var x0 = xs(canvasInfo.xRange[0] - groupPadding),
			x1 = xs(canvasInfo.xRange[1] + groupPadding),
			y0 = ys(canvasInfo.yRange[0] - groupPadding),
			y1 = ys(canvasInfo.yRange[1] + groupPadding);
		
		d3selection.select('.group-area').classed('hidden', !g.nodes || !g.nodes.length)
			.attr('points', x0 + ',' + y0 + ' ' + x1 + ',' + y0 + ' ' + x1 + ',' + y1 + ' ' + x0 + ',' + y1 + ' ' + x0 + ',' + y0)
			.style('stroke', color);

		// text area which contains comment
		var rectTextArea = d3selection.select('rect.textarea');
		var textArea = d3selection.select('.group-textarea g.textarea');

        var bx = (x0 + x1) * 0.5,
        	by = (y0 + y1) * 0.5,
        	vx0 = xs(g.x),
			vy0 = ys(g.y + g.height * 0.5),
			vx1 = xs(g.x + g.width * 0.5),
			vy1 = ys(g.y + g.height),
			vx2 = xs(g.x + g.width),
			vy2 = ys(g.y + g.height * 0.5),
			vx3 = xs(g.x + g.width * 0.5),
			vy3 = ys(g.y),
			vertex_gArea = [
				[x0, by], [bx, y1], [x1, by], [bx, y0]
			],
			vertex_tArea = [
				[vx0, vy0], [vx1, vy1], [vx2, vy2], [vx3, vy3]
			];

		var minDist = Number.MAX_SAFE_INTEGER;
			pointerVertex = null;
		vertex_gArea.forEach(function(vg){
			vertex_tArea.forEach(function(vt){
				var dist = (vg[0] - vt[0]) * (vg[0] - vt[0]) + (vg[1] - vt[1]) * (vg[1] - vt[1]); 
				if (dist < minDist){
					minDist = dist;
					pointerVertex = {tArea: vt, gArea: vg};
				}
			});
		});

		d3selection.select('line.pointer').classed('hidden', !g.nodes || !g.nodes.length);

		if (pointerVertex){				
			d3selection.select('line.pointer')
				.attr('x1', pointerVertex.tArea[0])
				.attr('y1', pointerVertex.tArea[1])
				.attr('x2', pointerVertex.gArea[0])
				.attr('y2', pointerVertex.gArea[1])
				.style('stroke', color);
				/*
			var head = d3selection.select('polygon.pointer');
			head.attr('points', '0,0 ' + arrowHeadSide + ',' + arrowHeadSide / 2 + ' 0,' + arrowHeadSide + ' ' + arrowHeadSide / 10 + ',' + arrowHeadSide / 2);
			
			var arrowHeadX = arrowHeadSide,
                arrowHeadY = arrowHeadSide / 2,
                tX = pointerVertex.gArea[0] - arrowHeadX,
                tY = pointerVertex.gArea[1] - arrowHeadY,
                alpha = link.angle * 180 / Math.PI; // angle of rotation
			head.attr('transform', return 'translate(' + tX + ', ' + tY + ')' +
                ' rotate(' + alpha + ', ' + arrowHeadX + ', ' + arrowHeadY + ')';
            // center of rotation is arrowHead's point
        });*/
    	}

    	var p = [vx0, vy3],
    		w = xs(g.width) - xs(0),
    		h = ys(g.height) - ys(0);

		textArea
			.attr('transform', 'translate(' + groupPadding * scale + ',' + groupPadding * scale + ')')
			.selectAll('text')
			.style('font-size', g.textSize * scale + 'px')
			.attr('y', function(d, i){ 
				var textSize = g.textSize || 14,
					lineSpacer = 2 * textSize / 14;
				return (textSize * (i + 1) + lineSpacer * i) * scale; 
			});

		d3selection.select('.background')
			.style('stroke-width', 4)
			.attr({ width: w + 4, height: h + 4});
        
		rectTextArea.attr({	'width': w, 'height': h })
			.style('fill', color)
			.style('stroke', color);

        var resizer = d3selection.select('.resizer.bottom-right');
        if (resizer.empty())
        	return;
        resizer.attr('x', w - resizersSide)
        	.attr('y', h - resizersSide)
        	.attr('fill', util.color.invert(color));

    	d3selection.select('.group-textarea').attr('transform', 'translate(' + p[0] + ',' + p[1] +')');
	};

	function _updateD3Groups(groups){
		if (!groups || groups.empty())
			return;
		
		groups.classed('selected', function (d) { return d.selected; });

		groups.each(function(g){
			_renderGroup(d3.select(this), g);
		});
	};

	function drawLinks() {
		drawRelLinks();
		drawChildLinks();
	};

	function _addEventsToRelLinks(links){
		if (!links || links.empty())
			return; 

		/*		if (isTouchDevice){
			console.log('to do');
			return;
		}
*/		

		function onMouseOverLink(link){
			relLinkOver = link;
			d3.select(this).selectAll('.children-port').classed('hide', link == tmpRelLink || (link != relLinkOver && !link.hasChildren));
		};

		function onMouseOutLink(link){
			relLinkOver = null;
			d3.select(this).selectAll('.children-port').classed('hide', !link.hasChildren);
		};
		
		function onMouseDownLink(link){
			CtxMenuManager.hide();
			if (link.selected) { // multiple selection
				if (d3.event.ctrlKey)
					deselectRelLink(link);
			} else {
				if (!d3.event.ctrlKey) // single selection
					deselectAll();
				selectRelLink(link);
			}
		};

		function onClickLink(link){
			if (!d3.event.ctrlKey) {
				deselectAll();
				selectRelLink(link);
			}
		};

		links.on('mouseover', onMouseOverLink)
			.on('mouseout', onMouseOutLink)
			.on('mousedown', onMouseDownLink)
			.on('click', onClickLink);			

		links.selectAll('.children-port')
			.classed('hide', function(link){ return /*....*/})
			.call(
				d3.behavior.drag()
		            .on('dragstart', onStartChildLink)
		            .on('drag', onMoveChildLink)
		            .on('dragend', onEndChildLink)
            );

        return links;
	};
	
	function drawRelLinks() {
		if (!svg || svg.empty())
			return; 
		
		var links = svg.select('.relationship-links').selectAll('.link')
			.data(dataRelLinks, util.tree.getId);
		
		links.exit().remove();

		//create new bricks
		_createD3RelLinks(links.enter(), _addEventsToRelLinks);
		_updateD3RelLinks(links);
	};
	
	function _createD3RelLinks(linksToAdd, addEventsCallback){
		var newLinks = linksToAdd.append('g').attr({
			'id': function(d){ return 'link-' + d.id; },
			'class': 'link'
		});
		
		newLinks.append('path')
			.attr({
				'class': 'visible-link',
				'stroke-width': '2px'
			});
		
		newLinks.append('path').attr('class', 'hidden-link');

		newLinks.append('circle')
			.style('stroke-width',  2)
			.attr({
				'class': 'children-port', 
				r: '5px'
			});


        if (addEventsCallback)
        	newLinks = addEventsCallback(newLinks);
		
		return newLinks;		
	};

	function _renderRelLink(d3selection, link, xs, ys, scale){
		if (!d3selection || !link || d3selection.empty())
			return;
		xs = xs || xScale;
		ys = ys || yScale;
		scale = scale || currentScale;

		var p1 = getNodeById(link.fromNode) || link.extraCoords,
			p2 = getNodeById(link.toNode) || link.extraCoords;
		var points = {
			x1: p1.x + nodeWidth,
			y1: p1.y + (nodeHeight) * 0.5, 
			x2: p2.x,
			y2: p2.y + (nodeHeight) * 0.5
		};
		d3selection.select('path').attr('d', util.tree.drawLine(points, 'lr', xs, ys));
		var x1 = p1.x,
			y1 = Math.min(p1.y, p2.y),
			x2 = p2.x,
			y2 = (y1 == p1.y) ? p2.y : p1.y;
		d3selection.select('.children-port').attr({
			'cx': xs((x2 + x1 + nodeWidth) * 0.5),
			'cy': ys((y2 + y1 + nodeHeight ) * 0.5),
			'r': 5 * scale,
			'stroke-width': 2 / scale
		});
	};

	function _updateD3RelLinks(links){
		links
			.classed('selected', function (d) { return d.selected; })
			.each(function(d){
				_renderRelLink(d3.select(this), d);
			})
			.selectAll('.children-port').classed('hide', function(link){ 
				return link == tmpRelLink || (link != relLinkOver && !link.hasChildren);
			});
	};

	function _addEventsToChildLinks(links){
		if (!links || links.empty())
			return; 

		/*		if (isTouchDevice){
			console.log('to do');
			return;
		}
*/		
		
		function onMouseDownLink(link){
			CtxMenuManager.hide();
			if (link.selected) { // multiple selection
				if (d3.event.ctrlKey)
					deselectChildLink(link);
			} else {
				if (!d3.event.ctrlKey) // single selection
					deselectAll();
				selectChildLink(link);
			}
		};

		function onClickLink(link){
			if (!d3.event.ctrlKey) {
				deselectAll();
				selectChildLink(link);
			}
		};
		
		links
			.on('mousedown', onMouseDownLink)
			.on('click', onClickLink);	

		return links;
	};
	
	function drawChildLinks() {
		if (!svg || svg.empty())
			return; 
		
		var links = svg.select('.children-links').selectAll('.link')
			.data(dataChildLinks, util.tree.getId);

		links.exit().remove();

		_createD3ChildLinks(links.enter(), _addEventsToChildLinks);
		_updateD3ChildLinks(links);
	};
	
	function _createD3ChildLinks(linksToAdd, addEventsCallback){
		var newLinks = linksToAdd.append('g').attr({
			'id': function(d){ return 'link-' + d.id; },
			'class': 'link'
		});
		
		newLinks.append('path')
			.attr({
				'class': 'visible-link',
				'stroke-width': '2px'
			});
		
		newLinks.append('path').attr('class', 'hidden-link');
		
		if (addEventsCallback)
        	newLinks = addEventsCallback(newLinks);

		return newLinks;
	};

	function getStartPoint(d){
		var id = d.relId;
			rel = getRelLinkById(id),
			p1 = getNodeById(rel.fromNode),
			p2 = getNodeById(rel.toNode);
		var x1 = Math.min(p1.x, p2.x),
			y1 = Math.min(p1.y, p2.y),
			x2 = (x1 == p1.x) ? p2.x : p1.x,
			y2 = (y1 == p1.y) ? p2.y : p1.y;
		var startPoint = { 
			x: (x2 + x1 + nodeWidth) * 0.5, 
			y: (y2 + y1 + nodeHeight ) * 0.5
		};
		return startPoint;
	};
	
	function getEndPoint(d){
		var x, y;
		if (d.childId){
			var child = getNodeById(d.childId);
			if (child){
				x = child.x + nodeWidth * 0.5, 
				y = child.y;
			} 
		} else {
			x = d.extraCoords.x;
			y = d.extraCoords.y; 
		}		
		return { 
			x: x, 
			y: y
		};
	};

	function _updateD3ChildLinks(links){
		links.classed('selected', function (d) { return d.selected; });
				
		links.each(function(d){
			_renderChildLink(d3.select(this), d);
		});
	};

	function _renderChildLink(d3selection, link, xs, ys){
		if (!link || !d3selection || d3selection.empty())
			return;
		xs = xs || xScale;
		ys = ys || yScale;

		var p1 = getStartPoint(link);
		var p2 = getEndPoint(link);
		// link path
		var points = {
			x1: p1.x,
			y1: p1.y, 
			x2: p2.x,
			y2: p2.y
		};
		d3selection.selectAll('path').attr('d', util.tree.drawLine(points, 'tb', xs, ys));
	};

	function moveToFront(object) {
        object = object.length ? (object[0].length ? object[0][0] : object[0]) : object;
        
        if (dataNodes.indexOf(object) == -1 && dataRelLinks.indexOf(object) == -1 && dataChildLinks.indexOf(object) == -1 && !(object instanceof SVGElement)) 
            return;
        
        if (dataNodes.indexOf(object) != -1) 
            dom = getD3Node(object).node();
        else if (dataRelLinks.indexOf(object) != -1) 
            dom = getD3RelLink(object).node();
        else if (dataChildLinks.indexOf(object) != -1) 
            dom = getD3ChildLink(object).node();
        else
            dom = object;
        
        if (dom && dom.parentNode) dom.parentNode.appendChild(dom);
    };

    function _updateLinkToPartnerItem(){
        var allSelected = dataNodes.filter(function(n){return n.selected == true; });
		if (allSelected.length == 2){
			var fromNode = nodeOver;
			var toNode = (fromNode == allSelected[0]) ? allSelected[1] : allSelected[0];
			if (!util.tree.haveRelationship(fromNode.id, toNode.id, dataRelLinks) 
					&& !util.tree.isChildOf(fromNode.id, toNode.id, dataRelLinks, dataChildLinks) 
					&& !util.tree.isParentOf(fromNode.id, toNode.id, dataRelLinks, dataChildLinks)) {
				tmpFromNode = fromNode;
				tmpToNode = toNode;
				CtxMenuManager.enableLinkToPartner();
				return;
			}
		}
		tmpFromNode = null;
		tmpToNode = null;
		CtxMenuManager.disableLinkToPartner();
    };

    function _updateAddToGroupsItem(){
    	var $li = $('#add-to-group').parent('li'),
			menu = $li.find('.dropdown-menu');

		// remove last groups list
		menu.find('.existing-group,.divider').each(function(){$(this).remove()});

    	if (!dataNodes.length)
			return;
		
		var lastEl = menu.find('#add-to-new-group').parent('li');

		var groupsList = [];
		dataGroups.forEach(function(g){
			groupsList.push({id: g.id, text: g.text});
		});

		if (groupsList.length){
			groupsList.sort(function(a, b) {
				var tA = a.text.toUpperCase(); // ignore upper and loadd-to-new-groupwercase
				var tB = b.text.toUpperCase(); // ignore upper and lowercase
				if (tA < tB) return -1;
				if (tA > tB) return 1;
				// texts must be equal
				return 0;
			});

			groupsList.forEach(function(g){
				var text = g.text.split(/\r\n|\r|\n/),
					li = '<li class="existing-group"><a tabindex="-1" href="#" id="add-to-existing-group-' + g.id + '">';
				li += text[0];
				if (text.length > 1) 
					li += '...</a></li>';
				lastEl.before(li);
			});
			lastEl.before('<li class="divider"></li>');
			menu.on('click', '.existing-group a', function(){
				var el = this,
					$el = $(this),
					id = $el.attr('id').substring(22);
				while (el && el.className.indexOf('dropdown-menu') == -1)
					el = el.parentNode;
				if (el)
					$(el).hide();
				CtxMenuManager.getContextMenu('node').hide();
				var group = getGroupById(id),
					nodesToAdd = dataNodes.filter(function(n){return n.selected == true && group.nodes.indexOf(n.id) == -1;});
				addNodesTo(nodesToAdd, group);
			})
		}
    };

    function _updateRemoveFromGroupsItem(){
    	var $li = $('#remove-from-group').parent('li'),
			menu = $li.find('.dropdown-menu');

		// remove last groups list
		menu.find('.existing-group').each(function(){$(this).remove()});

    	var allSelected = dataNodes.filter(function(n){return n.selected == true; });
		if (allSelected.length){
			var groupsList = [];
			allSelected.forEach(function(node){
				var groups = util.tree.getGroupsByNode(node, dataGroups);
				groups.forEach(function(g){ 
					if (groupsList.indexOf(g) != -1)
						return;
					groupsList.push({id: g.id, text: g.text});
				});
				groupsList.sort(function(a, b) {
					var tA = a.text.toUpperCase(); // ignore upper and loadd-to-new-groupwercase
					var tB = b.text.toUpperCase(); // ignore upper and lowercase
					if (tA < tB) return -1;
					if (tA > tB) return 1;
					// texts must be equal
					return 0;
				});
				groupsList.forEach(function(g){
					var text = g.text.split(/\r\n|\r|\n/),
						li = '<li class="existing-group"><a tabindex="-1" href="#" id="remove-from-existing-group-' + g.id + '">';
					li += text[0];
					if (text.length > 1) 
						li += '...</a></li>';
					menu.append(li);
				});
				menu.on('click', '.existing-group a', function(){
					var el = this,
						$el = $(this),
						id = $el.attr('id').substring(27);
					while (el && el.className.indexOf('dropdown-menu') == -1)
						el = el.parentNode;
					if (el)
						$(el).hide();
					CtxMenuManager.getContextMenu('node').hide();
					var group = getGroupById(id),
						nodesToRemove = dataNodes.filter(function(n){return n.selected == true && group.nodes.indexOf(n.id) != -1;});
					removeNodesFrom(nodesToRemove, group);
				});
			});
			if (groupsList.length){
				$li.find('#remove-from-group').removeClass('disabled');
				return;
			}
		}
        $li.find('#remove-from-group').addClass('disabled');
    };
	
    function selectGroup(group){
		if (!group || group.selected)
            return;
		group.selected = true;
		d3.timer(function () {
            moveToFront(group);
            var d3Group = getD3Group(group);
            if (d3Group){
            	d3Group.classed('selected', true);
            }           
            return true;
        });
	};
	
	function deselectGroup(group){
		if (!group)
			return;
		group.selected = false;
		d3.select('.group#group-' + group.id).classed('selected', false);	
	};

	function selectNode(node){
		if (!node || node.selected)
            return;
		node.selected = true;
		d3.timer(function () {
            moveToFront(node);
            var d3Node = getD3Node(node);
            if (d3Node){
            	d3Node.classed('selected', true);
            	 d3Node.selectAll('.partner-port').classed('hide', nodeOver != node);	
            }           
            return true;
        });
        var linksToSelect = dataRelLinks.filter(function (link) {
            return (link.fromNode == node.id || link.toNode == node.id) && !link.selected;
        });
        linksToSelect.forEach(selectRelLink); 
        linksToSelect = dataChildLinks.filter(function (link) {
            return link.childId == node.id && !link.selected;
        });
        linksToSelect.forEach(selectChildLink);
	};
	
	function deselectNode(node){
		if (!node)
			return;
		node.selected = false;
		d3.select('.node#node-' + node.id).classed('selected', false);		
		var linksToRemove = dataRelLinks.filter(function (link) {
			var p1 = getNodeById(link.fromNode);
			var p2 = getNodeById(link.toNode);
            return (link.fromNode == node.id && p2 && !p2.selected) || (link.toNode == node.id && p1 && !p1.selected);
        });
        linksToRemove.forEach(deselectRelLink);		
		linksToRemove = dataChildLinks.filter(function (link) {
			var rel = getRelLinkById(link.relId);
            return link.childId == node.id && rel && !rel.selected;
        });
        linksToRemove.forEach(deselectChildLink);
	};

	function selectRelLink(link){
		if (!link || link.selected)
            return;		
		link.selected = true;      
		d3.timer(function () {
            moveToFront(link);
            var d3Link = getD3RelLink(link);
            if (d3Link){
            	d3Link.classed('selected', true);
				d3Link.selectAll('.children-port').classed('hide', link == tmpRelLink || (link != relLinkOver && !link.hasChildren));
			}           
            return true;
        });
		var linksToSelect = dataChildLinks.filter(function (l) {
            return l.relId == link.id && !l.selected;
        });
		linksToSelect.forEach(selectChildLink);
	};
	
	function deselectRelLink(link){
		if (!link)
			return;
		link.selected = false;		
		d3.select('.link#link-' + link.id).classed('selected', false);
		
		var linksToRemove = dataChildLinks.filter(function (clink) {
            return clink.relId == link.id && clink.selected;
        });
		
		linksToRemove.forEach(deselectChildLink);
	};
	
	function selectChildLink(link){
		if (!link || link.selected)
            return;
		link.selected = true;
		d3.timer(function () {
            moveToFront(link);
            var d3Link = getD3ChildLink(link);
            if (d3Link){
            	d3Link.classed('selected', true);
            }     
            return true;
        });
	};
	
	function deselectChildLink(link){
		if (!link)
			return;
		link.selected = false;		
		d3.select('.link#link-' + link.id).classed('selected', false);
	};

	function deselectAll(){
		dataGroups.forEach(function(d){d.selected = false; });
		dataNodes.forEach(function(d){d.selected = false; });
		dataRelLinks.forEach(function(d){d.selected = false; });
		dataChildLinks.forEach(function(d){d.selected = false; });
		update();
	};

	function selectAll(){
		dataGroups.forEach(function(d){d.selected = true; });
		dataNodes.forEach(function(d){d.selected = true; });
		dataRelLinks.forEach(function(d){d.selected = true; });
		dataChildLinks.forEach(function(d){d.selected = true; });
		update();
	};
	
	var posB4Drag;

	function onStartToMoveGroups (group) {
		if (d3.select(d3.event.sourceEvent.target).classed('resizer')){
			onStartToResizeGroup(group);
			return;
		}

        var selection = dataGroups.filter(function(group){return group.selected;});
        selection.forEach(function (group) {
            group.lastX = group.x;
            group.lastY = group.y;
        });
/*        if (isTouchDevice){
        	console.log('to do')
        	return
        }
*/        posB4Drag = d3.mouse(svg.node());
    };
	
    function onMovingGroups (group) {
    	if (isResizingGroup == group){
    		onResizingGroup(group);
			return;
    	}
        var posOnDrag = (isTouchDevice) ? [NaN, NaN] : d3.mouse(svg.node());
        if (posB4Drag && (Math.abs(posOnDrag[0] - posB4Drag[0]) < 5 && Math.abs(posOnDrag[1] - posB4Drag[1]) < 5))
            return;
        posB4Drag = null;
        var xRange = xScale.domain(),
            yRange = yScale.domain(),
            t = { x: 0, y: 0 };
        var selection = dataGroups.filter(function(group){return group.selected; });
		selection.forEach(function (group) {
	        group.x = xScale.invert(d3.event.dx + xScale(group.x));
	        group.y = yScale.invert(d3.event.dy + yScale(group.y));
			group.dragging = true;
		});

        var canvasOfDragging = {
            xRange: [d3.min(selection, function (group) { return group.x; }), d3.max(selection, function (group) { return group.x + group.width; })],
            yRange: [d3.min(selection, function (group) { return group.y; }), d3.max(selection, function (group) { return group.y + group.height; })]
        };

        var speed = 5;
        if (xRange[0] > canvasOfDragging.xRange[0])
            t.x = speed;
        else if (xRange[1] < canvasOfDragging.xRange[1])
			t.x = -speed;
        if (yRange[0] > canvasOfDragging.yRange[0])
            t.y = speed;
        else if (yRange[1] < canvasOfDragging.yRange[1])
            t.y = -speed;
        setTranslateSpeed(t.x, t.y);
    };

    
    function onFinishToMoveGroups(group) {
    	if (isResizingGroup == group){
    		onFinishToResizeGroup(group);
			return;
    	}
        posB4Drag = null;
        group.dragging = false;
        var groups = dataGroups.filter(function(g){return g.selected;}).concat(); // clone array of moved groups
        if (!groups.length)
            return;
        groups.forEach(function (group) {
            group.dragging = false;
        });
        var group = groups[0];
        var deltaX = Math.round(group.x) - group.lastX;
        var deltaY = Math.round(group.y) - group.lastY;
        if (deltaX || deltaY){
            moveGroups(groups, deltaX, deltaY);
            setTranslateSpeed(0,0);
        }
    };
	
	function onStartToMoveNodes (node) {
        var selection = dataNodes.filter(function(n){return n.selected;});
        selection.forEach(function (n) {
            n.lastX = n.x;
            n.lastY = n.y;
        });
/*        if (isTouchDevice){
        	console.log('to do')
        	return
        }
*/        posB4Drag = d3.mouse(svg.node());
    };
	
    function onMovingNodes () {
        var posOnDrag = (isTouchDevice) ? [NaN, NaN] : d3.mouse(svg.node());
        if (posB4Drag && (Math.abs(posOnDrag[0] - posB4Drag[0]) < 5 && Math.abs(posOnDrag[1] - posB4Drag[1]) < 5))
            return;
        posB4Drag = null;
        var xRange = xScale.domain(),
            yRange = yScale.domain(),
            t = { x: 0, y: 0 };
        var selection = dataNodes.filter(function(n){return n.selected; });
		selection.forEach(function (node) {
            node.x = xScale.invert(d3.event.dx + xScale(node.x));
            node.y = yScale.invert(d3.event.dy + yScale(node.y));
			node.dragging = true;
        });
        // get area of dragging nodes and if it is out of range, the viewport will properly scroll
        var canvasOfDragging = {
            xRange: d3.extent(selection, function (n) { return n.x; }),
            yRange: d3.extent(selection, function (n) { return n.y; })
        };

        var speed = 5;
        if (xRange[0] > canvasOfDragging.xRange[0])
            t.x = speed;
        else if (xRange[1] < canvasOfDragging.xRange[1] + nodeWidth)
			t.x = -speed;
        if (yRange[0] > canvasOfDragging.yRange[0])
            t.y = speed;
        else if (yRange[1] < canvasOfDragging.yRange[1] + nodeHeight)
            t.y = -speed;

		setTranslateSpeed(t.x, t.y);
    };

    
    function onFinishToMoveNodes() {
        posB4Drag = null;
        var nodes = dataNodes.filter(function(n){return n.selected;}).concat(); // clone array of moved nodes
        if (!nodes.length)
            return;
        nodes.forEach(function (node) {
            node.dragging = false;
        });
        var node = nodes[0];
        var deltaX = Math.round(node.x) - node.lastX;
        var deltaY = Math.round(node.y) - node.lastY;
        if (deltaX || deltaY){
            moveNodes(nodes, deltaX, deltaY);
            setTranslateSpeed(0,0);
        }
    };
		
    function onStartToResizeGroup(group) {
        group.oldWidth = group.width;
        group.oldHeight = group.height;
        isResizingGroup = group;
        var d3group = getD3Group(group);
        d3group.select('.resizers').classed('hidden', false);
    };
	
    function onResizingGroup(group) {
        // mouse position
        var mousePos = d3.mouse(svg.node());

        var w = xScale.invert(mousePos[0]) - group.x;
        var h = yScale.invert(mousePos[1]) - group.y;

        var minSize = Math.max(2 * resizersSide / currentScale, 2 * groupPadding + group.textSize);
        group.width = Math.max(w, minSize);
        group.height = Math.max(h, minSize);

        //draw
        var d3group = getD3Group(group);
        _updateD3GroupText(d3group);
        _updateD3Groups(d3group);

        var xRange = xScale.domain(),
            yRange = yScale.domain(),
            t = { x: 0, y: 0 };

        var left = group.x + minSize,
        	top = group.y + minSize,
        	right = group.x + group.width,
        	bottom = group.y + group.height;

        var speed = 5;
        if (xRange[1] < right)
			t.x = -speed;
        if (yRange[1] < bottom)
            t.y = -speed;
        setTranslateSpeed(t.x, t.y);        
    };

    
    function onFinishToResizeGroup(group) {
    	isResizingGroup = null;
    	setTranslateSpeed(0, 0);  
        if (group.oldWidth == group.width && group.oldHeight == group.height)
            return;
        delete group.oldWidth;
        delete group.oldHeight;
        updateGroupValues(group, { width: group.width, height: group.height});
    };

	function onStartRelLink(node){
		if (!svg || svg.empty())
            return;
		var pos = (isTouchDevice) ? [NaN, NaN] : d3.mouse(svg.node());
		pos[0] = xScale.invert(pos[0]);
		pos[1] = yScale.invert(pos[1]) - nodeHeight * 0.5;
		
		tmpRelLink = { id: 'tmp-link', fromNode: null, toNode: null};

		var d3Node = getD3Node(node),
			triggerEl = d3.select(this);
		while (triggerEl && triggerEl.classed('.partner-port'))
			triggerEl = d3.select(triggerEl.node().parentNode);
		
		if (triggerEl && !triggerEl.empty() && triggerEl.classed('right')){
			if (d3Node)
				d3Node.classed('rel-from', true);
			tmpRelLink.fromNode = node.id;
			isCreatingRel = 'right';
		} else if (triggerEl && !triggerEl.empty() && triggerEl.classed('left')){
			if (d3Node)
				d3Node.classed('rel-to', true);
			tmpRelLink.toNode = node.id;
			isCreatingRel = 'left';
			pos[0] -= nodeWidth;
		}
		
		// draw temporary link
        var newPos = { x: pos[0], y: pos[1]};
		
		tmpRelLink.extraCoords = newPos;
		dataRelLinks.push(tmpRelLink);
		drawLinks();	
	};
	
	function onMoveRelLink(node){
		if (!isCreatingRel || !svg || svg.empty() )
            return;
        
		var pos = (isTouchDevice) ? [NaN, NaN] : d3.mouse(svg.node());
		pos[0] = xScale.invert(pos[0]);
		pos[1] = yScale.invert(pos[1]);

		var x = pos[0],
			y = pos[1] - nodeHeight * 0.5;

		var d3Node = getD3Node(node),
			d3To = d3.select('.rel-to'), d3From = d3.select('.rel-from');
		
		if (isCreatingRel == 'right'){
			tmpRelLink.toNode = null;
			tmpRelLink.extraCoords = {x: x, y: y};
			if (!d3To.empty()){
				var toNode = d3To.datum();
				if (!util.tree.haveRelationship(node.id, toNode.id, dataRelLinks)){
					tmpRelLink.toNode = toNode.id;
					tmpRelLink.extraCoords = null;
				}
			}
		} else { // left
			x -= nodeWidth;
			tmpRelLink.fromNode = null;
			tmpRelLink.extraCoords = {x: x, y: y};
			if (!d3From.empty()){
				var fromNode = d3From.datum();
				if (!util.tree.haveRelationship(node.id, fromNode.id, dataRelLinks)){
					tmpRelLink.fromNode = fromNode.id;
					tmpRelLink.extraCoords = null;
				}
			}
		}

		var t = { x: 0, y: 0 },
			speed = 5;
		if (tmpRelLink.extraCoords){
			x = pos[0];
			y = pos[1];
			if (xScale.domain()[0] > x)
				t.x = speed;
			else if (xScale.domain()[1] < x)
				t.x = -speed;
			if (yScale.domain()[0] > y)
				t.y = speed;
			else if (yScale.domain()[1] < y)
				t.y = -speed;
		}		
		setTranslateSpeed(t.x, t.y);
	};
	
	function onEndRelLink(node) {
		var i = dataRelLinks.indexOf(tmpRelLink);
		if (i != -1){
			dataRelLinks.splice(i, 1);
			drawRelLinks();
		}

		if (tmpRelLink.fromNode && tmpRelLink.toNode)
			createRelLink(getNodeById(tmpRelLink.fromNode), getNodeById(tmpRelLink.toNode));
		if (!svg || svg.empty())
			return;

		isCreatingRel = null;
		tmpRelLink = null;

		svg.select('.rel-from').classed('rel-from', false)
		svg.select('.rel-to').classed('rel-to', false);
        setTranslateSpeed(0, 0);
    };

    function onStartChildLink(relLink){
		if (!svg || svg.empty())
            return;

        var pos = (isTouchDevice) ? [NaN, NaN] : d3.mouse(svg.node());
		pos[0] = xScale.invert(pos[0]);
		pos[1] = yScale.invert(pos[1]);
		
		tmpChildLink = {
			id: 'tmp-link', 
			relId: relLink.id, 
			childId: null,
			extraCoords: {
				x: pos[0],
				y: pos[1]
			}
		};

		isCreatingChild = true;

		dataChildLinks.push(tmpChildLink);
		drawChildLinks();
        deselectAll();
	};
	
	function onMoveChildLink(relLink){
		if (!isCreatingChild || !svg || svg.empty() )
            return;
        
		var pos = (isTouchDevice) ? [NaN, NaN] : d3.mouse(svg.node());
		pos[0] = xScale.invert(pos[0]);
		pos[1] = yScale.invert(pos[1]);

		tmpChildLink.childId = null;
		tmpChildLink.extraCoords = {x: pos[0], y: pos[1]};

		var d3RelLink = svg.select('.relationship-links #link-' + relLink.id),
			d3ChildNode = svg.select('.child-node');
		
		if (!d3ChildNode.empty()){
			tmpChildLink.childId = d3ChildNode.datum().id;
			tmpChildLink.extraCoords = null;
		}

		var t = { x: 0, y: 0 },
			speed = 5;


		if (tmpChildLink.extraCoords){
			var x = pos[0];
			var y = pos[1];

			if (xScale.domain()[0] > x)
				t.x = speed;
			else if (xScale.domain()[1] < x)
				t.x = -speed;
			if (yScale.domain()[0] > y)
				t.y = speed;
			else if (yScale.domain()[1] < y)
				t.y = -speed;
		}
		
		setTranslateSpeed(t.x, t.y);
	};
	
	function onEndChildLink(node) {
		var i = dataChildLinks.indexOf(tmpChildLink);
		if (i != -1){
			dataChildLinks.splice(i, 1);
			drawChildLinks();
		}

		if (tmpChildLink.relId && tmpChildLink.childId)
			createChildLink(tmpChildLink.relId, tmpChildLink.childId);
		if (!svg || svg.empty())
			return;

		isCreatingChild = false;
		tmpChildLink = null;

		svg.select('.child-node').classed('child-node', false);
        setTranslateSpeed(0, 0);
    };
	
	function createNode(node) {
        if (!node) return;
        
        HistoryManager.execute(function () {
            createdNodes.createdId++;
            doCreateNode(node);
        }, function () {
            createdNodes.createdId--;
            undoCreateNode();
        });
    };

    function doCreateNode(node) {
        var creaId = createdNodes.createdId,
            allCreated = createdNodes.allCreated,
            doCallback = null;

        var action = HistoryManager.action;
        if (action == 'do') {
            var newNode = createFamilyNode(node);
            if (!newNode)
                return;
            allCreated[creaId] = newNode;
            do {
                creaId++;
                delete allCreated.createdId;
            } while (allCreated[creaId]);
        } else 
        	undoDeleteFamilyObjects([allCreated[creaId]],[], []);
        tmpNode = null; 
    	drawNodes();
    };

    function undoCreateNode(){
		var creaId = createdNodes.createdId,
            allCreated = createdNodes.allCreated;

        creaId++;
        if (creaId <= 0) {
            createdNodes.createdId = 0;
            return;
        }
        var created = allCreated[creaId];
        created = getNodeById(created.id);
        deleteFamilyObjects([created], [], [], []);
        drawNodes();
    };

    function createFamilyNode(node){
    	if (!node || !node.name)
    		return null;

    	node.id = util.tree.guid();
    	node.isNode = true;
        node.lastX = node.x;
    	node.lastY = node.y;
    	node.updateId = 0;
    	node.allUpdated = {
    		'0': {
    			name: node.name, 
				surname: node.surname, 
				description : node.description,
				sex: node.sex 
    		}
    	};
    	node.relationships = [];
    	node.visible = {
			name: _setVisibleText(node.name, node.id, 'name'),
			surname: _setVisibleText(node.surname, node.id, 'surname')
		};

    	dataNodes.push(node);

    	return node;
    };

    function createRelLink(fromNode, toNode){
        if (!fromNode || !toNode)
        	return;

        HistoryManager.execute(function () {
            createdRelLinks.createdId++;
            doCreateRelLink(fromNode, toNode);
        }, function () {
            createdRelLinks.createdId--;
            undoCreateRelLink();
        });
    };

    function doCreateRelLink(fromNode, toNode){
        var creaId = createdRelLinks.createdId,
            allCreated = createdRelLinks.allCreated;

        var action = HistoryManager.action;
        if (action == 'do') {
            var newLink = createFamilyRelLink(fromNode, toNode);
            drawRelLinks();

            allCreated[creaId] = {
            	id: newLink.id,
            	fromNode: newLink.fromNode,
            	toNode: newLink.toNode
            };
            do {
                creaId++;
                delete allCreated[creaId];
            } while (allCreated[creaId]);
        } else {
            undoDeleteFamilyObjects([], [allCreated[creaId]], [], []);
            draw();
        }
    };

    function undoCreateRelLink () {
        var creaId = createdRelLinks.createdId,
            allCreated = createdRelLinks.allCreated;

        creaId++;
        if (creaId <= 0) {
            createdRelLinks.createdId = 0;
            return;
        }
        var created = allCreated[creaId];
        created = getRelLinkById(created.id);
        deleteFamilyObjects([], [created], [], []);
        draw();
    };


    function createFamilyRelLink(fromNode, toNode){
    	if (!fromNode || !toNode)
    		return null;

    	fromNode = typeof(fromNode) == 'string' ? fromNode : fromNode.id;
    	toNode = typeof(toNode) == 'string' ? toNode : toNode.id;

    	if (util.tree.haveRelationship(fromNode, toNode, dataRelLinks))
    		return;

    	var newRelLink = {
    		id: util.tree.guid(),
    		fromNode: fromNode,
    		toNode: toNode
    	};

    	dataRelLinks.push(newRelLink);

    	return newRelLink;
    };

    function createChildLink(relationship, childNode){
        if (!relationship || !childNode)
        	return;

        HistoryManager.execute(function () {
            createdChildLinks.createdId++;
            doCreateChildLink(relationship, childNode);
        }, function () {
            createdChildLinks.createdId--;
            undoCreateChildLink();
        });
    };

    function doCreateChildLink(relationship, childNode){
        var creaId = createdChildLinks.createdId,
            allCreated = createdChildLinks.allCreated;

        var action = HistoryManager.action;
        if (action == 'do') {
            var newLink = createFamilyChildLink(relationship, childNode);
            drawLinks();

            allCreated[creaId] = {}
            for (var x in newLink){
            	allCreated[creaId][x] = newLink[x];
            }
            do {
                creaId++;
                delete allCreated[creaId];
            } while (allCreated[creaId]);
        } else { 
        	undoDeleteFamilyObjects([],[], [allCreated[creaId]], []);
            drawLinks();
        } 
    };

    function undoCreateChildLink () {
        var creaId = createdChildLinks.createdId,
            allCreated = createdChildLinks.allCreated;

        creaId++;
        if (creaId <= 0) {
            createdChildLinks.createdId = 0;
            return;
        }
        var createdLinkId = allCreated[creaId].id;
        var createdLink = getChildLinkById(createdLinkId);
        if (createdLink){
        	deleteFamilyObjects([], [], [createdLink], []);
        	drawLinks();
    	}
    };

    function createFamilyChildLink(relationship, childNode){
    	if (!relationship || !childNode)
    		return null;

    	relationship = typeof(relationship) == 'string' ? relationship : relationship.id;
    	childNode = typeof(childNode) == 'string' ? childNode : childNode.id;

    	var alreadyExist = dataChildLinks.some(function(link){
			return link.relId == relationship && link.childId == childNode;
		});
		if (alreadyExist)
    		return null;

    	var newChildLink = {
    		id: util.tree.guid(),
    		relId: relationship,
    		childId: childNode
    	};

    	dataChildLinks.push(newChildLink);
    	var relLink = getRelLinkById(relationship);
    	relLink.hasChildren = true;
    	return newChildLink;
    };

    function createGroup(group) {
        if (!group) return;
        
        HistoryManager.execute(function () {
            createdGroups.createdId++;
            doCreateGroup(group);
        }, function () {
            createdGroups.createdId--;
            undoCreateGroup();
        });
    };

    function doCreateGroup(group) {
        var creaId = createdGroups.createdId,
            allCreated = createdGroups.allCreated;

        var action = HistoryManager.action;
        if (action == 'do') {
            var newGroup = createFamilyGroup(group);
            if (!newGroup)
                return;
            allCreated[creaId] = newGroup;
            do {
                creaId++;
                delete allCreated.createdId;
            } while (allCreated[creaId]);
        } else 
        	undoDeleteFamilyObjects([],[],[],[allCreated[creaId]]);
        tmpGroup = null; 
    	draw();
    };

    function undoCreateGroup(){
		var creaId = createdGroups.createdId,
            allCreated = createdGroups.allCreated;

        creaId++;
        if (creaId <= 0) {
            createdGroups.createdId = 0;
            return;
        }
        var created = allCreated[creaId];
        created = getGroupById(created.id);
        deleteFamilyObjects([], [], [], [created]);
        draw();
    };

    function createFamilyGroup(group){
    	if (!group || !group.text)
    		return null;

    	group.id = util.tree.guid();
    	group.isGroup = true;
        group.lastX = group.x;
		group.lastY = group.y;
		group.updateId = 0;
		group.allUpdated = {
    		'0': {
				color: group.color, 
				textSize: group.textSize,
				width: group.width,
				height: group.height, 
				text: group.text
    		}
    	};

    	dataGroups.push(group);

    	var groupsList = [];
		dataGroups.forEach(function(g){
			groupsList.push({id: g.id, text: g.text});
		});
	
		groupsList.sort(function(a, b) {
			var tA = a.text.toUpperCase(); // ignore upper and loadd-to-new-groupwercase
			var tB = b.text.toUpperCase(); // ignore upper and lowercase
			if (tA < tB) return -1;
			if (tA > tB) return 1;
			// texts must be equal
			return 0;
		});
		
		var lastEl = $('#add-to-new-group').parent('li'),
			menu = lastEl.parents('.dropdown-submenu').find('.dropdown-menu');
			
		menu.find('.existing-group,.divider').each(function(){$(this).remove()});
		if (groupsList.length){
			groupsList.forEach(function(g){
				var text = g.text.split(/\r\n|\r|\n/),
					li = '<li class="existing-group"><a tabindex="-1" href="#" id="add-to-existing-group-' + g.id + '">';
				li += text[0];
				if (text.length > 1) 
					li += '...</a></li>';
				lastEl.before(li);
			});
			lastEl.before('<li class="divider"></li>');
			menu.on('click', '.existing-group a', function(){
				var el = this,
					$el = $(this),
					id = $el.attr('id').substring(22);
				while (el && el.className.indexOf('dropdown-menu') == -1)
					el = el.parentNode;
				if (el)
					$(el).hide();
				CtxMenuManager.getContextMenu('node').hide();
				var g = getGroupById(id),
					nodesToAdd = dataNodes.filter(function(n){return n.selected == true && g.nodes.indexOf(n.id) == -1;});
				addNodesTo(nodesToAdd, g);
			})
		}

    	return group;
    };

    function addNodesTo(nodeIds, group){
    	HistoryManager.execute(function () {
    			addedNodesToGroup.addedId++;
            	doAddNodesTo(nodeIds, group);
        	}, function () {
            	addedNodesToGroup.addedId--;
      			undoAddNodesTo(group);
        	});
	};

	function doAddNodesTo(nodeIds, group){
    	var addedId = addedNodesToGroup.addedId,
    		allAdded = addedNodesToGroup.allAdded;
    	
    	var action = HistoryManager.action;
    	if (action == 'redo'){
    		group = allAdded[addedId].group;
    		nodeIds = allAdded[addedId].nodes.slice();
    	}

    	addNodesToGroup(nodeIds, group);

    	if (action == 'do'){
    		allAdded[addedId] = {};
    		allAdded[addedId].group = group.id;
    		if (typeof(nodeIds[0]) == 'string')
    			allAdded[addedId].nodes = nodeIds.slice();
    		else
    			allAdded[addedId].nodes = nodeIds.map(function(n){return n.id;});
    		++addedId;
			do {
                delete addedNodesToGroup[addedId];
            } while (addedNodesToGroup[addedId]);
    	}
    	_updateD3Groups(svg.selectAll('.groups .group'));
    };

    function undoAddNodesTo(){
    	var addedId = addedNodesToGroup.addedId,
    		allAdded = addedNodesToGroup.allAdded;
    	addedId++
        if (addedId <= 0) {
            addedNodesToGroup.addedId = 0;
            return;
        }

        var group = allAdded[addedId].group;
        var nodes = allAdded[addedId].nodes.slice();

        removeNodesFromGroup(nodes, group);
        _updateD3Groups(svg.selectAll('.groups .group'));
    };

    function removeNodesFrom(nodeIds, group){
    	HistoryManager.execute(function () {
    			removedNodesFromGroup.removedId++;
            	doRemoveNodesFrom(nodeIds, group);
        	}, function () {
            	removedNodesFromGroup.removedId--;
      			undoRemoveNodesFrom(group);
        	});
	};

	function doRemoveNodesFrom(nodeIds, group){
    	var removedId = removedNodesFromGroup.removedId,
    		allRemoved = removedNodesFromGroup.allRemoved;
    	
    	var action = HistoryManager.action;
    	if (action == 'redo'){
    		group = allRemoved[removedId].group;
    		nodeIds = allRemoved[removedId].nodes.slice();
    	}

    	removeNodesFromGroup(nodeIds, group);

    	if (action == 'do'){
    		allRemoved[removedId] = {};
    		allRemoved[removedId].group = group.id;
    		if (typeof(nodeIds[0]) == 'string')
    			allRemoved[removedId].nodes = nodeIds.slice();
    		else
    			allRemoved[removedId].nodes = nodeIds.map(function(n){return n.id;});
    		++removedId;
			do {
                delete removedNodesFromGroup[removedId];
            } while (removedNodesFromGroup[removedId]);
    	}
    	_updateD3Groups(svg.selectAll('.groups .group'));
    };

    function undoRemoveNodesFrom(){
    	var removedId = removedNodesFromGroup.removedId,
    		allRemoved = removedNodesFromGroup.allRemoved;
    	removedId++
        if (removedId <= 0) {
            removedNodesFromGroup.removedId = 0;
            return;
        }

        var group = allRemoved[removedId].group;
        var nodes = allRemoved[removedId].nodes.slice();

        addNodesToGroup(nodes, group);
        _updateD3Groups(svg.selectAll('.groups .group'));
    };

    function addNodesToGroup(nodeIds, group){
    	group = (typeof(group) == 'string') ? getGroupById(group) : group; 
    	if (!nodeIds || !nodeIds.length || !group)
    		return;
    	if (typeof(nodeIds[0]) != 'string')
    		nodeIds = nodeIds.map(function(n){return n.id;});
    	nodeIds.forEach(function(nodeId){
    		group.nodes.push(nodeId);
    	});    	
    };

    function removeNodesFromGroup(nodeIds, group){
    	group = (typeof(group) == 'string') ? getGroupById(group) : group; 
    	if (!nodeIds || !nodeIds.length || !group)
    		return;
    	if (typeof(nodeIds[0]) != 'string')
    		nodeIds = nodeIds.map(function(n){return n.id;});
    	nodeIds.forEach(function(nodeId){
    		var i = group.nodes.indexOf(nodeId);
    		if (i == -1)
    			return;
    		group.nodes.splice(i, 1);
    	});
    };

    function deleteObjects(nodes, rLinks, cLinks, groups) {
        HistoryManager.execute(function () {
            deletedObjects.deletedId++;
            doDeleteObjects(nodes, rLinks, cLinks, groups);
        }, function () {
            deletedObjects.deletedId--;
      		undoDeleteObjects();
        });
    };

    function doDeleteObjects(nodes, rLinks, cLinks, groups) {
        var delId = deletedObjects.deletedId,
            allDeleted = deletedObjects.allDeleted;
        
        var action = HistoryManager.action;
        if (action == 'redo') {  
            nodes = allDeleted[delId].nodes.slice(); 
            rLinks = allDeleted[delId].relLinks.slice(); 
            cLinks = allDeleted[delId].childLinks.slice(); 
            groups = allDeleted[delId].groups.slice();
        }
        var deleted = deleteFamilyObjects(nodes, rLinks, cLinks, groups);
        draw();

        if (action == 'do') {
        	allDeleted[delId] = {
              	nodes: deleted.nodes,
               	relLinks: deleted.relLinks,
               	childLinks: deleted.childLinks,
               	groups: deleted.groups
            };
            do {
                delId++;
                delete allDeleted[delId];
            } while (allDeleted[delId]);
        }        
    };

    function undoDeleteObjects(){
    	var delId = deletedObjects.deletedId,
            allDeleted = deletedObjects.allDeleted;

        delId++;
        if (delId <= 0) {
            deletedObjects.deletedId = 0;
            return;
        }
        var nodes = allDeleted[delId].nodes,
        	relLinks = allDeleted[delId].relLinks,
        	childLinks = allDeleted[delId].childLinks,
        	groups = allDeleted[delId].groups;
        
        var resumed = undoDeleteFamilyObjects(nodes, relLinks, childLinks, groups);
        allDeleted[delId].nodes = resumed.nodes;
        allDeleted[delId].relLinks = resumed.relLinks; 
        allDeleted[delId].childLinks = resumed.childLinks;
        allDeleted[delId].groups = resumed.groups;

        draw();
    };

    function deleteFamilyObjects(nodes, rLinks, cLinks, groups){
    	nodes = nodes || [];
    	rLinks = rLinks || [];
    	cLinks = cLinks || [];
    	groups = groups || [];
    	var deleted = {nodes: [], relLinks: [], childLinks: [], groups: []};

    	var deletedNodes = [],
    		deletedRelLinks = [],
    		deletedChildLinks = [],
    		deletedGroups = [];

    	while (cLinks.length){
    		var link = cLinks.pop();
    		link.selected = false;
    		var i = dataChildLinks.indexOf(link);
    		if (i==-1) return;
    		dataChildLinks.splice(i,1);
    		deletedChildLinks.push(link);
    	}

    	while (rLinks.length){
    		var link = rLinks.pop();
    		link.selected = false;
    		var i = dataRelLinks.indexOf(link);
    		if (i==-1) return;
    		dataRelLinks.splice(i,1);
    		deletedRelLinks.push(link);
    	}
    	
    	dataRelLinks.forEach(function(link){
    		var childrenLinks = util.tree.getChildLinksByRelationship(link.id, dataChildLinks);
    		link.hasChildren = childrenLinks.length > 0;
    	});

    	while (nodes.length){
    		var node = nodes.pop();
    		node.selected = false;
    		var i = dataNodes.indexOf(node);
    		if (i==-1) return;
    		dataNodes.splice(i,1);
    		deletedNodes.push(node);
    	}

    	while (groups.length){
    		var group = groups.pop();
    		group.selected = false;
    		var i = dataGroups.indexOf(group);
    		if (i==-1) return;
    		dataGroups.splice(i,1);
    		deletedGroups.push(group);
    	}
    	
    	// hide tooltip if mouse is over a deleted node
    	if (nodeOver && dataGroups.indexOf(nodeOver) != -1)
    		tooltip.hide();

    	deleted.nodes = deletedNodes;
    	deleted.relLinks = deletedRelLinks;
    	deleted.childLinks = deletedChildLinks;
    	deleted.groups = deletedGroups;

    	return deleted;
    };

    function undoDeleteFamilyObjects(nodes, rLinks, cLinks, groups){
    	nodes = nodes || [];
    	rLinks = rLinks || [];
    	cLinks = cLinks || [];
    	groups = groups || [];
    	var resumed = {nodes: [], relLinks: [], childLinks: [], groups: []};

    	// resume nodes
    	while (nodes.length){
    		var node = nodes.pop();
    		var i = dataNodes.indexOf(node);
    		if (i!=-1) return;
    		dataNodes.push(node);
    		resumed.nodes.push(node);
    	}

    	while (groups.length){
    		var group = groups.pop();
    		var i = dataGroups.indexOf(group);
    		if (i!=-1) return;
    		dataGroups.push(group);
    		resumed.nodes.push(group);
    	}
    	
    	while (rLinks.length){
    		var link = rLinks.pop();
    		var i = dataRelLinks.indexOf(link);
    		if (i!=-1) return;
    		dataRelLinks.push(link);
    		resumed.relLinks.push(link);
    	}
    	
    	while (cLinks.length){
    		var link = cLinks.pop();
    		var i = dataChildLinks.indexOf(link);
    		if (i!=-1) return;
    		dataChildLinks.push(link);
    		resumed.childLinks.push(link);
    	}

    	dataRelLinks.forEach(function(link){
    		var childrenLinks = util.tree.getChildLinksByRelationship(link.id, dataChildLinks);
    		link.hasChildren = childrenLinks.length > 0;
    	});

    	return resumed;
    };

	function updateNodeValues(node, values){
		if (!node || !values)
			return;
		HistoryManager.execute(function () {
            node.updateId++;
            doUpdateNode(node, values);
        }, function () {
            node.updateId--;
            doUpdateNode(node, values);
        });
	};
	
	function doUpdateNode(node, values) {
        if (!node || !values)
			return;
        
		var updateId = node.updateId;

		var action = HistoryManager.action;
        if (action == 'do') {
        	node.allUpdated[updateId] = {};
        	['name', 'surname', 'description', 'sex'].forEach(function(name){
        		node.allUpdated[updateId][name] = values[name];
        	});
        	values = node.allUpdated[updateId];
            do {
                updateId++;
                delete node.allUpdated[updateId];
            } while (node.allUpdated[updateId]);
        } else {
            values = node.allUpdated[updateId];
            node.updateId = updateId;
        }
        var updated = updateNode(node, values);
        updated.visible = {
			name: _setVisibleText(updated.name, updated.id, 'name'),
			surname: _setVisibleText(updated.surname, updated.id, 'surname')
		};
        _updateD3Nodes(getD3Node(updated), true);
     };

    function updateNode(node, values){
    	if (!node || !values)
			return null;
		for (var name in values)
			node[name] = values[name];
		return node;
    }

	function moveNodes(nodes, deltaX, deltaY) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            console.error('moving nodes to NaN', nodes);
            return;
        }
        HistoryManager.execute(
            function () { doMoveNodes(nodes, deltaX, deltaY); }, 
			function () { doMoveNodes(nodes, -deltaX, -deltaY); }
        );
    };
	
	function doMoveNodes(nodes, deltaX, deltaY){
		if (!nodes || !nodes.length)
			return;		
		nodes.forEach(function(node){
			node.x = node.lastX + deltaX;
			node.y = node.lastY + deltaY;
			node.lastX = node.x;
			node.lastY = node.y;
		});
		update();
	};

	function moveGroups(groups, deltaX, deltaY) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            console.error('moving groups to NaN', groups);
            return;
        }
        HistoryManager.execute(
            function () { doMoveGroups(groups, deltaX, deltaY); }, 
			function () { doMoveGroups(groups, -deltaX, -deltaY); }
        );
    };
	
	function doMoveGroups(groups, deltaX, deltaY){
		if (!groups || !groups.length)
			return;	
		groups.forEach(function(group){
			group.x = group.lastX + deltaX;
			group.y = group.lastY + deltaY;
			group.lastX = group.x;
			group.lastY = group.y;
		});
		update();
	};

	function updateGroupValues(group, values){
		if (!group || !values)
			return;
		HistoryManager.execute(function () {
            group.updateId++;
            doUpdateGroup(group, values);
        }, function () {
            group.updateId--;
            doUpdateGroup(group, values);
        });
	};
	
	function doUpdateGroup(group, values) {
        if (!group || !values)
			return;
		var updateId = group.updateId;
		var action = HistoryManager.action;
        if (action == 'do') {        	
        	group.allUpdated[updateId] = {};
        	['color', 'width', 'height', 'textSize', 'text'].forEach(function(name){
        		group.allUpdated[updateId][name] = values[name] || group[name];
        	});
        	values = group.allUpdated[updateId];
            do {
                updateId++;
                delete group.allUpdated[updateId];
            } while (group.allUpdated[updateId]);
        } else {
            values = group.allUpdated[updateId];
            group.updateId = updateId;
        }
        var updated = updateGroup(group, values);
        var d3updated = getD3Group(updated);
        _updateD3GroupText(d3updated);
        _updateD3Groups(d3updated);    
     };

    function updateGroup(group, values){
    	if (!group || !values)
			return null;
		for (var name in values){

			group[name] = values[name];
		}
		return group;
    };
	
	var translateTimer = false,
		speedX, speedY;
	
	function setTranslateSpeed(x, y) {
        translateTimer = false;

        if (!x && !y) {
            translateTimer = true;
            update();
        } else if (!translateTimer) {
            d3.timer(function () {
                var t = zoom.translate();
                t[0] += speedX || 0;
                t[1] += speedY || 0;
                zoom.translate(t);
                dataNodes.forEach(function(n){
					if (n.dragging){
						n.x = xScale.invert(-speedX + xScale(n.x));
						n.y = yScale.invert(-speedY + yScale(n.y));
					}
				});
				dataGroups.forEach(function(g){
					if (g.dragging){
						g.x = xScale.invert(-speedX + xScale(g.x));
						g.y = yScale.invert(-speedY + yScale(g.y));
					}
				});

				if (tmpRelLink && tmpRelLink.extraCoords){
					tmpRelLink.extraCoords.x = xScale.invert(-speedX + xScale(tmpRelLink.extraCoords.x)); 
					tmpRelLink.extraCoords.y = yScale.invert(-speedY + yScale(tmpRelLink.extraCoords.y)); 
				}

				if (isResizingGroup){
					var minSize = 2 * 8 / currentScale;
					isResizingGroup.width = Math.max(xScale.invert(-speedX + xScale(isResizingGroup.width)), minSize);
					isResizingGroup.height = Math.max(yScale.invert(-speedY + yScale(isResizingGroup.height)), minSize);
				}
                update();
                return translateTimer;
            }, 10);
        }
        speedX = x;
        speedY = y;
    };
    
	// public methods
	
	var init = function(dom, w, h){
		var viewport = d3.select(dom);
		
		svg = viewport.append('svg:svg')
			.attr('width', w)
			.attr('height', h);

		var defs = svg.append('defs');

		var maleGrad = svg.append('radialGradient')
			.attr({
				id: 'male-gradient',
				cx: '50%',
				cy: '50%',
				r: '75%',
				fx: '50%',
				fy: '50%',
			});
		maleGrad.append('stop').attr({
			offset: '0%',
			'class': 'male-color'
		})
		maleGrad.append('stop').attr({
			offset: '100%',
			'class': 'neutral-color'
		});

		var femaleGrad = svg.append('radialGradient')
			.attr({
				id: 'female-gradient',
				cx: '50%',
				cy: '50%',
				r: '75%',
				fx: '50%',
				fy: '50%',
			});
		femaleGrad.append('stop').attr({
			offset: '0%',
			'class': 'female-color'
		})
		femaleGrad.append('stop').attr({
			offset: '100%',
			'class': 'neutral-color'
		});
		
		xScale = d3.scale.linear().domain([0, w]).range([0, w]);
		yScale = d3.scale.linear().domain([0, h]).range([0, h]);
		zoom = d3.behavior.zoom().on('zoom', function () { _onZoom(); }).x(xScale).y(yScale);
		currentScale = 1;

		var panArea = svg.append('svg:rect').attr('class', 'zoom-pan-area')
			.attr('width', w)
			.attr('height', h)
			.call(zoom);
		
		panArea
			.on('dblclick.zoom', null)
			.on('touchstart', function () {
				CtxMenuManager.hide();
				deselectAll();
			})
			.on('mousedown', function () {
				CtxMenuManager.hide();
			})
			.on('click', function(){
				deselectAll();
			});

		svg.append('g').attr('class', 'children-links')
			.call(zoom)
			.on('touchstart.zoom', null)
            .on('mousedown.zoom', null)
            .on('dblclick.zoom', null);
		
		svg.append('g').attr('class', 'relationship-links')
			.call(zoom)
			.on('touchstart.zoom', null)
            .on('mousedown.zoom', null)
            .on('dblclick.zoom', null);
			
		svg.append('g').attr('class', 'nodes')
			.call(zoom)
			.on('touchstart.zoom', null)
            .on('mousedown.zoom', null)
            .on('dblclick.zoom', null);

        svg.append('g').attr('class', 'groups')
			.call(zoom)
            .on('dblclick.zoom', null);
	
		brush = d3.svg.brush().x(xScale).y(yScale)
			.on('brushstart', function (){
		        if (brushLayer)
					brushLayer.call(brush.clear());
		    })
			.on('brush', function() {
		        if (brush.empty())
		            return;

		        var e = brush.extent();
		        var x1 = e[0][0], x2 = e[1][0],
		            y1 = e[0][1], y2 = e[1][1];

		        dataNodes.forEach(function (node) {
					var x = node.x,	y = node.y,
						w = nodeWidth,h = nodeHeight;
					if (x2 > x && x + w > x1 && y2 > y && y + h > y1)
						selectNode(node);
					else
						deselectNode(node);
				});
				dataGroups.forEach(function (group) {
					var x = group.x,	y = group.y,
						w = group.width,h = group.height;
					if (x2 > x && x + w > x1 && y2 > y && y + h > y1)
						selectGroup(group);
					else
						deselectGroup(group);
				});
				update();
		    })
			.on('brushend', endBrush);		

		// add tooltip
		TooltipManager.createTooltip(viewport, svg); 
			
		CtxMenuManager.initBackgroundMenu({
			editNewObject: function(type, x, y){
				console.log(type, x, y);
				if (type == 'node'){
					tmpNode = {
						x: xScale.invert(x) - nodeWidth * 0.5, 
						y: yScale.invert(y) - nodeHeight * 0.5
					};
				} else if (type == 'group'){
					tmpGroup = {
						x: xScale.invert(x), 
						y: yScale.invert(y)
					};
				}
			},
			selectAll: function(){
				selectAll();
				centerAll();
			}
		}, {
			target: panArea,
			container: svg
		});

		CtxMenuManager.onRightClick(null, panArea, svg)

		CtxMenuManager.initNodeMenu({
			delete: function(){
				function getSelection(obj){
			    		return obj.selected == true;
			    	};

		    	var nodes = dataNodes.filter(getSelection),
		    		rLinks = dataRelLinks.filter(getSelection),
		    		cLinks = dataChildLinks.filter(getSelection),
		    		groups = dataGroups.filter(getSelection);

				nodes.forEach(function(node){
					var rels = util.tree.getRelationshipsByPartner(node.id, dataRelLinks.filter(function(link){return link.selected == false;}));
					rLinks = rLinks.concat(rels);
				});

				rLinks.forEach(function(rlink){
					var clinks = util.tree.getChildLinksByRelationship(rlink.id, dataChildLinks.filter(function(link){return link.selected == false;}));
					cLinks = cLinks.concat(clinks);
				});

    			deleteObjects(nodes, rLinks, cLinks, groups);
			},
			editNode: function(){
				$('#node-popup').modal();
			},
			centerSelection: function(){
				centerSelection();
			},
			centerAll: function(){
				centerAll();
			},
			linkToPartner: function(){
				createRelLink(tmpFromNode, tmpToNode);
				deselectAll();
				selectRelLink(dataRelLinks[dataRelLinks.length - 1]);
			},
			getTmpGroup: function(x, y){
				tmpGroup = {
					x: xScale.invert(x), 
					y: yScale.invert(y),
					nodes: dataNodes.filter(function(n){return n.selected;}).map(function(n){return n.id;})
				};
				return tmpGroup;
			}
		});			

		CtxMenuManager.initGroupMenu({
			delete: function(){
				function getSelection(obj){
		    		return obj.selected == true;
		    	};

		    	var nodes = dataNodes.filter(getSelection),
		    		rLinks = dataRelLinks.filter(getSelection),
		    		cLinks = dataChildLinks.filter(getSelection),
		    		groups = dataGroups.filter(getSelection);

				nodes.forEach(function(node){
					var rels = util.tree.getRelationshipsByPartner(node.id, dataRelLinks.filter(function(link){return link.selected == false;}));
					rLinks = rLinks.concat(rels);
				});

				rLinks.forEach(function(rlink){
					var clinks = util.tree.getChildLinksByRelationship(rlink.id, dataChildLinks.filter(function(link){return link.selected == false;}));
					cLinks = cLinks.concat(clinks);
				});

    			deleteObjects(nodes, rLinks, cLinks, groups);
			},
			centerSelection: function(){
				centerSelection();
			},
			centerAll: function(){
				centerAll();
			}
		});

		var popup = $('#node-popup');
		if (popup){
			popup.on("hide.bs.modal", function () {
				var form = popup.find('.form-horizontal');
			    $.each(form.find('input, textarea'), function(i, input){
	 				$(input).val('');
	 			});
			});

		 	popup.on('click', '#submit', function(){
		 		var form = popup.find('.form-horizontal');
		 			nodeId = form.find('#input-id').val();
	 			if (!form.valid())
	 				return;
	 			var records = form.serializeArray(),
	 				values = {};
	 			records.forEach(function(rec){
 					values[rec.name] = rec.value;
	 			});
	 			if (values.id){
	 				updateNodeValues(getNodeById(values.id), values);
	 			} else {
	 				if (tmpNode){
	 					for (var name in values){
	 						var val = values[name];
	 						tmpNode[name] = val;
	 					}
	 					createNode(tmpNode);
	 				}	
	 			}
	 			popup.modal('hide');
		 	});
		}
		var gpopup = $('#group-popup');
		if (gpopup){
			gpopup.on("hide.bs.modal", function () {
				var form = gpopup.find('.form-horizontal');
			    $.each(form.find('input, textarea'), function(i, input){
	 				var $input = $(input),
	 					id = $input.attr('id');
	 				if (id == 'input-color')
	 					$input.val(defaultColor);
	 				else if (id == 'input-textSize')
	 					$input.val('14');
	 				else if (id == 'input-width')
	 					$input.val('100');
	 				else if (id == 'input-height')
	 					$input.val('100');
 					else 
 						$input.val('');
	 			});
			});

		 	gpopup.on('click', '#submit', function(){
		 		var form = gpopup.find('.form-horizontal');
		 			groupId = form.find('#input-id').val();
	 			if (!form.valid())
	 				return;
	 			var records = form.serializeArray(),
	 				values = {};
	 			records.forEach(function(rec){
 					if (['width', 'height', 'textSize'].indexOf(rec.name) != -1 )
 						rec.value = 1 * rec.value;
 					values[rec.name] = rec.value;
	 			});
	 			if (values.id){
	 				updateGroupValues(getGroupById(values.id), values);
	 			} else {
	 				if (tmpGroup){
	 					for (var name in values){
	 						var val = values[name];
	 						tmpGroup[name] = val;
	 					}
	 					tmpGroup.x -= tmpGroup.width * 0.5;
	 					tmpGroup.y -= tmpGroup.height * 0.5;
	 					if (!tmpGroup.nodes)
	 						tmpGroup.nodes = [];
	 					createGroup(tmpGroup);
	 				}	
	 			}
	 			gpopup.modal('hide');
		 	});
		}
	};
	
	var resize = function(w, h){
		if (!svg || svg.empty())
			return;
		svg.attr('width', w).attr('height', h);		
		if (xScale.range() != [0, w] || yScale.range() != [0, h]) {
			svg.select('.zoom-pan-area')
				.attr('width', w)
				.attr('height', h);
			xScale.domain()[0] = xScale.invert(0);
			xScale.domain()[1] = xScale.invert(w);
			xScale.range()[0] = 0;
			xScale.range()[1] = w;
			yScale.domain()[0] = yScale.invert(0);
			yScale.domain()[1] = yScale.invert(h);
			yScale.range()[0] = 0;
			yScale.range()[1] = h;
		}
		update();		
	};
	
	var draw = function() {
		if (!svg || svg.empty())
			return;	

		drawGroups();
		drawNodes();
		drawLinks();
	};

	var update = function() {
		if (!svg || svg.empty())
			return;	

		_updateD3Groups(svg.selectAll('.groups .group'));
		_updateD3Nodes(svg.selectAll('.nodes .node'));
		_updateD3RelLinks(svg.selectAll('.relationship-links .link'));
		_updateD3ChildLinks(svg.selectAll('.children-links .link'));
	};
	
	var centerTo = function (nodes, groups, transitionDuration) {
        if (!svg || svg.empty())
			return;	

        // nodes is a subset of dataNodes
        if (!dataNodes || !dataNodes.length) {
            zoom.scale(1).translate([0, 0]);
            currentScale = 1;
            update(transitionDuration);
            return;
        }
        if ((!nodes || !nodes.length) && (!groups || !groups.length))
            return;        
                
        var canvasInfo = _getViewport(nodes, groups),
			w = parseInt(svg.attr('width')),
			h = parseInt(svg.attr('height'));
		canvasInfo.w -= 2 * canvasInfo.padding; // no padding
        canvasInfo.h -= 2 * canvasInfo.padding; // no padding
        var padding = 20;
        var newScale = Math.min(1, Math.min((h - padding * 2) / canvasInfo.h, (w - padding * 2) / canvasInfo.w));
        var newTranslate = [];
        newTranslate[0] = w / 2 - newScale * (canvasInfo.xRange[0] + canvasInfo.xRange[1]) / 2;
        newTranslate[1] = h / 2 - newScale * (canvasInfo.yRange[0] + canvasInfo.yRange[1]) / 2;	

        if (!transitionDuration){
        	currentScale = newScale;
        	zoom.scale(newScale).translate(newTranslate);
        	update();
        } else {
        	var oldScale = currentScale,
        		oldTranslate = zoom.translate();
			
			svg.transition().duration(transitionDuration).tween('zoomToCenterNodes', function () {
                var iScale = d3.interpolateNumber(oldScale, newScale);
                var iTranslateX = d3.interpolateNumber(oldTranslate[0], newTranslate[0]); 
            	var iTranslateY =d3.interpolateNumber(oldTranslate[1], newTranslate[1]);
                return function (t) {
                	currentScale = iScale(t);
                	zoom.scale(currentScale).translate([iTranslateX(t),iTranslateY(t)]);                	
                	update();
                };
            });
        }
    };
	
	var centerSelection = function () {
		CtxMenuManager.hide();
		var groups = dataGroups.filter(function(group){return group.selected == true;}),
			nodes = dataNodes.filter(function(node){return node.selected == true;}),
			extraNodes = [];
		groups.forEach(function(group){
			var nodeIds = group.nodes;
			nodeIds.forEach(function(id){
				var node = getNodeById(id);
				if (node && nodes.indexOf(node) == -1)
					nodes.push(node);
			})
		});

		centerTo(nodes, groups, 500);
	};
	
	var centerAll = function () {
		CtxMenuManager.hide();
		centerTo(dataNodes, dataGroups, 500);
	};

	var isMovingBrush = function(){ 
		console.log(brushLayer, !brush.empty())
    	return brushLayer && !brush.empty()
    };

    var getBrushLayer = function(){ 
    	return brushLayer; 
    };

    var startBrush = function(){
		CtxMenuManager.hide();
		var xDomain = xScale.domain(), yDomain = yScale.domain(),
			xRange = xScale.range(), yRange = yScale.range(),
			w = parseInt(svg.attr('width')),
			h = parseInt(svg.attr('height')),				
			newXScale = d3.scale.linear().domain([xDomain[0], xScale.invert(w)]).range([0, w]),
			newYScale = d3.scale.linear().domain([yDomain[0], yScale.invert(h)]).range([0, h]);
		brushLayer = svg.append('g').attr('class', 'brush')
			.call(brush.x(newXScale).y(newYScale));
		brushLayer.selectAll('rect').style('cursor', '');
		svg.select('.zoom-pan-area').classed('selection-area', true);
	};

    var endBrush = function(){
        if (!brushLayer) return;

        brushLayer.call(brush.clear());
        brushLayer.remove();
        brushLayer = null;
        svg.select('.zoom-pan-area').classed('selection-area', false);
    };

	var saveAs = function(format, name, scale){
		if (format == 'json'){
			dataNodes.forEach(function(node){
				delete node.lastX;
				delete node.lastY;
				delete node.updateId;
				delete node.allUpdated;
				delete node.selected;
				delete node.dragging;
				delete node.visible;
				delete node.hasPartialDescr;
			});

			dataGroups.forEach(function(group){
				delete group.lastX;
				delete group.lastY;
				delete group.updateId;
				delete group.allUpdated;
				delete group.selected;
				delete group.dragging;
				delete group.hasPartialText;
			});

			while(dataRelLinks.length){
				var relLink = dataRelLinks.pop();
				var children = [];
				for (var i = dataChildLinks.length -1; i >= 0; i--){
					var link = dataChildLinks[i];
					if (link.relId == relLink.id) {
						children.push(link.childId);
						dataChildLinks.splice(i, 1);
					}
				}
				var partner1 = getNodeById(relLink.fromNode),
					partner2 = getNodeById(relLink.toNode);
				
				if (!partner1.relationships)
					partner1.relationships = [];
				partner1.relationships.push({ 
					partnerId: relLink.toNode, 
					direction: 'to',
					children: children 
				});
				if (!partner2.relationships)
					partner2.relationships = [];
				partner2.relationships.push({ 
					partnerId: relLink.fromNode, 
					direction: 'from',
					children: children 
				});
			}

			var jsonData = { tree: dataNodes, groups: dataGroups };
			var text = JSON.stringify(jsonData);

			var blob = new Blob([text], {type: "application/json;charset=utf-8;"});
			var url  = (window.URL || window.webkitURL).createObjectURL(blob);
			console.log(url)
			var a = document.createElement('a');
			a.download = name + ".json";
			a.href = url;
			a.textContent = "Download " + name + ".json";
			a.click();
			delete a;

			reset();

			loadTree(jsonData.tree);
			loadGroups(jsonData.groups);
			draw();

		} else {
			var scale = (format == 'png') ? scale/100 : 1;
			setSvgToCapture(scale, function(clonedSvg){
				var viewport = document.getElementById('viewport');
				viewport.appendChild(clonedSvg.node());

				if (format == 'png'){
					var csvg = clonedSvg.node(),
						parent = csvg.parentNode,
		                placeholder = parent ? parent.insertBefore(document.createElement('p'), csvg) : null,
		                p = document.createElement('p');
		            p.appendChild(csvg);
		            csvg = p.innerHTML;
		            if (parent) {
		                parent.removeChild(placeholder);
		            }
                    var image = new Image();
					image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(csvg)));
					image.crossOrigin = 'Anonymous';

			        var canvas = document.createElement('canvas');
			        canvas.id = 'canvas-converter';
			        canvas.width = parseInt(clonedSvg.attr('width'));
			        canvas.height = parseInt(clonedSvg.attr('height'));
			        canvas.style.position = 'fixed';
			        canvas.style.top = '0px';
			        canvas.style.left = '0px';
			        var context = canvas.getContext('2d');
			        var fileNameToSaveAs = name + '.png';

			        // Render SVG image to the canvas once it loads.
			        image.onerror = function (error) {
			            var msg = 'The image ' + fileNameToSaveAs + 'could not be loaded';
			            console.error(msg);
			            viewport.removeChild(clonedSvg.node())
			        };
			        image.onload = function () {
			            context.drawImage(image, 0, 0);
			            dataURI = canvas.toDataURL('image/png');

			            var downloadLink = document.createElement('a');
			            downloadLink.download = fileNameToSaveAs;
			            downloadLink.type = 'image/png';
			            downloadLink.innerHTML = 'Download ' + fileNameToSaveAs;

			            function toBlobCallback(blob) {
			                if (!blob || !blob.size) {
			                    var msg = 'Impossible to download image ' + fileNameToSaveAs + ': it exceeds the maximum size supported by browser';
			                    console.error(msg);
			                } else {
			                    downloadLink.href = window.URL.createObjectURL(blob);
			                    downloadLink.onclick = function () {
			                        setTimeout(function () {
			                            document.body.removeChild(downloadLink);
			                            var msg = 'The file ' + fileNameToSaveAs + ' was successfully saved';
			                            console.debug(msg)
			                        }, 100);
			                    };
			                    downloadLink.style.display = 'none';
			                    document.body.appendChild(downloadLink);

			                    try {
			                        downloadLink.click();
			                    } catch (er) {
			                        var msg = 'Feature not available on this browser';
			                        console.error(msg);
			                    }
			                }
			            }
			            canvas.toBlob(toBlobCallback, 'image/png');
			            viewport.removeChild(csvg);
			        };
				} else {
					// get svg as xml
			        var xml = new XMLSerializer().serializeToString(clonedSvg.node());
			        // now xml contains code as string of svg with file
			        var fileNameToSaveAs = name + '.svg';

			        var downloadLink = document.createElement('a');
			        downloadLink.download = fileNameToSaveAs;
			        downloadLink.type = 'image/svg+xml';
			        textFileAsBlob = new Blob([xml], { 'type': 'image/svg+xml' });
			        downloadLink.innerHTML = 'Download ' + fileNameToSaveAs;
			        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);

			        downloadLink.style.display = "none";
			        document.body.appendChild(downloadLink);
			        downloadLink.onclick = function () {
			            setTimeout(function () {
			                document.body.removeChild(downloadLink);
			                /*if (callback)
			                    callback.apply(me, [true, fileNameToSaveAs]);*/
			            }, 100);
			        };

			        try {
			            downloadLink.click();
			        } catch (er) {
			            alert('Feature not available on this browser');
			           /* if (callback)
			                callback.apply(me, [false, fileNameToSaveAs]);*/
			        }
			        viewport.removeChild(clonedSvg.node())
				}

			})

		}
	}
	
	function setSvgToCapture(scale, callback){
        var me = this,
        	margins = 20;
    	if (!svg || svg.empty())
    		return;

        var svgToCapture = svg.node().cloneNode(true);

        if (!svgToCapture) 
            return;

        svgToCapture = d3.select(svgToCapture);

        scale = scale || currentScale;

        var canvasInfo = _getViewport(dataNodes, dataGroups);
        var w = 2 * margins + scale * (canvasInfo.w - 2 * canvasInfo.padding),
            h = 2 * margins + scale * (canvasInfo.h - 2 * canvasInfo.padding),
            t = [ margins - scale * canvasInfo.xRange[0], margins - scale *canvasInfo.yRange[0]];
        
        svgToCapture.attr({
                'xmlns': 'http://www.w3.org/2000/svg',
                'xmlns:xmlns:xlink': 'http://www.w3.org/1999/xlink', // hack: doubling xmlns: so it doesn't disappear once in the DOM
                version: '1.1',
                id: 'clone-svg-viewport',
                width: w,
                height: h
            });

        var cssInLine = document.getElementById("less:concepts-less-css-style"),
        	cssText = cssInLine.innerHTML || cssInLine.innerText || cssInLine.textContent;
        
        svgToCapture.select('defs').append('style').attr('type', 'text/css').text(cssText);
		
		svgToCapture.selectAll('.hidden-link,.hide').remove();
		                
		// Set scale parameter
		var xS = d3.scale.linear().domain([0, w]).range([0, scale * w]);
		var yS = d3.scale.linear().domain([0, h]).range([0, scale * h]);

		var m = { x : xS(1) - xS(0), y : yS(1) - xS(0)},
		    translate = function(x, y){ return { x: xS(x), y: yS(y) }; };

		var z = d3.behavior.zoom().x(xS).y(yS).translate(t);

		var rect = svgToCapture.select('.zoom-pan-area')
			.style('fill', '#555 !important')
			.attr({width: w, height: h})
		    .call(z);

		// Set position for each node
		var nodes = svgToCapture.selectAll('.nodes'); 
		nodes.selectAll('.node')
		    .classed('selected dragging', false) 
		    .attr('transform', function() {
		        var d = getNodeById(this.id.replace('node-', ''));
		        var w = nodeWidth,
		            h = nodeHeight,
		            q = translate(d.x, d.y);
		        return 'translate(' + q.x + ', ' + q.y + ') scale(' + m.x + ',' + m.y +')';
		    });
		nodes.selectAll('.node-base, .partner-port, circle').attr('stroke-width', 2 / scale);
		nodes.selectAll('.node-image').attr('stroke-width', 1 / scale);
		
		var rlinks = svgToCapture.selectAll('.relationship-links');
		rlinks.selectAll('.link')
			.classed('selected', false) 
			.each(function(){
				var d = getRelLinkById(this.id.replace('link-', ''));
				_renderRelLink(d3.select(this), d, xS, yS, scale);
			});

		var clinks = svgToCapture.selectAll('.children-links');
		clinks.selectAll('.link')
	    	.classed('selected', false) 
	    	.each(function(){
	    		var d = getChildLinkById(this.id.replace('link-', ''));
	    		_renderChildLink(d3.select(this), d, xS, yS);
			});

		var groups = svgToCapture.selectAll('.groups');
		groups.selectAll('.resizers').remove();
		groups.selectAll('.group')
			.classed('selected', false)
			.classed('dragging', false) 
	    	.each(function(){
	    		var group = getGroupById(this.id.replace('group-', ''));
                var d3group = d3.select(this);
	    		_renderGroup(d3group, group, xS, yS, scale);
                var p = [xS(group.x), yS(group.y)];
                d3group.select('.group-textarea').attr('transform', 'translate(' + p[0] + ',' + p[1] +')');
			})
			.selectAll('.group-textarea .background').remove();

        if (callback)
            callback(svgToCapture);
    };

    var load = function(jsonData){
    	var tree = (jsonData && jsonData.tree && jsonData.tree.length) ? jsonData.tree : [];
		var groups = (jsonData && jsonData.groups && jsonData.groups.length) ? jsonData.groups : [];			
		reset();
		loadTree(tree);
		loadGroups(groups);
		draw();
		centerAll();
    };

    var getObjectsToDelete = function (){
    	function getSelection(obj){
    		return obj.selected == true;
    	};

    	var nodes = dataNodes.filter(getSelection),
    		rLinks = dataRelLinks.filter(getSelection),
    		cLinks = dataChildLinks.filter(getSelection),
    		groups = dataGroups.filter(getSelection);

		nodes.forEach(function(node){
			var rels = util.tree.getRelationshipsByPartner(node.id, dataRelLinks.filter(function(link){return link.selected == false;}));
			rLinks = rLinks.concat(rels);
		});

		rLinks.forEach(function(rlink){
			var clinks = util.tree.getChildLinksByRelationship(rlink.id, dataChildLinks.filter(function(link){return link.selected == false;}));
			cLinks = cLinks.concat(clinks);
		});

		return { nodes: nodes, relLinks: rLinks, childLinks: cLinks, groups: groups };
    };

	return {
		init: init,	
		resize: resize,
		draw: draw,
		update: update,
		load: load,
		hideContextMenus: function(){ CtxMenuManager.hide(); },
		centerSelection: centerSelection,
		centerAll: centerAll,
		selectAll: selectAll,
		isMovingBrush: isMovingBrush,
		getBrushLayer: getBrushLayer,
		startBrush: startBrush,
		endBrush: endBrush,
		getSelection: function(){
			var groups = dataGroups.filter(function(d){return d.selected == true;}),
				nodes = dataNodes.filter(function(d){return d.selected == true;}),
	    		rLinks = dataRelLinks.filter(function(d){return d.selected == true;}),
	    		cLinks = dataChildLinks.filter(function(d){return d.selected == true;});
			return nodes.concat(rLinks.concat(cLinks.concat(groups)));
		},
		getObjectsToDelete: getObjectsToDelete,
		deleteObjects: deleteObjects,
		saveAs: saveAs,
		undo: function() { HistoryManager.undo(); },
		redo: function() { HistoryManager.redo(); }
	};
})('ontouchstart' in window || 'onmsgesturechange' in window); // cd1 works on most browsers || cd2 works on IE10/11 and Surface