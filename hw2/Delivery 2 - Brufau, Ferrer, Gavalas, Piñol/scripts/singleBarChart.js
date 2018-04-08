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

function singleBarChart1(){
	
	
	/* Initial settings */
    var width, 					   		//size of the chart
        height,					   		//size of the chart
        xScaleSingle = d3.scaleBand(),		//scale for x-axis
        yScale = d3.scaleLinear(),		//scale for y-axis
        x,								//x values column name in dataset
        y,								//y values column name in dataset
        margin = { top: 50, bottom: 100, left: 60, right: 10 }, //margins
        xAxisSingle = d3.axisBottom(xScaleSingle),	//x-Axis
        yAxis = d3.axisLeft(yScale),	//y-Axis
		yticks = 20,					//number of ticks in y-axis
		xticksSize = 0,					//size of tick lines in x-axis
		yticksSize = 5,					//size of tick lines in y-axis
		yticksFormatNumber=d3.format(".1f")	//number format for y-axis values
		distanceLabel=20				// distance of bars label from the top of the bar
		yLegend="value",				// legend for y-axis
		xLegend="name";					// legend for x-axis
	/* end initial settings */
            
    function my(selection){
          
        if(!x) throw new Error("Bar Chart x column must be defined.");
        if(!y) throw new Error("Bar Chart y column must be defined.");
        if(!width) throw new Error("Bar Chart width must be defined.");
        if(!height) throw new Error("Bar Chart height must be defined.");
          
        selection.each(function(data) {
			/* container and graph group (#bars) */
		
            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
			            
            var g = svg.selectAll("g")
              .data([1]); 
			  
            g = g.enter()
				.append("g")
				.attr('id','bars-single')
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top +")");
			
            var innerWidth = width - margin.left - margin.right;
            var innerHeight = height - margin.top - margin.bottom;

			/* end of container and graph group (#bars) */
			
			/* scales */
            xScaleSingle
              .domain(data.map(function (d){ return d[x]; })) //returns all the values for names*/
			  .range([0, innerWidth])
			  .paddingOuter(0);
            
            yScale
              .domain([0, d3.max(data, function (d){ return d[y] })])
              .range([innerHeight, 0]);
			/* end of scales */
			  
			/* x-axis */
			  
			d3.select('.x-axis-single').remove(); //delete old axis

			xAxisSingle.tickSize(xticksSize);
			
            xAxisG=d3.select("#bars-single")	//create new axis
			    .append("g")
					.attr("class", "x-axis-single")
					.attr("transform", "translate(0," + innerHeight +")")
					.call(xAxisSingle)
				.selectAll("text")
					.attr("y",0)
					.attr("x",-5)
					.attr("transform","rotate(-45)")
					.style("text-anchor","end");

			d3.select("#bars-single .x-axis-single") //x-axis Legend
				.append("text")
					.attr("class","label")
					.attr("x",innerWidth)
					.attr("y",40)
					.style("text-anchor","end")
					.text(xLegend)
		
			//d3.select("path.domain").remove();

			/* x-axis */
					
			/* bars */
					
            var rects = d3.select("#bars-single").selectAll("rect")
              .data(data, function(d){return d[x]})
					
/*			rects 
				.attr("class", "update");  //put anything specific for updating
*/
			
            rects.exit() //exit
				.remove();
				
            rects.enter() //enter
			  .append("rect")
				.attr('class',function (d){ return d[x]+' bar';})
				.merge(rects)
				.attr('style', "fill: royalblue")
			    .attr("x", function (d){ return xScaleSingle(d[x]); })
                .attr("y", function (d){ return yScale(d[y]); })
                .attr("width", xScaleSingle.bandwidth())
                .attr("height", function (d){
                  return innerHeight - yScale(d[y]);
                })
				.on("mouseover", function(d) {rectsFocus(d)})
				.on("focus", function(d) {rectsFocus(d)})
				.on("mouseout", function(d) {rectsBlur(d)})
				.on("blur", function(d) {rectsBlur(d)})
				.on("click",function(d) {rectsSelect(d)})
				.on("keypress",function(d) {rectsSelect(d)});

			
			/*var texts = d3.select("#bars-single").selectAll('.label')
				.data(data, function(d){return d[x]});
				
			texts.exit()	//exit
				.remove();
			texts.enter()  //enter
				.append('text')
				.merge(texts)
				.text(function(d) {
						return d[y];
				})
				.attr("x", function (d){ return xScale.bandwidth()/2+xScale(d[x])-5; })
                .attr("y", function (d){ return yScale(d[y])+ distanceLabel; })
				.attr('class','label');*/

			/* end of bars */

			
			/* y-axis */
			
			d3.select('.y-axis-single').remove(); //delete old axis

			yAxis.tickSize(yticksSize) //configure the axis as in the settings
				.tickFormat(yticksFormatNumber);

			
            yAxisG=d3.select("#bars-single") //create new axis
				.append("g")
					.attr("class", "y-axis-single")
					.call(yAxis)
				.append("text") //y-axis legend
					.attr("class","label")
					.attr("transform", "rotate(-90)")
					.attr("y", -30)
					.attr("x", 0)
					.style("text-anchor", "end")
					.text(yLegend);			
			
			d3.select("#bars-single .y-axis-single") //delete the line
				.select(".domain")
				.remove();

			//tweak the axis, to make it behave as an horizontal grid
			lines=d3.select("#bars-single").selectAll('.y-axis-single .tick:not(:first-of-type) line')
					.attr('stroke','#fff')
					.attr('stroke-dasharray','2,2')
					.attr('x2',innerWidth) //ticks are prolonged all the chart
					.attr('x1',5);				

			/* y-axis */

				
        });
    };

	/* INTERACTION */
	
	var tooltip = d3.select("body").append("div")
		.attr("class","tooltip")
		.style("opacity",0);

	function rectsFocus(d) {
	}

	function rectsBlur(d) {
	}

	function rectsSelect(d) {
	}

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
		return arguments.length ? (xScaleSingle.padding(value), my) : xScaleSingle.padding();
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

    my.yticksFormatNumber = function (value){
        return arguments.length ? (yticksFormatNumber = value, my) : yticksFormatNumber;
    };
		
	/* end SETTERS AND GETTERS */
			
    return my;
};
	  
function updateFunction(f,htmlid){ 
	/* this function receives a new file 
	   and updates the chart accordingly */
	  
	d3.csv(f, parseRow, function (mydata){//keep data name as in HTML
		d3.select(htmlid)
			.datum(mydata)
			.call(singleBarChart);          			
		});		
};
	  
function resizeFunction(w,h,htmlid){
	/* this function receives a new width and height
	   and updates the chart accordingly */
			
	singleBarChart.width(w);
	singleBarChart.height(h);
			
	d3.select(htmlid)
		.call(singleBarChart);          					
};	  			 
	  
function parseRow(d){
	/* helper function, parses string to number */
    d.value = +d.value; 
    return d;
};
      
