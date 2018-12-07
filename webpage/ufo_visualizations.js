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

    // some colors used
    let lightYellowish = "#ffffcc";
    let darkReddish = "#800026";
    let orangish = "#FF6347";
    let coral = "#FF7F50";


    // aggregate the data
    let aggregatedByState = d3.nest().key(function (d) {
        return d.state;
    }).entries(ufo_data);

    //layout everything
    let all_svg = d3.selectAll('body').append('svg').attr('id', 'all_svg').attr('width', width).attr('height', height);

    let map_plot = d3.select('svg').append('g').attr('id', 'map_plot').attr('transform', "translate(" + padding + "," + upper_padding + ")");

    let left_svg = map_plot.append('svg').attr('id', 'left_svg').attr('height', map_height).attr('width', map_width);

    //add background
    let map_bg = left_svg
        .append('rect')
        .attr('id', 'map_bg')
        .attr('x', 0).attr('y', 0)
        .attr('height', map_height).attr('width', map_width)
        .attr('fill', 'lightblue').attr('fill-opacity', 0.5);

    let zoomZone = left_svg.append('g').attr('id', 'zoom_zone').attr('transform', "translate(" + 0 + "," + 0 + ")");
    let zoomZoneBg = zoomZone.append('rect').attr('id', 'zoom_zone_bg').attr('x', 0).attr('y', 0).attr('height', map_height).attr('width', map_width).attr('opacity', 0)

    //add info section
    all_svg.append('g').attr('id', 'info_plot').attr('transform', "translate(" + (map_width + padding) + "," + upper_padding + ")")

    let wrapperSubplot1 = d3.select('#info_plot').append('g').attr('id', 'subplot1').attr('transform', "translate(" + padding + "," + 0 + ")");
    // let timePlot = d3.selectAll('#info_plot').append('g').attr('id', 'subplot1').attr('transform', "translate(" + padding + "," + 0 + ")")

    let timePlot = wrapperSubplot1.append('g').attr('transform', "translate(" + padding + "," + padding + ")");
    let timeSVG = timePlot.append("svg")
        .attr("width", sub_info_width - 2 * padding)
        .attr("height", sub_info_height - 2 * padding);

    // let timePlotRect = timePlot.append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width -2 * padding).attr('height', sub_info_height - 2 * padding).attr('fill', 'blue').attr('opacity', opacity)

    wrapperSubplot1.append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)

    let wrapperSubplot2 = d3.select('#info_plot').append('g').attr('id', 'subplot2').attr('transform', "translate(" + padding + "," + (sub_info_height + sub_padding) + ")");
    let shapePlot = wrapperSubplot2.append('g').attr('transform', "translate(" + padding + "," + padding + ")");
    d3.selectAll('#subplot2').append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)

    let wrapperSubplot3 = d3.select('#info_plot').append('g').attr('id', 'subplot3').attr('transform', "translate(" + padding + "," + (2 * sub_info_height + 2 * sub_padding) + ")");
    let durationPlot = wrapperSubplot3.append('g').attr('transform', "translate(" + padding + "," + padding + ")");
    d3.selectAll('#subplot3').append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)


    // fill in contents in map section
    let projection = d3.geoAzimuthalEqualArea().rotate([90, 0]).fitSize([map_width, map_height], map_data);
    let geo_generator = d3.geoPath().projection(projection);

    // add background colors for the map
    let backgroundStates = zoomZone.selectAll(".bgstate")
        .data(map_data.features).enter().append("path").attr("class", "bgstate").attr("d", geo_generator)
        .style("fill", lightYellowish);


    //draw states and color states
    let dataAggregated = {}; // dataAggregated holds the value of the count

    let maxCount = 0;
    let states = zoomZone.selectAll(".state")
        .data(map_data.features).enter().append("path").attr("class", "state").attr("d", geo_generator)
        .style("fill", function (d) {
                let element = aggregatedByState.find(function (element) {
                    return element.key == d.properties['NAME']
                });
                let coef = 0;
                if (element) {
                    coef = element.values.length;
                    maxCount = Math.max(maxCount, coef);
                }
                dataAggregated[d.properties['NAME']] = coef;
                return d3.interpolate(lightYellowish, darkReddish)(coef / 4000);
            }
        );

    // allow zooming effect
    function zoomed() {
        zoomZone.attr("transform", d3.event.transform);
    }

    zoomZone.call(d3.zoom().on("zoom", zoomed));

    let zoom = d3.zoom().on("zoom", zoomed);

    //add ufo reports data points onto the map
    let all_reports = [];
    ufo_data.forEach(function (d) {
        all_reports.push([d.longtitude, d.latitude, d.year, d.shape, d.duration]);
    });
    let projected_reports = all_reports.map(d => [projection(d), d[2], d[3]]);


    let viewCircle = false;
    //add Show Reports button/Click effect

    createButton("Show Report Map", 1, function () {
        if (!viewCircle) {
            plotCircles();
            viewCircle = true;
        } else {
            removeCircles();
            viewCircle = false;
        }
    }, darkReddish);

    function plotCircles() {
        // adjust the background
        states.attr('fill-opacity', 0.2);
        let circles = zoomZone.selectAll('circle').data(projected_reports).enter()
            .append('circle')
            .attr('class', 'reports')
            .attr('cx', d => d[0][0])
            .attr('cy', d => d[0][1])
            .attr('r', 1.3)
            .attr('fill', darkReddish)
            .attr('stroke', '#ffffcc')
            .attr('stroke-width', 0.1)
            .attr('stroke-opacity', 0.1)
            .attr('fill-opacity', '0.2');

        link();

    }

    function removeCircles() {
        states.attr('fill-opacity', 1);
        zoomZone.selectAll('.reports').remove();

        left_svg.selectAll('.link').remove();
    }


    let view_air_bases = false;
    // add Show Air Base button/click effect
    createButton("Show Air Bases", 2, function () {
        if (!view_air_bases) {
            view_air_bases = true;
            plotAirBases();
        } else {
            view_air_bases = false;
            removeAirBases();
        }
    }, darkReddish);

    //add air base data

    let all_air_bases = [];
    air_base_data.forEach(function (d) {
        all_air_bases.push([d.longtitude, d.latitude, d.Name]);
    });
    let projected_air_bases = all_air_bases.map(d => projection(d));


    function plotAirBases() {
        // adjust the background
        //states.attr('fill-opacity', 0.2);
        zoomZone.selectAll('none').data(projected_air_bases).enter()
            .append('polygon')
            .attr('class', 'air_bases')
            .attr('points', '100,10 40,198 190,78 10,78 160,198')
            .attr('transform', d => 'translate(' + (d[0] - 20) + ',' + (d[1] - 22) + ') scale(0.2)')
            .attr('fill', 'yellow');
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

    }

    function removeAirBases() {
        //  states.attr('fill-opacity', 1);
        zoomZone.selectAll('.air_bases').remove();
    }

    createButton("Re-center", 3, recenter, orangish);

    function recenter() {
        zoomZone.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };


    // transition

    let pause = false;
    // plot the sub plots
    states.on("click", function (d) {
        let selectedState = d.properties['NAME'];

        if (pause == false) {
            pause = true
        }

        selectedStateData = aggregatedByState.find(function (element) {
            return element.key == selectedState;
        });
        // data not find
        if (!selectedStateData) {
            return;
        }
        // disallow clicking the state that is already in display
        if (selectedStateName.find(e => e === selectedState)) {
            return;
        }

        plotSubTimePlot(selectedState, selectedStateData);
        plotSubShapePlot(selectedState, selectedStateData);
        plotDurationPlot(selectedState, selectedStateData);
    });

    function plotSubTimePlotHover(selectedState, selectedStateData) {
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
        let x_scale = d3.scaleLinear().domain(year_range).range([0, sub_info_width - 2 * padding]);
        let y_scale = d3.scaleLinear().domain(value_range).range([sub_info_height - 2 * padding, 0]);

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
            .attr('stroke', orangish)
        // .attr('stroke', d => d.color); TODO add color by different states

        // remove old series
        update_path.remove();
        timePlot.selectAll(".scale").remove();

        timePlot.append('text').attr('class', 'scale')
            .text(selectedState)
            .attr("x", (sub_info_width - 2 * padding) / 2)
            .attr("y", -10)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle");

        // add axes
        timePlot.append('g').attr('class', 'scale')
            .call(d3.axisLeft(y_scale).ticks(4))
            .append("text")
            .attr("x", -padding)
            .attr('y', -6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");

        timePlot.append('g').attr('class', 'scale')
            .attr('transform', 'translate(' + 0 + ',' + (sub_info_height - 2 * padding) + ')')
            .call(d3.axisBottom(x_scale).ticks(3, "d"))
            .append("text")
            .attr("x", sub_info_width - 2 * padding + 4)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Year");
    }


    let TimePlotData = [];
    let selectedStateName = [];
    let shapePlotData = [];
    let durationPlotData = [];
    let MAX_STATE = 3;

    function plotSubTimePlot(selectedState, selectedStateData) {

        let selectedStateByTime = d3.nest().key(function (d) {
            return d.year;
        }).sortKeys(d3.ascending).rollup(function (leaves) {
            return leaves.length;
        }).entries(selectedStateData.values);

        // timePlot.remove();
        // make sure different from last one

        // can only have this part but without limitation of MAX_STATE number
        TimePlotData.push(selectedStateByTime);
        selectedStateName.push(selectedState);

        if (TimePlotData.length > MAX_STATE) {
            TimePlotData = TimePlotData.slice(1);
            selectedStateName = selectedStateName.slice(1);
        }


        let yearRange = [], valueRange = [];
        TimePlotData.forEach(each => {
            let curTimeRange = d3.extent(each, function (d) {
                return parseInt(d.key);
            });
            let curValRange = d3.extent(each, function (d) {
                return parseInt(d.value);
            });
            yearRange.push(curTimeRange);
            valueRange.push(curValRange);
        });
        let finalYearRange = [d3.min(yearRange, function (d) {
            return d[0];
        }), d3.max(yearRange, function (d) {
            return d[1];
        })];
        let finalValRange = [d3.min(valueRange, function (d) {
            return d[0];
        }), d3.max(valueRange, function (d) {
            return d[1];
        })];

        timePlot.selectAll('path').remove();
        left_svg.selectAll('.legendTime').remove();


        // year_range = []; can set year_range scale same here
        let x_scale = d3.scaleLinear().domain(finalYearRange).range([0, sub_info_width - 2 * padding]);
        let y_scale = d3.scaleLinear().domain(finalValRange).range([sub_info_height - 2 * padding, 0]);

        // set up the line scale
        let line_scale = d3.line().x(d => x_scale(parseInt(d.key))).y(d => y_scale(d.value));

        // data join
        let update_path = timeSVG.selectAll('path').data(TimePlotData);
        // console.log(selectedStateByTime);

        // add new series
        update_path.enter().append('path')
            .attr('d', d => line_scale(d))
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('class', 'timeLine')
            // .attr('stroke', orangish)
            .attr('stroke', (d, i) => d3.schemeCategory10[i % 10]);

        // remove old series
        // update_path.remove();
        timePlot.selectAll(".scale").remove();

        let y_axis = d3.axisLeft(y_scale);
        let x_axis = d3.axisBottom(x_scale);

        let y_drawed_axis = timePlot.append('g').attr('class', 'scale')
            .call(y_axis.ticks(4));
        y_drawed_axis.append("text")
            .attr("x", -padding)
            .attr('y', -6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");

        let x_drawed_axis = timePlot.append('g').attr('class', 'scale')
            .attr('transform', 'translate(' + 0 + ',' + (sub_info_height - 2 * padding) + ')')
            .call(x_axis.ticks(3, "d"));
        x_drawed_axis.append("text")
            .attr("x", sub_info_width - 2 * padding + 4)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Year");

        // enable zooming
        // Zoom Function
        let zoomSubTimePlot = d3.zoom()
            .on("zoom", zoomFunction);


        wrapperSubplot1.call(zoomSubTimePlot);

        function zoomFunction() {
            // create new scale ojects based on event
            let new_xScale = d3.event.transform.rescaleX(x_scale);
            let new_yScale = d3.event.transform.rescaleY(y_scale);

            // update axes
            x_drawed_axis.call(x_axis.scale(new_xScale));
            y_drawed_axis.call(y_axis.scale(new_yScale));

            // update path
            timeSVG.selectAll('.timeLine').attr("transform", d3.event.transform);
        };

        // add legend
        let colorDataLegend = d3.schemeCategory10.slice(0, selectedStateName.length);
        let color_scale_legend_timePlot = d3.scaleOrdinal()
            .range(colorDataLegend) // purple ish color
            .domain(selectedStateName);

        // draw the legend
        let legendTimePlot = left_svg.append("g")
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(selectedStateName)
            .enter().append("g")
            .attr("transform", (d, i) => "translate(0," + i * 20 + ")")
            .attr('class', 'legendTime');

        left_svg.append('text')
            .attr('y', 2 * padding + 9.5 - 20)
            .attr("x", map_width - 24 - 1.5 * padding)
            .attr("text-anchor", "end")
            .attr("dy", "0.32em")
            .text("State Name")
            .attr('font-weight', 'bold')
            .attr('class', 'legendTime');

        // set up the remark of color and corresponding count
        legendTimePlot.append("rect")
            .attr('y', 2 * padding)
            .attr("x", map_width - 19 - 1.5 * padding)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color_scale_legend_timePlot);

        legendTimePlot.append("text")
            .attr('y', 2 * padding + 9.5)
            .attr("x", map_width - 24 - 1.5 * padding)
            .attr("dy", "0.32em")
            .text(d => (d));
    }

    // variables for bar chart
    let viewAmount = 4;
    let bar_padding = 0.2;

    function plotSubShapePlotHover(selectedState, selectedStateData) {

        // notes the number of categories in bar chart

        let selectedStateByShape = d3.nest().key(function (d) {
            return d.shape;
        }).rollup(function (leaves) {
            return leaves.length;
        }).entries(selectedStateData.values)
            .sort(function (a, b) {
                return d3.descending(a.value, b.value);
            });

        selectedStateByShape = selectedStateByShape.slice(0, viewAmount);

        // console.log(selectedStateByShape);

        // set up the axes
        let x = d3.scaleBand().domain(selectedStateByShape.map(d => d.key)).rangeRound([0, sub_info_width - 2 * padding]).padding(bar_padding),
            y = d3.scaleLinear().domain([0, d3.max(selectedStateByShape, d => d.value)]).rangeRound([sub_info_height - 2 * padding, 0]);

        shapePlot.selectAll('.bar').remove();

        // draw the plot/rects
        let update = shapePlot.selectAll(".bar")
            .data(selectedStateByShape);

        let bars = update.enter().append("rect")
            .attr('class', 'bar')
            .attr("fill", orangish)
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return (sub_info_height - 2 * padding) - y(d.value);
            });
        // console.log(update);
        // update.remove();

        shapePlot.selectAll(".scale").remove();


        shapePlot.append("g").attr('class', 'scale')
            .attr("transform", "translate(0," + (sub_info_height - 2 * padding) + ")")
            // .style('font-size', 8)
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", sub_info_width - 2 * padding + 2)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Shape");

        shapePlot.append("g").attr('class', 'scale')
            .call(d3.axisLeft(y).ticks(5))
            .append("text")
            .attr("x", -padding)
            .attr('y', -6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");

        shapePlot.append('text').attr('class', 'scale')
            .text(selectedState)
            .attr("x", (sub_info_width - 2 * padding) / 2)
            .attr("y", -10)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle");

    }

    function plotSubShapePlot(selectedState, selectedStateData) {

        shapePlotData.push(selectedStateData);

        if (shapePlotData.length > MAX_STATE) {
            shapePlotData = shapePlotData.slice(1);
        }

        let nestedDataSource = [];
        for (let i = 0; i < shapePlotData.length; ++i) {
            nestedDataSource = nestedDataSource.concat(shapePlotData[i].values);
        }
        // selectedStateByShape = selectedStateByShape.slice(0, viewAmount);

        let nestedData = d3.nest().key(function (d) {
            return d.shape
        }).key(function (d) {
            return d.state;
        }).rollup(function (leaves) {
                return {"length": leaves.length}
            }
        ).entries(nestedDataSource);

        nestedData.forEach(each => {
            let total = 0;
            each.values.forEach(eachValue => {
                total += eachValue.value.length;
                each[eachValue.key] = eachValue.value.length;
            });
            each.total = total;
        });
        nestedData.sort(function (a, b) {
            return b.total - a.total;
        });

        nestedData = nestedData.slice(0, viewAmount);

        shapePlot.selectAll('.bar').remove();
        shapePlot.selectAll('.scale').remove();

        // set up scales and axes
        let x = d3.scaleBand()
            .rangeRound([0, sub_info_width - 2 * padding])
            .padding(bar_padding)
            // .paddingInner(0.08).paddingOuter(0.3)
            // .align(0.1)
            .domain(nestedData.map(d => d.key));

        let y = d3.scaleLinear()
            .rangeRound([sub_info_height - 2 * padding, 0])
            .domain([0, d3.max(nestedData, d => d.total)]).nice();

        // draw the stacked bars
        shapePlot.append("g")
            .selectAll("g")
            .data(d3.stack().keys(selectedStateName)(nestedData))
            .enter().append("g")
            .attr("fill", (d, i) => d3.schemeCategory10[i])
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("x", d => x(d.data.key))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .attr('class', 'bar');

        shapePlot.append("g").attr('class', 'scale')
            .attr("transform", "translate(0," + (sub_info_height - 2 * padding) + ")")
            // .style('font-size', 8)
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", sub_info_width - 2 * padding + 2)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Shape");

        shapePlot.append("g").attr('class', 'scale')
            .call(d3.axisLeft(y).ticks(5))
            .append("text")
            .attr("x", -padding)
            .attr('y', -6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");

    }

    let viewAmountDur = 3;

    function plotDurationPlotHover(selectedState, selectedStateData) {
        let selectedStateByDuration = d3.nest().key(function (d) {
            return d.duration;
        }).rollup(function (leaves) {
            return leaves.length;
        }).entries(selectedStateData.values);

        let durationRange = d3.extent(selectedStateByDuration, function (d) {
            return d.value;
        });

        let amount = durationRange[1] / (viewAmountDur);

        // assume viewAmount is 3
        let durationGroup = [];
        for (let i = 1; i < viewAmountDur; ++i) {
            durationGroup.push(parseInt(amount * i, 10));
        }
        // console.log(durationGroup);

        let bars_scale = d3.scaleThreshold()
            .domain(durationGroup)
            .range(["first", "second", "third"]);

        dataByDuration = {"first": 0, "second": 0, "third": 0};
        selectedStateByDuration.forEach(d => {
            dataByDuration[bars_scale(d.key)] += d.value;
        });
        let firstKey = 0 + "-" + durationGroup[0];
        let secondKey = durationGroup[0] + "-" + durationGroup[1];
        let thirdKey = durationGroup[1] + "-" + durationRange[1];
        let dataFinal = [{key: firstKey, value: dataByDuration.first}, {
            key: secondKey,
            value: dataByDuration.second
        }, {key: thirdKey, value: dataByDuration.third}];

        // console.log(dataByDuration);
        // console.log(dataFinal);

        // set up the axes
        let x = d3.scaleBand().domain(dataFinal.map(d => d.key)).rangeRound([0, sub_info_width - 2 * padding]).padding(bar_padding),
            y = d3.scaleLinear().domain([0, d3.max(dataFinal, d => d.value)]).rangeRound([sub_info_height - 2 * padding, 0]);

        durationPlot.selectAll('.bar').remove();

        // // draw the plot/rects
        let update = durationPlot.selectAll(".bar")
            .data(dataFinal);

        update.enter().append("rect")
            .attr('class', 'bar')
            .attr("fill", orangish)
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return (sub_info_height - 2 * padding) - y(d.value);
            });
        // // console.log(update);
        // // update.remove();

        durationPlot.selectAll(".scale").remove();


        durationPlot.append("g").attr('class', 'scale')
            .attr("transform", "translate(0," + (sub_info_height - 2 * padding) + ")")
            // .style('font-size', 8)
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", sub_info_width - 2 * padding + 2)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Duration(s)");

        durationPlot.append("g").attr('class', 'scale')
            .call(d3.axisLeft(y).ticks(5))
            .append("text")
            .attr("x", -padding)
            .attr('y', -6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");

        durationPlot.append('text').attr('class', 'scale')
            .text(selectedState)
            .attr("x", (sub_info_width - 2 * padding) / 2)
            .attr("y", -10)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle");


    }

    function plotDurationPlot(selectedState, selectedStateData) {

        durationPlotData.push(selectedStateData);

        if (durationPlotData.length > MAX_STATE) {
            durationPlotData = durationPlotData.slice(1);
        }

        let valueRange = [];
        durationPlotData.forEach(each => {
            let curValRange = d3.extent(each.values, function (d) {
                return d.duration;
            });
            valueRange.push(curValRange);
        });

        let finalValRange = [d3.min(valueRange, function (d) {
            return d[0];
        }), d3.max(valueRange, function (d) {
            return d[1];
        })];

        let nestedDataSourceDur = [];
        for (let i = 0; i < durationPlotData.length; ++i) {
            nestedDataSourceDur = nestedDataSourceDur.concat(durationPlotData[i].values);
        }

        let maxDur = finalValRange[1];

        let amount = maxDur / (viewAmountDur);

        let durationGroup = [];
        for (let i = 1; i < viewAmountDur; ++i) {
            durationGroup.push(parseInt(amount * i, 10));
        }

        let firstKey = 0 + "-" + durationGroup[0];
        let secondKey = durationGroup[0] + "-" + durationGroup[1];
        let thirdKey = durationGroup[1] + "-" + maxDur;

        let bars_scale = d3.scaleThreshold()
            .domain(durationGroup)
            .range([firstKey, secondKey, thirdKey]);


        let nestedDataDur = d3.nest().key(function (d) {
            return bars_scale(d.duration);
        }).key(function (d) {
            return d.state;
        }).rollup(function (leaves) {
                return {"length": leaves.length}
            }
        ).entries(nestedDataSourceDur);

        nestedDataDur.forEach(each => {
            let total = 0;
            each.values.forEach(eachValue => {
                total += eachValue.value.length;
                each[eachValue.key] = eachValue.value.length;
            });
            each.total = total;
        });

        console.log(nestedDataDur);


        nestedDataDur.sort(function (a, b) {
            if (a.key === firstKey) {
                return 1;
            }
            if (a.key === secondKey) {
                return 2;
            }
            return 3;
        });

        durationPlot.selectAll('.bar').remove();
        durationPlot.selectAll('.scale').remove();

        // set up scales and axes
        let x = d3.scaleBand()
            .rangeRound([0, sub_info_width - 2 * padding])
            .padding(bar_padding)
            // .paddingInner(0.08).paddingOuter(0.3)
            // .align(0.1)
            .domain(nestedDataDur.map(d => d.key));

        let y = d3.scaleLinear()
            .rangeRound([sub_info_height - 2 * padding, 0])
            .domain([0, d3.max(nestedDataDur, d => d.total)]).nice();

        // draw the stacked bars
        durationPlot.append("g")
            .selectAll("g")
            .data(d3.stack().keys(selectedStateName)(nestedDataDur))
            .enter().append("g")
            .attr("fill", (d, i) => d3.schemeCategory10[i])
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("x", d => x(d.data.key))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .attr('class', 'bar');

        durationPlot.append("g").attr('class', 'scale')
            .attr("transform", "translate(0," + (sub_info_height - 2 * padding) + ")")
            // .style('font-size', 8)
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", sub_info_width - 2 * padding + 2)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Duration(s)");

        durationPlot.append("g").attr('class', 'scale')
            .call(d3.axisLeft(y).ticks(5))
            .append("text")
            .attr("x", -padding)
            .attr('y', -6)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");

    }


    function tooltipHtml(name, stateCount) {    /* function to create html content string in tooltip div. */
        return "<h4>" + name + "</h4><table>" +
            "<tr><td>Count</td><td>" + stateCount + "</td></tr>" +
            "</table>";
    }

    drawLegend();
    d3.selectAll('body').append('div').attr('id', 'tooltip'); // div to hold tooltip

    function drawLegend() {
        function mouseOver(d) {
            // console.log(dataAggregated[d.properties.NAME]);
            d3.select("#tooltip").transition().duration(200).style("opacity", .9);
            let stateName = d.properties.NAME;
            d3.select("#tooltip").html(tooltipHtml(stateName, dataAggregated[stateName]))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }

        function mouseOut() {
            d3.select("#tooltip").transition().duration(500).style("opacity", 0);
        }

        // hover and legend
        states.on("mouseover", function (d) {
            mouseOver(d);
            if (pause === false) {
                let selectedState = d.properties['NAME'];

                selectedStateData = aggregatedByState.find(function (element) {
                    return element.key == selectedState;
                });
                // data not find
                if (!selectedStateData) {
                    return;
                }

                // d3.select(this).style('cursor', 'hand');
                plotSubTimePlotHover(selectedState, selectedStateData);
                plotSubShapePlotHover(selectedState, selectedStateData);
                plotDurationPlotHover(selectedState, selectedStateData);
            }

        }).on("mouseout", mouseOut);
    }

    createButton("Reset Subplot", 4, function () {
        TimePlotData = [];
        shapePlotData = [];
        selectedStateName = [];
        pause = false;
        timePlot.selectAll('.timeLine').remove();
        timePlot.selectAll('.scale').remove();
        shapePlot.selectAll('.bar').remove();
        shapePlot.selectAll('.scale').remove();
        durationPlot.selectAll('.bar').remove();
        durationPlot.selectAll('.scale').remove();
        left_svg.selectAll('.legendTime').remove();

    }, orangish);

    let darkmagenta = "#8B008B";
    let peach = "#FFDAB9";
    let lightPeach = "#FFEFD5";

    function link() {
        // link shape / year with dots button
        //re-center button
        createButton("Light", 5, function () {
                filterCircleByShape("light", darkmagenta)
            }
            , peach,darkReddish, true);

        createButton("Triangle", 6, function () {
                filterCircleByShape("triangle", darkmagenta)
            }
            , peach,darkReddish, true);

        createButton("Circle", 7, function () {
                filterCircleByShape("circle", darkmagenta)
            }
            , peach,darkReddish, true);

        createButton("1910 - 1980", 8, function () {
            filterCircleByTime(1910, 1990)
        }, lightPeach,darkReddish, true);
        createButton("1981 - 2005", 9, function () {
            filterCircleByTime(1991, 2007)
        }, lightPeach,darkReddish, true);
        createButton("2006 - 2014", 10, function () {
            filterCircleByTime(2008, 2014)
        }, lightPeach,darkReddish, true);

        createButton("Reset Coloring", 11, resetColoring, "#FFE4B5", darkReddish, true);

    }


    function filterCircleByShape(name, color) {
        zoomZone.selectAll('.reports')
            .attr('fill-opacity', 0.1)
            .attr('fill', lightYellowish);
        let selectedCircles = zoomZone.selectAll('.reports').filter(function (d, i) {
            return d[2] === name;
        }).attr('fill-opacity', 0.6)
            .attr('fill', color);
    }

    function filterCircleByTime(firstYear, SecondYear, color) {
        zoomZone.selectAll('.reports')
            .attr('fill-opacity', 0.1)
            .attr('fill', lightYellowish);
        let selectedCircles = zoomZone.selectAll('.reports').filter(function (d, i) {
            return d[1] <= SecondYear && d[1] >= firstYear;
        }).attr('fill-opacity', 0.4)
            .attr('fill', darkmagenta);
    }

    // reset coloring
    function resetColoring() {
        zoomZone.selectAll('circle')
            .attr('fill-opacity', 0.2)
            .attr('fill', "#800000")
        // .attr('stroke', '#ffffcc')
        // .attr('stroke-width', 0.1)
        // .attr('stroke-opacity', 0.1)
    }

    function createButton(name, index, onClick, color, textColor, link) {
        left_svg.append('rect')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('x', padding + 10)
            .attr('y', index * padding + (index - 1) * 10)
            .attr('height', 30)
            .attr('width', 150)
            .attr('fill', color)
            .attr('class', 'detailedButton')
            .attr('class', link ? 'link' : "notLinked")
            // .attr('class', 'fade-in')
            .style('cursor', "pointer")
            .on("click", onClick);

        left_svg.append('text').text(name)
            .attr('x', padding * 3 + 25)
            .attr('y', index * padding + (index - 1) * 10 + 20)
            .attr('fill', textColor ? textColor : "white")
            .attr("text-anchor", "middle")
            .attr('class', 'detailedButton')
            .style('cursor', "pointer")
            .attr('class', link ? 'link' : "")
            .on("click", onClick);
    }

    let textDataLegend = [0, maxCount / 16, maxCount / 8, maxCount / 4, maxCount / 2, maxCount];
    let colorDataLegend = textDataLegend.map(each => {
        return d3.interpolate(lightYellowish, darkReddish)(each / 4000);
    });
    let color_scale_legend = d3.scaleOrdinal()
        .range(colorDataLegend) // purple ish color
        .domain(textDataLegend);

    // draw the legend
    let legend = left_svg.append("g")
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(textDataLegend)
        .enter().append("g")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    left_svg.append('text')
        .attr('y', map_height - 5 * padding + 9.5 - 20)
        .attr("x", map_width - 24 - 1.5 * padding)
        .attr("text-anchor", "end")
        .attr("dy", "0.32em")
        .attr('font-weight', 'bold')
        .text("Count");

    // set up the remark of color and corresponding count
    legend.append("rect")
        .attr('y', map_height - 5 * padding)
        .attr("x", map_width - 19 - 1.5 * padding)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color_scale_legend);

    legend.append("text")
        .attr('y', map_height - 5 * padding + 9.5)
        .attr("x", map_width - 24 - 1.5 * padding)
        .attr("dy", "0.32em")
        .text(d => (d));
}

