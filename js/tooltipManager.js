var tooltipManager = function(){

	var tooltipData = null;
	var tooltip = null;

	function _isHidden() {
        if (!tooltip || tooltip.empty()) return true;
        var opacity = tooltip.style('opacity');
        return (opacity.length) ? (parseFloat(opacity) == 0) : tooltip.classed('hidden');
    };

    function createTooltip(d3selection, targetSvg){
    	if (!d3selection || d3selection.empty())
    		return;
    	
    	tooltip = d3selection.append('div')
			.attr('class', 'tooltip')
			.style("opacity", 0);

		if (targetSvg && !targetSvg.empty())
			targetSvg.on('mousemove', function () {
	            setPosition(d3.mouse(this), +targetSvg.attr('width'), +targetSvg.attr('height'));
	        });
    };

    function setPosition(pos, width, height) {
        if (!tooltip || tooltip.empty())
            return;

        if (_isHidden())
            return;

        var tooltipDom = tooltip.node();
        var w_tooltip = tooltipDom.offsetWidth,
            h_tooltip = tooltipDom.offsetHeight,
            padding = 16, x0, y0;
            
        var x0 = pos[0] + padding;
        var y0 = pos[1] + h_tooltip + padding;
        
        x0 = (x0 + w_tooltip > width) ? pos[0] - w_tooltip - padding : x0;
        y0 = (y0 + h_tooltip > 52 + 35 + height) ? pos[1] + padding : y0;

        tooltip.styleObj = tooltip.styleObj || {};
        tooltip.styleObj.left = x0 + 'px';
        tooltip.styleObj.top = y0 + 'px';
        tooltip.style(tooltip.styleObj);
    };

    function hide(withTransition) {
        if (!tooltip || tooltip.empty())
            return;
		tooltip.transition().duration(withTransition).style('opacity', 0);
		tooltipData = null;
    };

    function show(data) {
        if (!tooltip || tooltip.empty()) return;

        _update(data);
        tooltip.transition().duration(100).style('opacity', 0.85);
    };

    function _update(data){
    	if (!tooltip || tooltip.empty()) return;

        var html = '';
		if (data && data.isNode)
	    	html = _getNodeHTML(data);
	    else if (data && data.isGroup)
	    	html = _getGroupHTML(data);
	    
        tooltip.html(html);
        tooltipData = data;
    };

    function _getNodeHTML(data){
    	var html = '';
    	if (!data.isNode)
    		return html;
        
        html += '<table><tr class="tooltip-info"><td>' + dictionary.get('Name') + '</td><td><span class="tooltip-value">' 
        		+ (data.name || '---')
                + '</span></td></tr><tr class="tooltip-info"><td>' + dictionary.get('Surname') + '</td><td><span class="tooltip-value">' 
                + (data.surname || '---');
        if (data.description){
        	var lines = data.description.split(/\r\n|\r|\n/);
        	lines.forEach(function(line, i){
        		html += '</span></td></tr><tr class="tooltip-info"><td>' + ((i==0) ? dictionary.get('Description') : '') + '</td><td><span class="tooltip-value">' + line;
        	});
        } else 
            html += '</span></td></tr><tr class="tooltip-info"><td>' + dictionary.get('Description') + '</td><td><span class="tooltip-value">---';
        html += '</span></td></tr></table>';
	    return html;
    };

    function _getGroupHTML(data){
    	var html = '';
    	if (!data.isGroup)
    		return html;
        
        html += '<table><tr class="tooltip-info"><td>' + dictionary.get('Description') + '</td><td><span class="tooltip-value">';
        if (data.text){
        	var lines = data.text.split(/\r\n|\r|\n/);
        	lines.forEach(function(line, i){
        		if (i==0){
        			html += line + '</span></td></tr>';
        			return;
        		}            		
        		html += '<tr class="tooltip-info"><td></td><td><span class="tooltip-value">' + line + '</span></td></tr>';
        	});
        } else
        	html += '---</span></td></tr>';
        html += '</table>';
	    return html;
    };

    return {
    	createTooltip: createTooltip,
    	setPosition: setPosition,
    	show: show,
    	hide: hide
    }
}