import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Slider extends Component
{
	constructor(props)
	{
		super(props)
		this.slider = React.createRef();
		this.scaleParam = d3.scaleLinear().domain([this.props.x, this.props.x+this.props.width]).range([this.props.min, this.props.max]);
		this.state =
		{
			value: this.props.min,
		}
	}

	componentDidMount()
	{
		var _this = this;
		d3.select(this.slider.current).select("circle")
        .call(d3.drag().on("drag", function(d, i)
        {
        	if(d3.event.x >= _this.props.x && d3.event.x <= (_this.props.x+_this.props.width))
          		_this.dragFunction(this, d3.event, i, _this.props.xScale, _this.props.yScale);
        }))
        .on("click", function(d)
          {
            _this.editFunction();
          });
	}

	render()
	{
		return(
			<g ref={this.slider}>
				<text x={this.props.x+2} y={this.props.y-2} style={{font: "12px sans-serif"}}>{this.props.name}</text>
				<line x1={this.props.x} y1={this.props.y} x2={this.props.x+this.props.width} y2={this.props.y}
				style={{stroke: "black", strokeWidth: 1}}/>
				<circle cx={this.props.x} cy={this.props.y} r={5}/>
				<text x={this.props.x+this.props.width+10} y={this.props.y-2} style={{font: "12px sans-serif"}}>{this.state.value.toPrecision(3)}</text>
			</g>
			);
	}

	dragFunction = function(element, event)
	{
		var selection = d3.select(element);
		selection.attr("cx", event.x);
		this.setState({value: this.scaleParam(event.x)}); 
		this.props.valueFunction(this.state.value);

	}

    editFunction = function()
    {
      if(d3.event.defaultPrevented)   
      {
        return;  
      }
    }
}