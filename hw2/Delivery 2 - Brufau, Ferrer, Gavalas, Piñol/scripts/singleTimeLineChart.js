/*
   Inspired by
   pstuffa "Reusable line chart", july 2017
   https://bl.ocks.org/pstuffa/bc14012b64c12112867e4daaa7af4f6b

   Inspired by
   Mike Bostock "Line chart", march.2017
   https://bl.ocks.org/mbostock/3883245
   
   Inspired by
   Mike Bostock "Rotated Axis Labels", feb. 2016
   https://bl.ocks.org/mbostock/4403522
   
   MIT License
   (c) 2017, Mireia Ribera
*/
	
/* This file has not been thoroughly tested,
   if you find something wrong, please write to:
   ribera@ub.edu  
   Thanks in advance */

function SingleTimeLineChart(){
	
	
	/* Initial settings */
    var width,
        height,
        xScale = d3.scaleTime(),
        yScale = d3.scaleLinear(),
        margin = { top: 50, bottom: 100, left: 50, right: 10 }, 
        xAxis = d3.axisBottom(xScale),
        yAxis = d3.axisLeft(yScale),
		line = d3.line()
			.x(function(d) { return xScale(d[x]); }) 
			.y(function(d) { return yScale(d[y]); }),
		yticks = 10,
		xticksSize = 5,
		yticksSize = 5,
		yticksFormatNumberLine=d3.format(".0f")
		distanceLabel=10
		yLegend="value",
		xLegend="time";
	/* end initial settings */
            
    function my(selection){
          
        if(!x) throw new Error("Line Chart x column must be defined.");
        if(!y) throw new Error("Line Chart y column must be defined.");
        if(!width) throw new Error("Line Chart width must be defined.");
        if(!height) throw new Error("Line Chart height must be defined.");
       
        selection.each(function(data) {
			/* container and graph group (#lines) */
		
	
		var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
			
            
            var g = svg.selectAll("g")
              .data([1]); //only one group 
			  
            g = g.enter()
				.append("g")
				.attr('id','lines')
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top +")");
			
            var innerWidth = width - margin.left - margin.right;
            var innerHeight = height - margin.top - margin.bottom;

			/* end of container and graph group (#lines) */
			
			/* scales */
            xScale
			  .domain(d3.extent(data, function(d) {return d[x];})) //min and max values
 			  .rangeRound([0,innerWidth]);
			
			
            yScale
              .domain(d3.extent(data, function(d) {return d[y];})) //min and max values
              .range([innerHeight, 0]);		

			  /* end of scales */
			  
			/* x-axis */
			  
			d3.select('.x-axis-line').remove(); //delete old axis

			xAxis.tickSize(xticksSize);
			
            xAxisG=d3.select("#lines")	//create new axis
			    .append("g")
					.attr("class", "x-axis-line")
					.attr("transform", "translate(0," + innerHeight +")")
					.call(xAxis)
				.selectAll("text")
					.attr("y",xticksSize)
					.attr("x",-xticksSize)
					.attr("transform","rotate(-45)")
					.style("text-anchor","end");

			d3.select("#lines .x-axis-line") //x-axis Legend
				.append("text")
					.attr("class","label")
					.attr("x",innerWidth)
					.attr("y",40)
					.style("text-anchor","end")
					.text(xLegend)
				
			/* x-axis */




			
			/* lines */
					
            var chartLines = d3.select("#lines")
				.append("path")
					.datum(data)
					
			chartLines.enter()
					.merge(chartLines)
					.attr("class","chartline")
					.attr("fill", "none")
					.attr("stroke", "steelblue")
					.attr("stroke-linejoin", "round")
					.attr("stroke-linecap", "round")
					.attr("stroke-width", 1.5) 
					.attr("d", line)
					.on("mouseover", function(d) {linesFocus(d)})
					.on("focus", function(d) {linesFocus(d)})
					.on("mouseout", function(d) {linesBlur(d)})
					.on("blur", function(d) {linesBlur(d)})
					.on("click",function(d) {linesSelect(d)})
					.on("keypress",function(d) {linesSelect(d)});
					;
			
			/* put anything related to update *
			chartLines
				.attr("class","update");
			
			* end update */
			
			chartLines.exit()
				.remove()
						
			/* end of lines */

			/* y-axis */
			
			d3.select('.y-axis-line').remove(); //delete old axis

			yAxis.tickSize(yticksSize)
				.tickFormat(yticksFormatNumberLine);

			
            yAxisG=d3.select("#lines") //create new axis
				.append("g")
					.attr("class", "y-axis-line")
					.call(yAxis)
				.append("text") //y-axis legend
					.attr("class","label")
					.attr("transform", "rotate(-90)")
					.attr("y", -30)
					.attr("x",0)
					.style("text-anchor", "end")
					.text(yLegend);			

			d3.select("#lines .y-axis-line") //delete the original line
				.select(".domain")
				.remove();
								
			lines=d3.select("#lines").selectAll('.y-axis-line .tick:not(:first-of-type)  line')
					.attr('stroke','#ccc')
					.attr('stroke-dasharray','2,2')
					.attr('x2',innerWidth)
					.attr('x1',5);				

			/* y-axis */
			
			
				
        });
    };


	/* INTERACTION */
	
	var tooltip = d3.select("body").append("div")
		.attr("class","tooltip")
		.style("opacity",0);

		
    function linesFocus(){
	}

	function linesBlur(){
	}

	function linesSelect(){
	}

	/* END INTERACTION */
	
	/* SETTERS AND GETTERS ON LINEGRAPH SETTINGS
	
	They follow the pattern
	
	some_function.x = function(value) {
		if (!arguments.length) {
			return x;
		} else {
			x = value;
			return my;
		}
	};
		
	in a compressed form
		
	*/
    
	my.x = function (value){
        return arguments.length ? (x = value, my) : x;
    };
        
    my.y = function (value){
        return arguments.length ? (y = value, my) : y;
    };

	
    my.width = function (value){
        return arguments.length ? (width = value, my) : width;
    };
        
    my.height = function (value){
		return arguments.length ? (height = value, my) : height;
    };
        
    my.yticks = function (value){
        return arguments.length ? (yticks = value, my) : yticks;
    };

    my.xLegend = function (value){
        return arguments.length ? (xLegend = value, my) : xLegend;
    };

	my.yLegend = function (value){
		return arguments.length ? (yLegend = value, my) : yLegend;
    };
	
		
    my.xticksSize = function (value){
		return arguments.length ? (xticksSize = value, my) : xticksSize;
    };

    my.yticksSize = function (value){
        return arguments.length ? (yticksSize = value, my) : yticksSize;
    };

    my.distanceLabel = function (value){
        return arguments.length ? (distanceLabel = value, my) : distanceLabel;
    };

    my.yticksFormatNumberLine = function (value){
        return arguments.length ? (yticksFormatNumberLine = value, my) : yticksFormatNumberLine;
    };
		
	/* end SETTERS AND GETTERS */
			
    return my;
};
	  
function updateFunction(f){ 
	/* this function receives a new file 
	   and updates the chart accordingly */

		d3.select("#line-chart")
			.datum(mydata)
			.call(lineChart);          					
};
	  
function resizeFunction(w,h){
	/* this function receives a new width and height
	   and updates the chart accordingly */
			
	lineChart.width(w);
	lineChart.height(h);
			
	d3.select("#line-chart")
		.call(lineChart);          					
};	  			 

var parseTime = d3.timeParse("%Y");

function parseRow(d){
	/* helper function, parses string to number, year to date */
    d[y] = +d[y]; 
	d[x] = parseTime(d[x]);
    return d;
};

			
      
