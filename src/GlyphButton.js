import React, { Component } from 'react';
import * as d3 from 'd3';

//A component that uses SVG geometry to make a button
//REACTSTRAP CANNOT RENDER INSIDE AN SVG CANVAS!!!!!!!!!!!!!!!!!
export default class GlyphButton extends Component
{
	constructor(props)
	{
		super(props)
		this.button = React.createRef();
	}

	componentDidMount()
	{
		var _this = this;
		d3.select(this.button.current).select("rect")
        .on("click", function(d)
          {
            _this.editFunction();
          });
	}

	render()
	{
		return(
		    <g ref={this.button} transform={"translate("+(this.props.x)+","+(this.props.y)+")"}>
		          		<rect x={0} y={0} width={this.props.boxScale} height={this.props.boxScale/4}
		          				style={{fill: "gray"}}/>
		          		<line x1={3*this.props.boxScale/4} y1={this.props.boxScale/8} x2={this.props.boxScale/4} y2={this.props.boxScale/8}
		          				style={{stroke: "black", strokeWidth:0.5}}/>
		          		<line x1={this.props.boxScale-this.props.boxScale/3} y1={0} x2={this.props.boxScale-this.props.boxScale/4} y2={this.props.boxScale/8}
		          				style={{stroke: "black", strokeWidth:0.5}}/>
		          		<line x1={this.props.boxScale-this.props.boxScale/3} y1={this.props.boxScale/4} x2={this.props.boxScale-this.props.boxScale/4} y2={this.props.boxScale/8}
		          				style={{stroke: "black", strokeWidth:0.5}}/>
		    </g>
			);
	}

    editFunction = function()
    {
    	this.props.clickFunction();
    }
}