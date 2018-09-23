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

	//Need to draw the 'strokes' prop. Two approaches: Use d3 commands and pass the DOM to render()
	//Define paths with React and render(), specify animation/interaction with d3. 
	componentDidMount() //React callbacks delimit d3 logic in most cases
	{
		this.setState(prevState => ({dashArray: this.path.current.getTotalLength(), dashOffset: this.path.current.getTotalLength()}));
	}

	render()
	{
		return(<path ref={this.path} fillOpacity={this.props.fillOpacity} strokeOpacity={this.props.strokeOpacity} 
				d={this.props.commands} strokeDasharray={this.state.dashArray} strokeDashoffset={this.state.dashOffset}/>);
	}	
}