import React, { Component } from 'react';
import * as d3 from 'd3';
import Stroke from './Stroke'
import {strokeInterpret} from './orthographer'

export default class Glyph extends Component
{
	constructor(props)
	{
		super(props);
	}

	//Need to draw the 'strokes' prop. Two approaches: Use d3 commands and pass the DOM to render()
	//Define paths with React and render(), specify animation/interaction with d3. 

	render()	//render a list of strokes in the glyph. May need d3 for nice animations
	{
		const strokes = this.props.strokes;
		return(<g transform={this.props.transform}>
				<rect x={0} y={0} width={this.props.boxScale} height={this.props.boxScale} style={{fill: this.props.color}}/>
				{strokes.map((stroke, i) =>
					//{beware of curly braces in map expressions
						<Stroke key={i} commands={strokeInterpret(stroke.contours, this.props.xScale, this.props.yScale)} />
					//}you need to explicitly specify a return value if you use them
				)}
            </g>);
	}	
}