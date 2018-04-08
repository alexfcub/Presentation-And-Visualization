/*
   Adapted from Michael Hall "A static, reusable donut chart for D3.js v4"
   https://bl.ocks.org/mbhall88/b2504f8f3e384de4ff2b9dfa60f325e2 
   MIT License

Copyright (c) 2017 Michael Hall

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/*
   
   MIT License
   (c) 2018, Mireia Ribera
*/
	
/* This file has not been thoroughly tested,
   if you find something wrong, please write to:
   ribera@ub.edu  
*/
function donutChart(){
	
	
	/* Initial settings */
    var width,
        height,
		radius,
		num,
        margin = { top: 0, bottom: 0, left: 0, right: 0 },
		variable="value",
		category="name"
		zScale = d3.scaleOrdinal(d3.schemeCategory10),
		cornerRadius=3,
		padAngle=0.015;

	/* end initial settings */
            
    function my(selection){
          
        if(!width) throw new Error("Donut Chart width must be defined.");
        if(!height) throw new Error("Donut Chart height must be defined.");
        if(!num) throw new Error("Donut Chart identifier number must be defined");
       
        selection.each(function(data) {
			/* container and graph group (#donut) */
		

            var svg = d3.select(this)
				.attr("width",width)
				.attr("height",height)
			
			var g = svg.selectAll("g")
				.data([1]); //only one group
				
            var innerWidth = width - margin.left - margin.right;
            var innerHeight = height - margin.top - margin.bottom;

			
			g = g.enter()
				.append("g")
				.attr("id","donut-"+num)
				.attr("transform","translate(" + (innerWidth/2) + "," + (innerHeight/2) +")");
				
			g.append('g')
				.attr("class","slices");

			g.append('g')
				.attr("class","labelName");

			g.append('g')
				.attr("class","lines");
				
			/* end of container and graph group (#lines) */


			/* scales */
			zScale
				.domain(function(d){return d[category];})

			colour = {
						'Product line': {
							'Camping Equipment': '#1f77b4',
							'Golf Equipment': '#ff7f0e',
							'Mountaineering Equipment': '#2ca02c',
							'Outdoor Protection': '#d62728',
							'Personal Accessories': '#9467bd'
						},
						'Retailer country': {
							"Australia": "#e6194b",
							"Austria": "#3cb44b",
							"Belgium":"#ffe119",
							"Brazil": "#0082c8",
							"Canada":"#f58231",
							"China": "#911eb4",
							"Denmark": "#46f0f0",
							"Finland": "#f032e6",
							"France": "#d2f53c",
							"Germany": "#fabebe",
							"Italy": "#008080",
							"Japan": "#e6beff",
							"Korea": "#aa6e28",
							"Mexico": "#fffac8",
							"Netherlands": "#800000",
							"Singapore": "#aaffc3",
							"Spain": "#808000",
							"Sweden": "#ffd8b1",
							"Switzerland": "#000080",
							"United Kingdom": "#808080",
							"United States": "#000000"
						},
						'Order method type': {
							"E-mail": "#e6194b",
							"Fax": "#3cb44b",
							"Mail":"#ffe119",
							"Sales visit": "#0082c8",
							"Special":"#f58231",
							"Telephone": "#911eb4",
							"Web": "#46f0f0",
						}
						
					 };
			function colour_assigned(d){
				return colour[category][d];

			};
 		    /* end of scales */

            /* slices */
			radius = Math.min(width, height) / 2;
				
			var pieGenerator = d3.pie() // Given an array of data, the pie generator will output an array of objects containing the original data augmented by start and end angles, which are needed by arc generator
				.value(function(d) { return d[variable]; })
				.sort(function(a,b) {return a[variable].localeCompare(b[variable]);});
				
			arcGenerator = d3.arc() //arc generator
				.outerRadius(radius * 0.8)
				.innerRadius(radius * 0.6) //outerRadius - innerRadius = thickness of the donut
				.cornerRadius(cornerRadius)
				.padAngle(padAngle);

			var arcData = pieGenerator(data); //we calculate the slices	
					
            var path = svg.select('.slices')
				.selectAll('path')
				.data(arcData);
			

			path.enter()
				.append('path')
				.attr('fill', function(d) {return colour_assigned(d.data[category])})
				.attr('d', arcGenerator)
				.on("mouseover", function(d) {donutSliceFocus(d)})
				.on("focus", function(d) {donutSliceFocus(d)})
				.on("mouseout", function(d) {donutSliceBlur(d)})
				.on("blur", function(d) {donutSliceBlur(d)})
				.on("click", function(d) {donutSliceClick(d)});

			/* end of slices */

			
            /* slice labels */
			
			/* for computing the position of the labels and lines, we use arc.centroid (see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid) of donut and label arcs and +-radius*0.95 depending if the centroid is on the right or on the left */
			
			function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }  // calculates the angle of the middle of a slice
            
			
			labelsArcGenerator = d3.arc() // arc to align the labels
            .outerRadius(radius * 0.9)
            .innerRadius(radius * 0.9);


            var label = svg.select('.labelName')
				.selectAll('text')
                .data(pieGenerator)
              .enter().append('text')
                .attr('dy', '.35em')
                .html(function(d) {
                    return d.data[category] + ': <tspan>' + d.data[variable] + 'M</tspan>';
                })
                .attr('transform', function(d) {
                    var pos = labelsArcGenerator.centroid(d);
                    // changes the point to be on left or right depending on where label is.
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return 'translate(' + pos + ')';
                })
                .style('text-anchor', function(d) {
                    // if slice center is on the left, anchor text to start, otherwise anchor to end
                    return (midAngle(d)) < Math.PI ? 'start' : 'end';
                })
				.on("mouseover", function(d) {donutLabelFocus(d)})
				.on("focus", function(d) {donutLabelFocus(d)})
				.on("mouseout", function(d) {donutLabelBlur(d)})
				.on("blur", function(d) {donutLabelBlur(d)})
				.on("click", function(d) {donutLabelClick(d)});

			/* end slice labels*/

			
			/*  lines to connect slice and labels */
            var polyline = svg.select('.lines')
                .selectAll('polyline')
                .data(pieGenerator)
              .enter().append('polyline')
                .attr('points', function(d) {

                    // see label transform function for explanations of these three lines.
                    var pos = labelsArcGenerator.centroid(d);
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arcGenerator.centroid(d), labelsArcGenerator.centroid(d), pos]
                });

			/* end lines */



        });		
 
	};

	/* INTERACTION */
			
			function donutLabelFocus(d){
				toolTip(d);
			}
			
			function donutSliceFocus(d){
				toolTip(d);
			}
			
			function donutLabelBlur(d){
				removeToolTip(d);
			}
			
			function donutSliceBlur(d){
				removeToolTip(d);
			}

			function donutLabelClick(d) {
				specificProduct(d.data, category);
			}
			function donutSliceClick(d) {
				specificProduct(d.data, category);
			}
			
            /* tooltip */
            function toolTip(d){
                d3.select("#donut-"+num).append('text')
                    .attr('class', 'toolCircle')
                    .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                    .html(toolTipHTML(d)) // add text to the circle.
                    .style('font-size', '.9em')
                    .style('text-anchor', 'middle'); // centres text in tooltip

                d3.select("#donut-"+num).append('circle')
                    .attr('class', 'toolCircle')
                    .attr('r', radius * 0.55) // radius of tooltip circle
                    .style('fill', zScale(d.data[category])) // colour based on category mouse is over
					.style('fill-opacity', 0.35);

            };

            function removeToolTip(d){
                d3.selectAll('.toolCircle').remove();
            };

            //  HTML string for the tool tip
			// 	Loops through each key in data object
            //  Returns the html string 'key: value'
            function toolTipHTML(d) {

                var tip = '',
                    i   = 0;

                for (var key in d.data) {

                    var value = d.data[key];
                    var million = (key=="Order method type" ? '' : 'M');
                    if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>'; //first line 
                    else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + million +'</tspan>'; //second and next lines, dy position them below
                    i++;
                }

                return tip;
            }

			
            /* end tooltip */


	/* END INTERACTION */
	
	/* SETTERS AND GETTERS 
	
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


	my.width = function (value){
        return arguments.length ? (width = value, my) : width;
    };	


	my.height = function (value){
        return arguments.length ? (height = value, my) : height;
    };	

    my.num = function (value){
    	return arguments.length ? (num = value, my) : num;
    }


	my.margin = function (value){
        return arguments.length ? (margin = value, my) : margin;
    };	


	my.variable = function (value){
        return arguments.length ? (variable = value, my) : variable;
    };	


	my.category = function (value){
        return arguments.length ? (category = value, my) : category;
    };	


	my.cornerRadius = function (value){
        return arguments.length ? (cornerRadius = value, my) : cornerRadius;
    };	


	my.padAngle = function (value){
        return arguments.length ? (padAngle = value, my) : padAngle;
    };	
	/* end SETTERS AND GETTERS */

			
    return my;
};

	/* AUXILIAR FUNCTIONS */

	
function updateFunction(f){ 
	/* this function receives a new file 
	   and updates the chart accordingly */

		d3.select("#donut-chart")
			.datum(mydata)
			.call(donutChart);          					
};
	  
function resizeFunction(w,h){
	/* this function receives a new width and height
	   and updates the chart accordingly */
			
	donutChart.width(w);
	donutChart.height(h);
			
	d3.select("#donut-chart")
		.call(donutChart);          					
};	  			 



