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
    let padding = 30;
    let opacity = 0.1;

    let map_width = 960;
    let map_height = 600;

    let sub_info_width = 200;
    let sub_info_height = 200;

    // aggregate the data
    let aggregatedByState = d3.nest().key(function (d) {
        return d.state;
    }).entries(ufo_data);


    d3.selectAll('body').append('svg').attr('width', width).attr('height', height);
    //add map section
    //map_data.features = map_data.features.filter(d => d.properties.STATAE=='037'); 
    projection = d3.geoAzimuthalEqualArea().rotate([90, 0]).fitSize([map_width, map_height], map_data);
    geo_generator = d3.geoPath().projection(projection);

    let mapPlot = d3.select('svg').append('g').attr('id', 'map_plot').attr('transform', "translate(" + padding + "," + padding + ")");

    //draw states and color states
    let states = mapPlot.selectAll(".state")
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



    plotCircles();

    function plotCircles() {
        // adjust the background
        states.attr('fill-opacity', 0.2);
        mapPlot.selectAll('circle').data(projected_reports).enter()
            .append('circle')
            .attr('fill', '#800000')
            .attr('cx', d => d[0])
            .attr('cy', d => d[1])
            .attr('r', 1.3)
            .attr('stroke', '#ffffcc')
            .attr('stroke-width', 0.1)
            .attr('stroke-opacity', 0.1)
            .attr('fill-opacity', '0.2');
    }

    function removeCircles() {
        states.attr('fill-opacity', 1);
        mapPlot.selectAll('circle').remove();
    }


    // hover
    // transition

    //add info section
    d3.selectAll('svg').append('g').attr('id', 'info_plot').attr('transform', "translate(" + (map_width + padding) + "," + padding + ")")
    let timePlot = d3.selectAll('#info_plot').append('g').attr('id', 'subplot1').attr('transform', "translate(" + padding + "," + padding + ")")

    d3.selectAll('#subplot1').append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)


    d3.selectAll('#info_plot').append('g').attr('id', 'subplot2').attr('transform', "translate(" + padding + "," + (sub_info_height + 2 * padding) + ")")
    d3.selectAll('#subplot2').append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)

    d3.selectAll('#info_plot').append('g').attr('id', 'subplot3').attr('transform', "translate(" + padding + "," + (2 * sub_info_height + 3 * padding) + ")")
    d3.selectAll('#subplot3').append('rect').attr('x', 0).attr('y', 0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill', 'blue').attr('opacity', opacity)


    // plot the sub plots
    states.on("click", function (d) {
        let selectedState = d.properties['NAME'];
        plotSubTimePlot(selectedState);
    });


    function plotSubTimePlot(selectedState) {

        selectedStateData = aggregatedByState.find(function (element) {
            return element.key == selectedState;
        });
        // data not find
        if (!selectedStateData) {
            return;
        }

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
            .attr("x", sub_info_width/2)
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



}

