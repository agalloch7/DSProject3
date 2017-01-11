PrioVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];
    this.displayAve = [];
    this.compData = [];
    this.compAve = [];
    this.margin = {top: 10, right: 10, bottom: 220, left: 60},
    this.width = 700 - this.margin.left - this.margin.right;
    this.height = 440 - this.margin.top - this.margin.bottom;
    this.initVis();
}

PrioVis.prototype.initVis = function(){
    var that = this;
	// Meta Data
	var choices = d3.values(this.metaData.choices); 
	this.prios = choices.map(function(d, i){
		return {
			"choice": d,
			"count": 0,
			"color": that.metaData.priorities[i]["item-color"]
		};
	});
    // SVG
    this.svg = this.parentElement
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    // Scales
    this.x = d3.scale.ordinal()
    	.domain(choices)
        .rangeRoundBands([0, this.width], .1);
    this.y = d3.scale.linear()
        .range([this.height, 0]);      
    // Axes
    this.x_axis = d3.svg.axis()
    	.scale(this.x)
        .orient("bottom");
    this.y_axis = d3.svg.axis()
        .orient("left");
    var x_axis = this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.x_axis);
    x_axis.selectAll("text")
    	.attr("style", "text-anchor: end")
    	.attr("transform", "rotate(-75), translate(-7,-14)");
   	x_axis.selectAll("line")
    	.attr("style", "stroke: none");
    x_axis.selectAll("path")
    	.attr("style", "stroke: none");				    
    this.svg.append("g")
        .attr("class", "y axis");        
    // Filter, aggregate, modify data
    var data = this.filterAndAggregate(null);
    this.displayAve[0] = data.average;
    this.displayData = data.priorities;
    // Call the update method
    this.updateVis();
}

PrioVis.prototype.updateVis = function(){
	var that = this;
    // Update y Scale
    var maxDisp = d3.max(this.displayData, function(d) {return d.count; });
    var maxComp = d3.max(this.compData, function(d) {return d.count; }) || 0;
    this.y.domain([0, Math.max(maxDisp, maxComp)]);
    // Update y Axis
    this.y_axis.scale(this.y);
    this.svg.select(".y.axis")
    	.call(this.y_axis);
    // Update Graph
    var bar = this.svg.selectAll(".bar")
    	.data(this.displayData);
    bar.enter()
    	.append("rect")
    	.attr("class", "bar");
    bar.attr("x", function(d){return that.x(d.choice); })
    	.attr("y", function(d){return that.y(d.count); })
    	.attr("width", this.x.rangeBand())
    	.attr("height", function(d){return that.height - that.y(d.count); })
    	.attr("style", function(d){return "fill: " + d.color + "; stroke:" + d.color + ";"});
    bar.exit().remove(); 	 
    // Comparison Bar Chart
    var compBar = this.svg.selectAll(".compBar")
    	.data(this.compData);
    compBar.enter()
    	.append("rect")
    	.attr("class", "compBar");
    compBar
    	.attr("x", function(d){return that.x(d.choice); })
    	.attr("y", function(d){return that.y(d.count); })
    	.attr("width", this.x.rangeBand())
    	.attr("height", function(d){return that.height - that.y(d.count); });
    compBar.exit().remove();
    // Average Line
    var barAve = this.svg.selectAll(".barAve")
    	.data(this.displayAve);
    barAve.enter()
		.append("line")
	    .attr("class", "barAve averageLine");
	barAve    
	    .attr("stroke-dasharray","0,10,10,0")
	    .attr("x1", 0)
	    .attr("y1", function(d){return that.y(d); })
	    .attr("x2", this.width)
	    .attr("y2", function(d){return that.y(d); })
	    .each(function() {this.parentNode.appendChild(this); });   
	barAve.exit().remove(); 
    // Comparison Average Line
    var compAve = this.svg.selectAll(".compAve")
    	.data(this.compAve);
    compAve.enter()
		.append("line")
	    .attr("class", "compAve averageLine");
	compAve    
	    .attr("stroke-dasharray","10,10")
	    .attr("x1", 0)
	    .attr("y1", function(d){return that.y(d); })
	    .attr("x2", this.width)
	    .attr("y2", function(d){return that.y(d); });
	compAve.exit().remove();
	// If "Hide Averages" button selected then add class to hide average lines.
	if(d3.select("#txt").html() == "Show"){
		d3.selectAll(".averageLine")
        	.classed("averageLine-hide", true); 
	}; 
}

PrioVis.prototype.onSelectionChange = function (selectionStart, selectionEnd){
    var filter;
    if(selectionStart){
        filter = function(d){
            var date = d.time;
            return (selectionStart <= date) && (date < selectionEnd);
        };
    };
   	var data = this.filterAndAggregate(filter);
    this.displayAve[0] = data.average;
    this.displayData = data.priorities;
    this.updateVis();
}

// Update Graph when "Comparison Range" selected.
PrioVis.prototype.onCompChange = function (selectionStart, selectionEnd){
    var filter;
    if(selectionStart){
        filter = function(d){
            var date = d.time;
            return (selectionStart <= date) && (date < selectionEnd);
        };
    };
    var data = this.filterAndAggregate(filter);
    this.compAve[0] = data.average;
    this.compData = data.priorities;
    this.updateVis();
}

// Clear "Comparison" graph.
PrioVis.prototype.clearComp = function (){
    this.compData = [];
    this.compAve = [];
    this.svg.selectAll(".compBar").remove();
    this.svg.select(".compAve").remove();
}

PrioVis.prototype.filterAndAggregate = function(_filter){
    var that = this;
    var filter = _filter || function(){return true;} 
    // Reference:
    // Name: Kharlampidi, Vladimir
    // Accessed: Mar 27, 2015
    // Link: http://stackoverflow.com/questions/597588/how-do-you-clone-an-array-of-objects-in-javascript    
    var res = {
    	"average": 0,
    	"priorities": JSON.parse(JSON.stringify(this.prios))
    };	
    this.data
        .filter(filter)
        .forEach(function(d){
            d.prios.forEach(function(a,i){
            	res.priorities[i].count += a;
            	res.average += a;	
            });
        });
    // Calculate average    
    res.average = res.average / that.prios.length;
    return res;
}