AgeVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];
    this.displayAve = [];
    this.compData = [];
    this.compAve = [];
    this.margin = {top: 10, right: 10, bottom: 10, left: 30},
    this.width = 230 - this.margin.left - this.margin.right;
    this.height = 330 - this.margin.top - this.margin.bottom;
    this.initVis();
}

AgeVis.prototype.initVis = function(){
    var that = this;
    // SVG
    this.svg = this.parentElement
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    //Scales
    this.x = d3.scale.linear()
        .range([0, this.width]);
    this.xComp = d3.scale.linear()
        .range([0, this.width]);
    this.y = d3.scale.linear()
        .domain([0,100])
        .range([0, this.height]);
    // Area
    this.area = d3.svg.area()
        .x0(0)
        .x1(function(d) {return that.x(d); })
        .y(function(d,i) {return that.y(i); });      
    // Line
    this.line = d3.svg.line()
        .x(function(d) {return that.xComp(d); })
        .y(function(d,i) {return that.y(i); });  
    // Axes
    this.y_axis = d3.svg.axis()
        .scale(this.y)
        .orient("left"); 
    this.svg.append("g")
        .attr("class", "y axis")
        .call(this.y_axis);        
    // Filter, aggregate, modify data
    var data = this.filterAndAggregate(null);
    this.displayAve[0] = data.average;
    this.displayData = data.ages;
    // Call the update method
    this.updateVis();
}

AgeVis.prototype.updateVis = function(){
    var that = this;
    //Update x Scale
    this.x.domain([0, d3.max(this.displayData, function(d) {return d; })]);
    this.xComp.domain([0, d3.max(this.compData, function(d) {return d; })]);
    //Update Graph
    var path = this.svg.selectAll(".area")
        .data([this.displayData]);
    path.enter()
        .append("path")
        .attr("class", "area");
    path.attr("d", this.area);
    path.exit().remove();    
    // Add Comparison Path
    var line = this.svg.selectAll(".compLine")
        .data([this.compData]);
    line.enter()
        .append("path")
        .attr("class", "compLine");
    line.attr("d", this.line);
    line.exit().remove();
    // Add Average Line
    var ageAve = this.svg.selectAll(".ageAve")
        .data(this.displayAve);
    ageAve.enter()
        .append("line")
        .attr("class", "ageAve averageLine");
    ageAve    
        .attr("stroke-dasharray","0,10,10,0")
        .attr("x1", 0)
        .attr("y1", function(d){return that.y(d); })
        .attr("x2", this.width)
        .attr("y2", function(d){return that.y(d); })
        .each(function() {this.parentNode.appendChild(this); });
    ageAve.exit().remove();
    // Add Comparison Average Line
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
    if(d3.select("#txt").html() == "Show"){
        d3.selectAll(".averageLine")
            .classed("averageLine-hide", true); 
    };
}

AgeVis.prototype.onSelectionChange = function (selectionStart, selectionEnd){
    var filter;
    if(selectionStart){
        filter = function(d){
            var date = d.time;
            return (selectionStart <= date) && (date < selectionEnd);
        };
    };
    var data = this.filterAndAggregate(filter);
    this.displayAve[0] = data.average;
    this.displayData = data.ages;
    this.updateVis();
}

// Update Graph when "Comparison Range" selected.
AgeVis.prototype.onCompChange = function (selectionStart, selectionEnd){
    var filter;
    if(selectionStart){
        filter = function(d){
            var date = d.time;
            return (selectionStart <= date) && (date < selectionEnd);
        };
    };
    var data = this.filterAndAggregate(filter);
    this.compAve[0] = data.average;
    this.compData = data.ages;
    this.updateVis();
}

// Clear "Comparison" graph.
AgeVis.prototype.clearComp = function (){
    this.compData = [];
    this.compAve = [];
    this.svg.selectAll(".compLine").remove();
    this.svg.selectAll(".compAve").remove();
}

AgeVis.prototype.filterAndAggregate = function(_filter){
    var filter = _filter || function(){return true;}
    var that = this;
    var res = {
        "average": 0,
        "ages": []
    };
    // Create an array of values for age 0-100
    res.ages = d3.range(101).map(function () {
        return 0;
    });
    var votes = 0;
    var years = 0;
    this.data
        .filter(filter)
        .forEach(function(d){
            d.ages.forEach(function(a,i){
                votes += a;
                years += a * i;
                res.ages[i] += a;  
            });
        });
    // Calculate Average    
    res.average = years / votes;
    return res;
}