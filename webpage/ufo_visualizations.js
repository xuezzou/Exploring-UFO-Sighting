/*

References:
1. d3 map: http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922
2. https://bl.ocks.org/mbostock/4090848
3. https://gist.github.com/NPashaP/a74faf20b492ad377312

special thanks to Prof. Matthew Berger for strong technical supports

*/


function plot_it() {

    // set up sizes
    let width = 2000;
    let height = 1000;
	let upper_padding = 15;
    let padding = 30;
    let opacity = 0.1;

    let map_width = 960;
    let map_height = 570;

    let sub_info_width = 175;
    let sub_info_height = 175;
	let sub_padding = 20;
    // aggregate the data
    let aggregatedByState = d3.nest().key(function (d) {
        return d.state;
    }).entries(ufo_data);


    let svg = d3.selectAll('body').append('svg').attr('width', width).attr('height', height);
    //add map section
    //map_data.features = map_data.features.filter(d => d.properties.STATAE=='037'); 
    let projection = d3.geoAzimuthalEqualArea().rotate([90, 0]).fitSize([map_width, map_height], map_data);
    let geo_generator = d3.geoPath().projection(projection);

	let mapPlot=d3.select('svg').append('g').attr('id','map_plot').attr('transform', "translate(" + padding + "," + upper_padding + ")");

	mapPlot.append('rect').attr('x',0).attr('y',0).attr('height', map_height).attr('width',map_width).attr('fill','lightblue')

    zoomZone = mapPlot.append('g').attr('id', 'zoom_zone').attr('transform', "translate(" + 0 + "," + 0 + ")");

//	zoomZone.append('rect').attr('fill','lightblue').attr('x',0).attr('y',0).attr('height',height).attr('width',width);
    //draw states and color states
    let states = zoomZone.selectAll(".state")
        .data(map_data.features).enter().append("path").attr("class", "state").attr("d", geo_generator)
        .style("fill", function (d) {
                let element = aggregatedByState.find(function (element) {
                    return element.key == d.properties['NAME']
                });
                let coef = 0;
                if (element) {
                    coef = element.values.length;
                }
                return d3.interpolate("#ffffcc", "#800026")(coef / 4000);
            }
        );


    //add map legends

    //add ufo reports data points onto the map
    let all_reports = [];
    ufo_data.forEach(function (d) {
        all_reports.push([d.longtitude, d.latitude]);
    });
    let projected_reports = all_reports.map(d => projection(d));


    let viewCircle = false;
    // add detailed button/click effect
	svg.append('rect')
		.attr('rx',5)
		.attr('ry',5)
		.attr('x',padding+10)
		.attr('y',padding)
		.attr('height',30)
		.attr('width', 140)
		.attr('fill','purple')
        .on("click", function() {
			if(!viewCircle) {
				plotCircles();
				viewCircle = true;
			} else {
				removeCircles();
				viewCircle = false;
			}
    	})
		.on('mouseover', function(d){
			d3.select(this).style('cursor','hand');
		});
    svg.append('text').text('Show Report Map')
        .attr('x', padding+20)
        .attr('y', padding+20)
		.attr('fill', 'white')
        .on("click", function() {
			if(!viewCircle) {
				plotCircles();
				viewCircle = true;
			} else {
				removeCircles();
				viewCircle = false;
			}
    	})
		.on('mouseover', function(d){
			d3.select(this).style('cursor','hand');
		});

    function plotCircles() {
        // adjust the background
        //states.attr('fill-opacity', 0.2);
        zoomZone.selectAll('circle').data(projected_reports).enter()
            .append('circle')
			.attr('class', 'reports')
            .attr('fill', '#800000')
            .attr('cx', d => d[0])
            .attr('cy', d => d[1])
            .attr('r', 1.3)
            .attr('stroke', '#ffffcc')
            .attr('stroke-width', 0.1)
            .attr('stroke-opacity', 0.1)
            .attr('fill-opacity', '0.2');

        // allow zooming effect
        zoomZone.call(d3.zoom().on("zoom", function () {
            zoomZone.attr("transform", d3.event.transform)
        }));
    }

    function removeCircles() {
        states.attr('fill-opacity', 1);
        zoomZone.selectAll('.reports').remove();
    }


    // add air base button/click effect
	view_air_bases = false;
	svg.append('rect')
		.attr('rx',5)
		.attr('ry',5)
		.attr('x',padding+10)
		.attr('y',2* padding+10)
		.attr('height',30)
		.attr('width', 140)
		.attr('fill','purple')
        .on("click", function() {
			if(!view_air_bases) {
				view_air_bases = true;
				plotAirBases();
				
			} else {
				view_air_bases = false;
				removeAirBases();
			
			}
    	})
		.on('mouseover', function(d){
			d3.select(this).style('cursor','hand');
		});
    svg.append('text').text('Show Air Bases')
        .attr('x', padding+27)
        .attr('y', 2*padding+30)
		.attr('fill', 'white')
        .on("click", function() {
			if(!view_air_bases) {
				view_air_bases = true;
				plotAirBases();
				
			} else {
				view_air_bases = false;
				removeAirBases();
			
			}
    	})
		.on('mouseover', function(d){
			d3.select(this).style('cursor','hand');
		});


	//add air base data
	
    all_air_bases = [];
    air_base_data.forEach(function (d) {
        all_air_bases.push([d.longtitude, d.latitude, d.Name]);
    });
    projected_air_bases = all_air_bases.map(d => projection(d));
	

    function plotAirBases() {
        // adjust the background
        //states.attr('fill-opacity', 0.2);
        zoomZone.selectAll('none').data(projected_air_bases).enter()
				.append('polygon')
				.attr('points','100,10 40,198 190,78 10,78 160,198')
				.attr('transform',d=>'translate('+(d[0]-20)+','+(d[1]-22)+') scale(0.2)')
				.attr('fill','yellow')
        zoomZone.selectAll('none').data(projected_air_bases).enter()
            .append('circle')
			.attr('class', 'air_bases')
            .attr('fill', '#800000')
            .attr('cx', d => d[0])
            .attr('cy', d => d[1])
            .attr('r', 7)
            .attr('stroke', '#ffffcc')
            .attr('stroke-width', 0.1)
           // .attr('stroke-opacity', 0.1)
           // .attr('fill-opacity', '0.2');

        // allow zooming effect
        zoomZone.call(d3.zoom().on("zoom", function () {
            zoomZone.attr("transform", d3.event.transform)
        }));
    }

    function removeAirBases() {
      //  states.attr('fill-opacity', 1);
        zoomZone.selectAll('.air_bases').remove();
    }

    // hover

    states.on("mouseover", function (d) {
		if(pause == false){
			let selectedState = d.properties['NAME'];

			selectedStateData = aggregatedByState.find(function (element) {
				return element.key == selectedState;
			});
			// data not find
			if (!selectedStateData) {
				return;
			}

			d3.select(this).style('cursor','hand');
			plotSubTimePlot(selectedState, selectedStateData);
			plofSubShapePlot(selectedState, selectedStateData);
		}
    });

    // transition

    //add info section
    d3.selectAll('svg').append('g').attr('id', 'info_plot').attr('transform', "translate(" + (map_width + padding) + "," + upper_padding + ")")
    let timePlot = d3.selectAll('#info_plot').append('g').attr('id', 'subplot1').attr('transform', "translate(" + padding + "," + 0 + ")")

    d3.selectAll('#subplot1').append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)


    let shapePlot = d3.selectAll('#info_plot').append('g').attr('id', 'subplot2').attr('transform', "translate(" + padding + "," + (sub_info_height + sub_padding) + ")")
    d3.selectAll('#subplot2').append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)

    d3.selectAll('#info_plot').append('g').attr('id', 'subplot3').attr('transform', "translate(" + padding + "," + (2 * sub_info_height + 2 * sub_padding) + ")")
    d3.selectAll('#subplot3').append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)

	var pause = false
    // plot the sub plots
    states.on("click", function (d) {
        let selectedState = d.properties['NAME'];

		if(pause == false){
			pause = true
		}
		else{
			pause = false
		}		

        selectedStateData = aggregatedByState.find(function (element) {
            return element.key == selectedState;
        });
        // data not find
        if (!selectedStateData) {
            return;
        }

        plotSubTimePlot(selectedState, selectedStateData);
        plofSubShapePlot(selectedState, selectedStateData);
    });


    function plotSubTimePlot(selectedState, selectedStateData) {

        let selectedStateByTime = d3.nest().key(function (d) {
            return d.year;
        }).sortKeys(d3.ascending).rollup(function (leaves) {
            return leaves.length;
        }).entries(selectedStateData.values);

        let year_range = d3.extent(selectedStateByTime, function (d) {
            return parseInt(d.key);
        });
        let value_range = d3.extent(selectedStateByTime, function (d) {
            return d.value
        });

        // console.log(year_range);
        // year_range = []; can set year_range scale same here
        let x_scale = d3.scaleLinear().domain(year_range).range([0, sub_info_width]);
        let y_scale = d3.scaleLinear().domain(value_range).range([sub_info_height, 0]);

        // set up the line scale
        let line_scale = d3.line().x(d => x_scale(parseInt(d.key))).y(d => y_scale(d.value));

        // transition parameter
        let enter_transition = d3.transition().delay(0).duration(1000);
        let exit_transition = d3.transition().delay(0).duration(888);

        // data join
        let update_path = timePlot.selectAll('path').data(selectedStateByTime);
        // console.log(selectedStateByTime);

        // add new series
        update_path.enter().append('path')
            .attr('d', d => line_scale(selectedStateByTime))
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke', '#800026');
        // .attr('stroke', d => d.color); TODO add color by different states

        // remove old series
        update_path.remove();
        timePlot.selectAll(".scale").remove();

        timePlot.append('text').attr('class', 'scale')
            .text(selectedState)
            .attr("x", sub_info_width / 2)
            .attr("y", -10)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle");

        // add axes
        timePlot.append('g').attr('class', 'scale')
            .call(d3.axisLeft(y_scale))
            .append("text")
            .attr("x", 4)
            .attr("y", -6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");

        timePlot.append('g').attr('class', 'scale')
            .attr('transform', 'translate(' + 0 + ',' + (sub_info_height) + ')')
            .call(d3.axisBottom(x_scale).ticks(6, "d"))
            .append("text")
            .attr("x", sub_info_width + 4)
            .attr("y", 6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("year");

    }

    function plofSubShapePlot(selectedState, selectedStateData) {

        // notes the number of categories in bar chart
        let viewAmount = 6;
        let padding = 0.3;

        let selectedStateByShape = d3.nest().key(function (d) {
            return d.shape;
        }).rollup(function (leaves) {
            return leaves.length;
        }).entries(selectedStateData.values)
            .sort(function(a, b){ return d3.descending(a.value, b.value); });

        selectedStateByShape = selectedStateByShape.slice(0, viewAmount);

        // console.log(selectedStateByShape);

        // set up the axes
        let x = d3.scaleBand().domain(selectedStateByShape.map(d => d.key)).rangeRound([0, sub_info_width]).padding(padding),
            y = d3.scaleLinear().domain([0, d3.max(selectedStateByShape, d => d.value)]).rangeRound([sub_info_height, 0]);

        // draw the plot/rects
        let update = shapePlot.selectAll(".bar")
            .data(selectedStateByShape);


        update.enter().append("rect")
            .attr('class', 'bar')
            .attr("fill", "#800026")
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return sub_info_height - y(d.value);
            });
        // console.log(update);
        update.remove();
        shapePlot.selectAll(".scale").remove();


        shapePlot.append("g").attr('class', 'scale')
            .attr("transform", "translate(0," + sub_info_height + ")")
            // .style('font-size', 8)
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", sub_info_width + 4)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Shape");

        shapePlot.append("g").attr('class', 'scale')
            .call(d3.axisLeft(y))
            .append("text")
            .attr("x", 4)
            .attr('y', -6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");

    }


}

