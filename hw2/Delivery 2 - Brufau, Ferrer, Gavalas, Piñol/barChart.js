/*
   Adapted from
   MIT License (c) 2017 Curran Kelleher
   "Reusable bar chart" 
   https://bl.ocks.org/curran/af72fd9c1fb61d2133d273cd8a3ca557

   Inspired by
   Mike Bostock "Axis styling", sept. 2017
   https://bl.ocks.org/mbostock/3371592

   Inspired by
   Mike Bostock "Rotated Axis Labels", feb. 2016
   https://bl.ocks.org/mbostock/4403522
   
   Inspired by Edward Tufte data-ink and graphical redesign recommendations
	
   MIT License
   (c) 2017, Mireia Ribera
*/
	
/* This file has not been thoroughly tested,
   if you find something wrong, please write to:
   ribera@ub.edu  
   Thanks in advance */

function BarChart(){
	
	
	/* Initial settings */
    var width,
        height,
        xScale = d3.scaleBand(),
		xScaleInner = d3.scaleBand(),
        yScale = d3.scaleLinear(),
		zScale = d3.scaleOrdinal(d3.schemeCategory10),
        x,
        y,
        margin = { top: 50, bottom: 100, left: 60, right: 10 }, //leave space for legends
        xAxis = d3.axisBottom(xScale),
        yAxis = d3.axisLeft(yScale),
		yticks = 10,
		xticksSize = 0,
		yticksSize = 5,
		yticksFormatNumber=d3.format(".1f")
		distanceLabel=20
		yLegend="value",
		xLegend="name",
		zLegend="Product line";
	/* end initial settings */
            
    function my(selection){
          
        if(!x) throw new Error("Bar Chart x column must be defined.");
        if(!y) throw new Error("Bar Chart y column must be defined.");
        if(!width) throw new Error("Bar Chart width must be defined.");
        if(!height) throw new Error("Bar Chart height must be defined.");
          
        selection.each(function(data) {
			/* container and graph group (.bars) */

		var databars = data.columns.slice(1).map(function(id) {
			return {
				id: id,
				values: data.map(function(d) {
					return {date: d[x], value: +d[id]};
				})
			};
		}); 
		
		//we create an array with as many columns as variables are, and associate the date and values to each. Ex. [{id:"variableA", values: Array[6]},{...},{},{...}]; values:[{date:...,value:77},...]

			
            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
			            
            var g = svg.selectAll("g")
              .data([1]); 
			  
            g = g.enter()
				.append("g")
				.attr('id','bars')
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top +")");
			
            var innerWidth = width - margin.left - margin.right;
            var innerHeight = height - margin.top - margin.bottom;

			/* end of container and graph group (.bars) */
			
			/* scales */
            xScale
              .domain(data.map(function (d){ return d[x]; })) //returns all the values for names*/
			  .range([0, innerWidth-50])
			  .paddingOuter(0)
			  .padding(0.1);

			  
			function Max(max) {
				for (i = 0; i < databars.length; i++){
					barvalue=databars[i].values
					for (j = 0; j < barvalue.length; j++) {
						yvalue=barvalue[j];
						max = Math.max(max,yvalue["value"]);
					}
				}
				return max;
			};

			
            yScale
			  .domain([0,Max(0)]) //base at zero
              .range([innerHeight, 0]);

  
  			var domainZ = (databars.map(function(db) {return db.id; })); //all databars values

			zScale
				.domain(domainZ)

			colour = {
						'Camping Equipment': '#1f77b4',
						'Golf Equipment': '#ff7f0e',
						'Mountaineering Equipment': '#2ca02c',
						'Outdoor Protection': '#d62728',
						'Personal Accessories': '#9467bd'
					 };
			function colour_assigned(d){
				return colour[d];

			};

			xScaleInner //scale to position the different bars
				.domain(domainZ)
				.padding(0.05)
				.rangeRound([0,xScale.bandwidth()]);
	

			/* end of scales */
			  
			/* x-axis */
			  
			d3.select('.x-axis').remove(); //delete old axis

			xAxis.tickSize(xticksSize);
			
            xAxisG=d3.select("#bars")	//create new axis
			    .append("g")
					.attr("class", "x-axis")
					.attr("transform", "translate(0," + innerHeight +")")
					.call(xAxis)
				.selectAll("text")
					.attr("y",0)
					.attr("x",-5)
					.attr("transform","rotate(-45)")
					.style("text-anchor","end");

			d3.select("#bars .x-axis") //x-axis legend
				.append("text")
					.attr("class","label")
					.attr("x",innerWidth)
					.attr("y",-xLegend.length)
					.style("text-anchor","end")
					.text(xLegend)

					
			d3.select("path.domain").remove();

			/* x-axis */
					
			/* bars */
					
            var rects = d3.select("#bars");
			
			
			var chartBar = rects.selectAll(zLegend)
				.data(databars) //we use our preprocessed data
			
			  
/*			chartBar 
				.attr("class", "update");  //put anything specific for updating
*/
            chartBar.exit() //exit
				.remove();
			
				
			var chartBarEnter = chartBar.enter()
				.append("g")
				.attr("class",function(d) {return d.id;});
				
			for (i=0;i<databars[0].values.length;i++){	

				chartBarEnter
					.append("rect")
						.merge(chartBar)
						.attr('class',function(d) {return 'bar date'+d.values[i]["date"];})
						.attr("x", function (d){ return xScale(d.values[i]["date"])+xScaleInner(d.id);})
						.attr("y", function (d){ return yScale(d.values[i]["value"]); })
						.attr("width", xScaleInner.bandwidth())
						.attr("height", function (d){return innerHeight - yScale(d.values[i]["value"]);})
						.attr("fill",function(d) {return colour_assigned(d.id);})
						.on("mouseover", function(d) {rectsFocus(d,i)})
						.on("focus", function(d) {rectsFocus(d,i)})
						.on("mouseout", function(d) {rectsBlur(d,i)})
						.on("blur", function(d) {rectsBlur(d,i)})
						.on("click",function(d) {rectsSelect(d,i)})
						.on("keypress",function(d) {rectsSelect(d,i)});

			}
					
			/* end of bars */

			
			/* y-axis */
			
			d3.select('.y-axis').remove(); //delete old axis

			yAxis.tickSize(yticksSize)
				.tickFormat(yticksFormatNumber);

			
            yAxisG=d3.select("#bars") //create new axis
				.append("g")
					.attr("class", "y-axis")
					.call(yAxis)
				.append("text") //y-axis legend
					.attr("class","label")
					.attr("transform", "rotate(-90)")
					.attr("y", yLegend.length)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(yLegend);			
			
			d3.select("#bars .y-axis") //delete the line
				.select(".domain")
				.remove();

			
			lines=d3.select("#bars").selectAll('.y-axis .tick:not(:first-of-type) line')
					.attr('stroke','#ccc')
					.attr('stroke-dasharray','2,2')
					.attr('x2',innerWidth)
					.attr('x1',5);				
			
			
			/* y-axis */

			/* color legend */
		
			var colorLegendSVG = d3.select("#colorLegend")

			var legendOrdinal = d3.legendColor()
				.shapePadding(5)
				.scale(zScale)
				.title(zLegend)
				.labelWrap(20)
				.on("cellclick",legendColorsCellClick())
				.on("cellover",legendColorsCellOver())
				.on("cellout",legendColorsCellOut()); 

			colorLegendSVG
			  .call(legendOrdinal);		
						
			/* end color legend */
				
        });
    };

	/* INTERACTION */
	
	var tooltip = d3.select("body").append("div")
		.attr("class","tooltip")
		.style("opacity",1);

	function rectsFocus(d,i) {
	}

	function rectsBlur(d,i) {
	}

	function rectsSelect(d,i) {
	}

	function legendColorsCellClick() {
	};

	function legendColorsCellOver() {
	};

	function legendColorsCellOut() {
	};


	/* END INTERACTION */
	
	/* SETTERS AND GETTERS ON BARGRAPH SETTINGS
	
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
        
    my.padding = function (value){
		return arguments.length ? (xScale.padding(value), my) : xScale.padding();
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

    my.yticksFormatNumber = function (value){
        return arguments.length ? (yticksFormatNumber = value, my) : yticksFormatNumber;
    };
		
	/* end SETTERS AND GETTERS */
			
    return my;
};
	  
function updateFunction(f){ 
	/* this function receives a new file 
	   and updates the chart accordingly */

	  
	d3.csv(f, parseRow, function (mydata){
		content='';
		mydata.forEach(function(d){
			content='<p>'+d[barChart.x]+' '+d[barChart.y]+'<p>'+content;
		});

		d3.select("#bar-chart")
			.datum(mydata)
			.call(barChart);          			
		});		
};
	  
function resizeFunction(w,h){
	/* this function receives a new width and height
	   and updates the chart accordingly */
			
	barChart.width(w);
	barChart.height(h);
			
	d3.select("#bar-chart")
		.call(barChart);          					
};	  			 
	  
function parseRow(d){
	/* helper function, parses string to number */
    d.value = +d.value; 
    return d;
};
      
