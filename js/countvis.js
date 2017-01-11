CountVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    this.t = 0;
    this.margin = {top: 10, right: 10, bottom: 70, left: 90},
    this.margin2 = {top: 330, right: 10, bottom: 30, left: 90},
    this.width = 700 - this.margin.left - this.margin.right;
    this.height = 370 - this.margin.top - this.margin.bottom;
    this.height2 = 370 - this.margin2.top - this.margin2.bottom;
    this.dateFormatter = d3.time.format("%Y-%m-%d");
    this.initVis();
}

CountVis.prototype.initVis = function(){
    var that = this;
    // Calculate Average
    this.ave = 0;
    this.data.forEach(function(d){
        that.ave += d.count;
    });
    this.ave = this.ave / this.data.length;
    // Scales
    this.x = d3.time.scale()
        .range([0, this.width])
        .domain(d3.extent(this.data, function(d) {return d.time; }));  
    this.y = d3.scale.pow().exponent(1)
        .range([this.height, 0])
        .domain([0, d3.max(this.data, function(d) {return d.count; })]);           
    // Axes
    this.x_axis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");
    this.y_axis = d3.svg.axis()
        .scale(this.y)
        .orient("left");    
    // Area
    this.area = d3.svg.area()
        .interpolate("step-after")
        .x(function(d) {return that.x(d.time); })
        .y0(that.height)
        .y1(function(d) {return that.y(d.count); });     
    // Brush
    this.brush = d3.svg.brush()
        .x(this.x)
        .on("brush", function(){
            that.ext = that.snapBrush(that.brush.extent());
            d3.select(".brush").call(that.brush.extent(that.ext));            
            $(that.eventHandler).trigger("selectionChanged", {
                "start": that.ext[0], 
                "end": that.ext[1]
            });
            var start = that.dateFormatter(that.ext[0]);
            var end = that.dateFormatter(that.ext[1]);
            d3.select("#brushInfo")
                .text(start + " -> " + end);
        });          
    // Zoom
    // References:
    // Name: Bostock, Mike 
    // Accessed: Mar 31, 2015
    // Link: http://bl.ocks.org/mbostock/4015254
    // 
    // Name: Codepen
    // Accessed: Mar 27, 2015
    // Link: http://codepen.io/ghiden/pen/DHCiz    
    this.zoom = d3.behavior.zoom()
        .x(this.x)
        .scaleExtent([1,10])
        .size([this.width,this.height]) 
        .on("zoom", function(){
            if (that.x.domain()[0] < d3.min(that.data, function(d) {return d.time; })) {
                var x = that.zoom.translate()[0] - that.x(d3.min(that.data, function(d) {return d.time; })) + that.x.range()[0];
                    that.zoom.translate([x, 0]);
            }        
            else if (that.x.domain()[1] > d3.max(that.data, function(d) {return d.time; })) {
                var x = that.zoom.translate()[0] - that.x(d3.max(that.data, function(d) {return d.time; })) + that.x.range()[1];
                    that.zoom.translate([x, 0]);
                };
            that.updateVis();            
        });    
    // Add SVG
    this.svg = this.parentElement
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);
    // Add Slider
    this.addSlider(this.svg);
    // Add "Comparison Selector" label
    this.svg
        .append("text")
        .attr("x",0)
        .attr("y",this.margin2.top+8)
        .text("Comparison");
    this.svg
        .append("text")
        .attr("x",0)
        .attr("y",this.margin2.top+26)
        .text("Selector:");    
    // Add Graph Group
    this.graph = this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .call(this.zoom)
        .on("mousedown.zoom", null);   
    // Add Axes 
    this.graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")");
    this.graph.append("g")
        .attr("class", "y axis");
    // Add Clip Path   
    this.graph.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width+1)
        .attr("height", this.height);
    // Add Area 
    this.graph.selectAll(".area")
        .data([this.data])
        .enter()
        .append("path")
        .attr("class", "area")
        .attr("clip-path", "url(#clip)");
    // Add Ave Line
    this.graph.selectAll(".barAve")
        .data([this.ave])
        .enter()
        .append("line")
        .attr("class", "barAve averageLine")    
        .attr("stroke-dasharray","0,10,10,0")
        .attr("x1", 0)
        .attr("x2", this.width);
    // Add Comparison Extent to Main Graph
    this.graph.append("rect")
        .attr("class", "compRect")
        .attr("y", 0)
        .attr("height", that.height)
        .attr("clip-path", "url(#clip)");    
    // Add Brush
    this.graph.append("g")
        .attr("class", "brush")
        .call(this.brush)
        .selectAll("rect")
        .attr("height", this.height)
        .attr("clip-path", "url(#clip)");
    // Add Comparison Brush
    this.compBrushGroup = this.svg.append("g")
        .attr("class", "compBrushGroup")
        .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");
    this.compBrushGroup.append("rect")
        .attr("width", this.width)
        .attr("height", this.height2)
        .attr("style", "fill: lightgray; stroke: #000; shape-rendering: crispEdges;");
    this.compBrushGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height2 + ")");
    this.compBrush = d3.svg.brush()
        .x(this.x)
        .on("brush", function(){
            that.compExtent = that.snapBrush(that.compBrush.extent());
            that.compBrushGroup.select(".compBrush")
                .call(that.compBrush.extent(that.compExtent));
            that.graph.select(".compRect")
                .attr("x", that.x(that.compExtent[0]))
                .attr("width", that.x(that.compExtent[1]) - that.x(that.compExtent[0]));
            $(that.eventHandler).trigger("compChanged", {
                "start": that.compExtent[0], 
                "end": that.compExtent[1]
            });
            var start = that.dateFormatter(that.compExtent[0]);
            var end = that.dateFormatter(that.compExtent[1]);
            d3.select("#compInfo")
                .text(start + " -> " + end);
        });
    this.compBrushGroup.append("g")
        .attr("class", "compBrush")
        .attr("transform", "translate(0,1)")
        .call(this.compBrush)
        .selectAll("rect")
        .attr("height", this.height2-1)
        .attr("clip-path", "url(#clip)");            
    // Update Vis       
    this.updateVis(); 
}

CountVis.prototype.updateVis = function(){
    var that = this;
    // Update Brush
    if(this.ext) {
        this.brush.extent(this.ext);   
        this.graph.select(".brush")
            .call(this.brush);      
    };
    // Update Comparison Brush
    if(this.compExtent) {
        this.compBrush.extent(this.compExtent);   
        this.compBrushGroup.select(".compBrush")
            .call(this.compBrush);
        this.graph.select(".compRect")
            .attr("x", this.x(this.compExtent[0]))
            .attr("width", this.x(this.compExtent[1]) - this.x(this.compExtent[0]));                 
    };
    // Update Axes
    this.graph.select(".x.axis")
        .call(this.x_axis);
    this.compBrushGroup.select(".x.axis")
        .call(this.x_axis);    
    this.graph.select(".y.axis")
        .call(this.y_axis);
    // Update Graph
    this.graph.select(".area")
        .attr("d", this.area);
    // Update Ave Line
    this.graph.select(".barAve")  
        .attr("y1", function(d){return that.y(d); })  
        .attr("y2", function(d){return that.y(d); });     
}

CountVis.prototype.resetZoom = function(){
    this.x.domain(d3.extent(this.data, function(d) {return d.time; }));
    this.zoom.x(this.x)
    this.updateVis(); 
}

CountVis.prototype.clearBrushes = function(){
    this.ext = null;
    this.compExtent = null;
    this.brush.clear();   
    this.compBrush.clear();   
    this.graph.select(".brush")
        .call(this.brush);
    this.compBrushGroup.select(".compBrush")
        .call(this.compBrush);
    this.graph.select(".compRect")
        .attr("x", null)
        .attr("width", null);    
    $(this.eventHandler).trigger("selectionChanged", {});
    d3.select("#brushInfo").text(null);    
    d3.select("#compInfo").text(null);    
}

CountVis.prototype.addSlider = function(svg){
    var that = this;
    var sliderScale = d3.scale.linear().domain([0.1,1]).range([0,200])
    var sliderDragged = function(){
        var value = Math.max(0, Math.min(200,d3.event.y));
        var sliderValue = sliderScale.invert(value);
        that.y.exponent(sliderValue);
        d3.select(this)
            .attr("y", function () {
                return sliderScale(sliderValue);
            })
        that.updateVis({});
    }
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged)
    var sliderGroup = svg.append("g").attr({
        class:"sliderGroup",
        "transform":"translate("+0+","+30+")"
    })
    sliderGroup.append("rect").attr({
        class:"sliderBg",
        x:5,
        width:10,
        height:200
    }).style({
        fill:"lightgray"
    })
    sliderGroup.append("rect").attr({
        "class":"sliderHandle",
        y:200,
        width:20,
        height:10,
        rx:2,
        ry:2
    }).style({
        fill:"#333"
    }).call(sliderDragBehaviour)
}

// Snap brush to select full days
// Reference: 
// Name: Bostock, Mike
// Accessed: Mar 26, 2015
// Link: http://bl.ocks.org/mbostock/6232620
CountVis.prototype.snapBrush = function(ext){
    var extent = [];
    if (d3.event.mode === "move") {
        extent[0] = d3.time.day.round(ext[0]);
        extent[1] = d3.time.day.round(ext[1]);
    } else { 
        extent[0] = d3.time.day.floor(ext[0]);
        extent[1] = d3.time.second.offset(d3.time.day.ceil(ext[1]), -1);
    };
    return extent;
}


