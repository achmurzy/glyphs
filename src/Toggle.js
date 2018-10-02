import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Toggle extends Component
{
	constructor(props)
	{
		super(props)
		this.toggle = React.createRef();
	}

	componentDidMount()
	{
		var _this = this;
		d3.select(this.toggle.current).select("rect")
        .on("click", function(d)
          {
            _this.editFunction();
          });
	}

	render()
	{
		return(
			<g ref={this.toggle}>
				<text x={this.props.x+2} y={this.props.y-2} style={{font: "12px sans-serif"}}>{this.props.name}</text>
				<rect x={this.props.x} y={this.props.y} width={20} height={20} 
					style={{fill: this.props.toggle ? "green" : "red"}}/>
			</g>
			);
	}

    editFunction = function()
    {
    	console.log(this.props.toggle);
    	this.props.valueFunction(!this.props.toggle);
    }
}