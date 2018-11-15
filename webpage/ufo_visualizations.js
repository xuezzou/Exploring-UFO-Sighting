/*
References:
1. d3 map: http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922


*/


function plot_it() {

    width = 2000;
    height = 1000;
    padding = 30;
    opacity = 0.1;

    map_width = 960;
    map_height = 600;

    sub_info_width = 200;
    sub_info_height = 200;

    // aggregate the data
    aggregatedByState = d3.nest().key(function (d) {
        return d.state;
    }).entries(ufo_data);

    console.log(aggregatedByState);

    d3.selectAll('body').append('svg').attr('width', width).attr('height', height)
    //add map section
    d3.select('svg').append('g').attr('id', 'map_plot').attr('transform', "translate(" + padding + "," + padding + ")")
    let states = d3.selectAll('#map_plot').selectAll(".state")
        .data(uStatePaths).enter().append("path").attr("class", "state").attr("d", function (d) {
            return d.d;
        }).style("fill", function (d) {
                let element = aggregatedByState.find(function (element) {
                    return element.key == d.id.toLowerCase()
                });
                let coef = 0;
                if (element) {
                    coef = element.values.length;
                }
                return d3.interpolate("#ffffcc", "#800026")(coef / 4000);
            }
        );


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

        let selectedState = d.id.toLowerCase();
        plotSubTimePlot(selectedState);
    });


    function plotSubTimePlot(selectedState) {
        // let min_line_y = d3.min(all_count_data), max_line_y = d3.max(all_count_data);
        // let min_year = d3.min(aggregatedByState.values.year), max_dates = count_tree.counts[count_tree.counts.length - 1].date;


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

        console.log(year_range);
        let x_scale = d3.scaleLinear().domain(year_range).range([0, sub_info_width]);
        let y_scale = d3.scaleLinear().domain(value_range).range([0, sub_info_height]);

        // set up the line scale
        let line_scale = d3.line().x(d => x_scale(parseInt(d.key))).y(d => sub_info_height - y_scale(d.value));

        // transition parameter
        let enter_transition = d3.transition().delay(500).duration(888);
        // let exit_transition = d3.transition().delay(0).duration(888);

        // data join
        let update_path = timePlot.selectAll('path').data(selectedStateByTime);
        console.log(selectedStateByTime);

        // add new series
        update_path.enter().append('path')
            //.transition(enter_transition)
            .attr('d', d => line_scale(selectedStateByTime))
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke', '#800026')
        // .attr('stroke', d => d.color);

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

