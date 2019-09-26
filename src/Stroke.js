import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Stroke extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			dashArray: 0,
			dashOffset: 0,

		}
		this.path = React.createRef();		
	}

	componentDidMount() //React callbacks delimit d3 logic in most cases
	{
		this.setState(prevState => ({dashArray: this.path.current.getTotalLength(), dashOffset: this.path.current.getTotalLength()}));
	}

	componentDidUpdate()
	{
		var _this = this;
		d3.select(this.path.current)
			.transition()
				.duration(this.props.drawSpeed)
				.delay(function(d, i) { return _this.props.drawSpeed * i; })
		          .ease(d3.easeLinear)
		          .style("fill", this.props.clockwise ? this.props.color : "none")
		          .style("fill-opacity", 1 )
		          .style("stroke", "gray")
		          .style("stroke-weight", 0.1)
		          .style("stroke-opacity", 0.1)
		          .style("stroke-dashoffset", function(d) 
		          { return 0+"px"; })
		          .on("end", function() { d3.select(this).attr("class", "drawn"); });
	}
			//To render paths as if they are fonts using SVG's fill-rule property, we must ultimately concatenate every path into one 'd' field for even-odd winding rules to take effect.
			//Unfortunately for React and d3, we are forced to throw away our data's hierarchical structure, thereby making it harder to interact with the underlying data values
	render()
	{
		return(<path ref={this.path} fillOpacity={this.props.fillOpacity} strokeOpacity={this.props.strokeOpacity} 
				d={this.props.commands} strokeDasharray={this.state.dashArray} strokeDashoffset={this.state.dashOffset}/>);
	}	
}