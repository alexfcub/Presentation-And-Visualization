/*
   Inspired by
   Mike Bosctock "Multi-Series Line chart", february 2018
   https://bl.ocks.org/mbostock/3884955
   
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

function LineChartTime(){
	
	
	/* Initial settings */
    var width,
        height,
        xScale = d3.scaleTime(),
        yScale = d3.scaleLinear(),
		zScale = d3.scaleOrdinal(d3.schemeCategory10),
        margin = { top: 20, bottom: 50, left: 50, right: 20 }, //leave space for legends
        xAxis = d3.axisBottom(xScale),
        yAxis = d3.axisLeft(yScale),
		line = d3.line()
			.x(function(d) { return xScale(d["date"]); }) 
			.y(function(d) { return yScale(d["value"]); }),
		yticks = 10,
		xticksSize = 5,
		yticksSize = 5,
		yticksFormatNumberLine=d3.format(".0f")
		distanceLabel=10
		yLegend="value",
		xLegend="time",
		zLegend="type";
	/* end initial settings */
            
    function my(selection){
          
        if(!x) throw new Error("Line Chart x column must be defined.");
        if(!y) throw new Error("Line Chart y column must be defined.");
        if(!width) throw new Error("Line Chart width must be defined.");
        if(!height) throw new Error("Line Chart height must be defined.");
       	
        selection.each(function(data) {
			/* container and graph group (#lines) */
		var datalines = data.columns.slice(1).map(function(id) {
			return {
				id: id,
				values: data.map(function(d) {
					return {date: d[x], value: +d[id]};
				})
			};
		}); //we create an array with as many columns as variables are, and associate the date and values to each. Ex. [{id:"variableA", values: Array[36]},{...},{},{...}]; values:[{date:...,value:77},...]
		
		
		var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
			
            
            var g = svg.selectAll("g")
              .data([1]); //only one group 
			  
            g = g.enter()
				.append("g")
				.attr('id','liness')
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top +")");
			
            var innerWidth = width - margin.left - margin.right;
            var innerHeight = height - margin.top - margin.bottom;

			/* end of container and graph group (#lines) */
			
			/* scales */
            xScale
			  .domain(d3.extent(data, function(d) {return d[x];})) //min and max values
 			  .rangeRound([0,innerWidth]);
			
			function minMax(min,max) {
				for (i = 0; i < datalines.length; i++){
					linevalue=datalines[i].values
					for (j = 0; j < linevalue.length; j++) {
						yvalue=linevalue[j];
						min = Math.min(min,yvalue["value"]);
						max = Math.max(max,yvalue["value"]);
					}
				}
				return [min,max]
			};
			
            yScale
              .domain(minMax(9999999,0)) 
              .range([innerHeight, 0]);
			  
		
			var domainZ = (datalines.map(function(dl) { return dl.id; }));; //all datalines values
		
			zScale
				.domain(domainZ)


			  /* end of scales */
			  
			/* x-axis */
			  
			d3.select('.x-axis-lines').remove(); //delete old axis

			xAxis.tickSize(xticksSize);
			
            xAxisG=d3.select("#liness")	//create new axis
			    .append("g")
					.attr("class", "x-axis-lines")
					.attr("transform", "translate(0," + innerHeight +")")
					.call(xAxis)
				.selectAll("text")
					.attr("y",xticksSize)
					.attr("x",-xticksSize)
					.attr("transform","rotate(-45)")
					.style("text-anchor","end");

			d3.select("#liness .x-axis-lines") //x-axis Legend
				.append("text")
					.attr("class","label")
					.attr("x",innerWidth)
					.attr("y",-xLegend.length)
					.style("text-anchor","end")
					.text(xLegend);
				
			/* x-axis */

			
			/* lines */
					
            var chartLines = d3.select("#liness");
			console.log(zLegend);
			var chartLine = chartLines.selectAll(zLegend)
				.data(datalines) //we use our preprocessed data
		
			chartLine.enter()
				.append("g")
					.attr("class",zLegend)
					.append("path")
						.merge(chartLine)
						.attr("class",function(d) {return "chartline "+d.id;})
						.attr("fill", "none")
						.attr("stroke",function(d) {return zScale(d.id);})
						.attr("stroke-linejoin", "round")
						.attr("stroke-linecap", "round")
						.attr("stroke-width", 1.5) 
						.attr("d", function(d) { return line(d.values);})
						.on("mouseover", function(d) {linesFocus(d.id)})
						.on("focus", function(d) {linesFocus(d.id)})
						.on("mouseout", function(d) {linesBlur(d.id)})
						.on("blur", function(d) {linesBlur(d.id)})
						.on("click",function(d) {linesSelect(d.id)})
						.on("keypress",function(d) {linesSelect(d.id)});
					
					
			/* put anything related to update 
			chartLine 
				.attr("class", "update");  
			   end update */			
			
			chartLine.exit() //exit
				.remove();
				


			
			/* end of lines */

			/* y-axis */
			
			d3.select('.y-axis-lines').remove(); //delete old axis

			yAxis.tickSize(yticksSize)
				.tickFormat(yticksFormatNumberLine);

			
            yAxisG=d3.select("#liness") //create new axis
				.append("g")
					.attr("class", "y-axis-lines")
					.call(yAxis)
				.append("text") //y-axis legend
					.attr("class","label")
					.attr("transform", "rotate(-90)")
					.attr("y", yLegend.length)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(yLegend);			

			d3.select("#liness .y-axis-lines") //delete the original line
				.select(".domain")
				.remove();
								
			lines=d3.select("#liness").selectAll('.y-axis-lines .tick:not(:first-of-type)  line')
					.attr('stroke','#fff')
					.attr('stroke-dasharray','2,2')
					.attr('x2',innerWidth)
					.attr('x1',5);				

			/* y-axis */
			
			
			/* color legend */
		
			var colorLegendSVG = d3.select("#colorLegend6")

			var legendOrdinal = d3.legendColor()
				.shape("line")
				.shapePadding(5)
				.shapeWidth(30)
				.scale(zScale)
				.title(zLegend)
				.labelWrap(20)
				.on("cellclick",legendColorsCellClick())
				.on("cellover",legendColorsCellOver())
				.on("cellout",legendColorsCellOut()); 

			colorLegendSVG
			  .call(legendOrdinal);		
			
			/* We assign a class to every element of the colorlegend */
			colorCells = d3.select("#colorLegend6")
				.selectAll(".cell line")
			colorCells=colorCells._groups[0];
			
			for (i=0;i<colorCells.length;i++){
				colorCells[i].setAttribute("class","swatch "+zScale.domain()[i]);
			}
			/* end class */
			
			/* end color legend */

			
				
        });
    };


	/* INTERACTION */
	
	var tooltip = d3.select("body").append("div")
		.attr("class","tooltip")
		.style("opacity",0);

	function legendColorsCellClick() {
	};
	function legendColorsCellOver() {
	};
	function legendColorsCellOut() {
	};

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

    my.z = function (value){
        return arguments.length ? (z = value, my) : z;
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
	
	my.zLegend = function (value){
		return arguments.length ? (zLegend = value, my) : zLegend;
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
	d[x] = parseTime(d[x]);
    d[y] = +d[y]; 
    return d;
};

			
      
