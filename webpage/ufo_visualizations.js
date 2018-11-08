/*
References:
1. d3 map: http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922


*/

function plot_it()  {
		width = 2000
		height = 1000
		padding = 30
		opacity = 0.1

		map_width = 960
		map_height = 600	

		sub_info_width = 200
		sub_info_height = 200		

		d3.selectAll('body').append('svg').attr('width', width).attr('height', height)
//add map section
		d3.select('svg').append('g').attr('id','map_plot').attr('transform',"translate("+padding+","+padding+")")
		d3.selectAll('#map_plot').selectAll(".state")
			.data(uStatePaths).enter().append("path").attr("class","state").attr("d",function(d){ return d.d;})
//			.style("fill",function(d){ return data[d.id].color; })

//add info section
		d3.selectAll('svg').append('g').attr('id','info_plot').attr('transform',"translate("+(map_width+padding)+","+padding+")")
		d3.selectAll('#info_plot').append('g').attr('id','subplot1').attr('transform',"translate("+padding+","+padding+")")
		d3.selectAll('#subplot1').append('rect').attr('x',0).attr('y',0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill','blue').attr('opacity', opacity)

		d3.selectAll('#info_plot').append('g').attr('id','subplot2').attr('transform',"translate("+padding+","+(sub_info_height+2*padding)+")")
		d3.selectAll('#subplot2').append('rect').attr('x',0).attr('y',0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill','blue').attr('opacity', opacity)

		d3.selectAll('#info_plot').append('g').attr('id','subplot3').attr('transform',"translate("+padding+","+(2*sub_info_height+3*padding)+")")
		d3.selectAll('#subplot3').append('rect').attr('x',0).attr('y',0).attr('width', sub_info_width).attr('height', sub_info_height).attr('fill','blue').attr('opacity', opacity)
}
