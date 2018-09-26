import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Slider extends Component
{
	constructor(props)
	{
		super(props)
	}

	render()
	{
		return(
			<g>
				<line x1={this.props.x} y1={this.props.y} x2={this.props.x+this.props.width} y2={this.props.y}/>
				<circle cx={this.props.x} cy={this.props.y} r={1}/>
			</g>
			);
	}
}