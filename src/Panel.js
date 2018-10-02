import React, { Component } from 'react';
import * as d3 from 'd3';

import Glyph from './Glyph'

export default class Panel extends Component
{

	//Props contains a panel name, draw parameters, and generator glyph
	constructor(props)
	{
		super(props)

    this.xScale = d3.scaleLinear()
                    .domain([0, this.props.glyphScale])
                    .range([0, this.props.boxScale]);
    this.yScale = d3.scaleLinear()
                .domain([0, this.props.glyphScale])
                .range([0, this.props.boxScale]);  

    this.gScaleX = d3.scaleLinear()
        .domain([0, this.props.glyphsX])
        .range([0, this.props.width]);

    this.gScaleY = d3.scaleLinear()
        .domain([0, this.props.glyphsY])
        .range([0, this.props.height]);

    this.state = //State is reserved for elements which trigger re-rendering of components
		{
			expandedElement: Number.MAX_SAFE_INTEGER,
		};

    this.group = React.createRef();

    this.clickFunction = this.clickFunction.bind(this);
    this.lastExpanded= Number.MAX_SAFE_INTEGER;
    this.clicked = false;
    this.clickLength = 350;
    this.inspect = true;

    this.positionFunction;

    this.fullClick = false;
  }

  componentDidUpdate(prevProps, prevState)
  {}

  render()  //Render the panel as a list of glyphs
  {
    const glyphs = this.props.glyphData;
    return (<g ref={this.group} transform={"translate("+this.props.x+","+this.props.y+")"}>
                {glyphs.map((glyph, i) => 
                  {
                      return (<Glyph key={glyph.index} index={glyph.index} name={this.props.name} transform={this.positionGlyph(i, this.state.expandedElement)} 
                      boxScale={this.props.boxScale} color={this.props.color} xScale={this.xScale} yScale={this.yScale} strokes={glyph.strokes} drawSpeed={this.props.speed} 
                      inspecting={i===this.state.expandedElement} opentypeGlyph={glyph.glyph} generator={this.props.generator} clickFunction={this.clickFunction}
                      strokeModifier={this.props.strokeModifier}/>);
                  }
                )}
            </g>);
  }

  positionGlyph(index, element)
  {
    var offset = 0;
    var inspectScale = 1;
    if(element !== Number.MAX_SAFE_INTEGER && index >= element)
    {
      if(index === element)
      {
        inspectScale = this.props.inspectScale;
      }
      else
      {
        var columnNumber = (element) % this.props.glyphsX;
        var emptyColumns = this.props.inspectScale - (this.props.glyphsX - columnNumber);
        if(emptyColumns < 0)
          emptyColumns = 0;
        var boundaryIndex = Math.floor((index - element - 1) / 
          (this.props.glyphsX - (this.props.inspectScale - emptyColumns)))+1;
        if(boundaryIndex > this.props.inspectScale)
          boundaryIndex = this.props.inspectScale;

        offset = (boundaryIndex * (this.props.inspectScale - emptyColumns)) - 1;
      }   
    }

    var gY = Math.floor((index+offset) / this.props.glyphsX);
    var gX = (offset+index) - (gY * this.props.glyphsX);

    return "translate(" + this.gScaleX(gX) + "," + this.gScaleY(gY) + ") scale("+inspectScale+","+inspectScale+")";
  }

  //Factored click function with click/double-click semantics
  //Cannot provide  input, must get fields from Glyph component
  clickFunction = function(selectedIndex)
  {                           
    var _this = this;
    if(!this.clicked)
    {
      this.clicked = true;
      var t = d3.timer(function(dt) //Click
      {
        if(dt > _this.clickLength || !_this.clicked)
        {
          if(!_this.clicked)
            t.stop();          
          else
          {
            t.stop();
            _this.clicked = false;
            _this.clickSemantics(selectedIndex);
          } 
        }
      });
    }
    else
    {  
      this.clicked = false;
      this.doubleClickSemantics(selectedIndex);
    }
  }

  //Pass reference to panel for use in method-chaining
  clickSemantics = function(selectedIndex)
  {
    var drawing = false;
    //gSelect.selectAll("path").each(function(d, i) //Blocks inspection of undrawn glyphs
    //  { if(d3.select(this).attr("class") === "undrawn") drawing = true; });
    if(!drawing)  //Find the index of the selected element within the DOM hierarchy
    {
      var positionIndex = this.props.glyphData.findIndex((glyph) => {return glyph.index === selectedIndex});
      this.inspectGlyph(positionIndex);
    }
  }

  //Toggle interactive elements and expand glyph for inspection
  //Shift transform on all other glyphs 
  inspectGlyph = function(selectedIndex)
  {
    this.lastExpanded = this.state.expandedElement;
    if(selectedIndex === this.state.expandedElement) 
    {
      this.setState({expandedElement: Number.MAX_SAFE_INTEGER});
    }
    else 
    {
      this.setState({expandedElement: selectedIndex});
    }
  }

  doubleClickSemantics = function(_this, gElement)
  {
    var drawing = false;
    var gSelect = d3.select(gElement);
    var positionIndex;
    gSelect.selectAll("path").each(function(d, i) //Blocks inspection of undrawn glyphs
      { if(d3.select(this).attr("class") === "undrawn") drawing = true; });
    if(!drawing)
    {
          _this.group.selectAll("g."+_this.name).each(function(d, i) //Double-click
          {                 
            if(d.index === gSelect.datum().index)                    
            { positionIndex = i; }
          });

          //alphabetize(gElement); sposed to happen
          _this.toggleGlyphData(gSelect, false);
          _this.removeGlyph(_this, positionIndex);
          //if(_this.totalTime === _this.stopTime)
          //  _this.toggleGeneration();
      }
  }

  removeGlyph = function(_this, index)
  {
    _this.glyphData.splice(_this.glyphWindow+index, 1);
    _this.windowData.splice(index, 1);
    if(index === _this.expandedElement)
    {
      _this.expandedElement = Number.MAX_SAFE_INTEGER;
      _this.transformGlyphs(_this.collapse);
      return;
    }
    else if(index < _this.expandedElement)
    {
      _this.expandedElement--;
    }
    _this.transformGlyphs(_this.expand);
  }

  toggleGlyphData = function(glyph, up)
  {
    var _this = this;
    var radius = up ? 1 : 0;
    
    //Draw stroke elements for interactive editing
    var startPoints = glyph.selectAll("circle.start").attr("r", radius);
    var endPoints = glyph.selectAll("circle.end").attr("r", radius);
    var controlPoints1 = glyph.selectAll("circle.cp1").attr("r", radius);
    var controlPoints2 = glyph.selectAll("circle.cp2").attr("r", radius);

    var bbox = glyph.selectAll("circle.bbox").attr("r", radius);
    var aWidth = glyph.select("circle.awidth").attr("r", radius);
    var boundingLines = glyph.selectAll("line.bounds")
      .style("stroke-width", 0.1 * radius);

    glyph.selectAll("path").transition()
      .style("fill", function(d) { if(up) return d.color; else return _this.drawParams.boxColor; })
      .style("stroke",function(d) { if(up) return d.color; else return 'gray'; });

  }

	/*this.group.append("line")
            .attr("class", "full")
						.attr("x1", (3*this.drawParams.boxScale/4))
						.attr("y1", this.drawParams.boxScale + this.drawParams.boxScale/8)
						.attr("x2", this.drawParams.boxScale/4)
						.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8)
            .style("stroke-width", 0.5);
					this.group.append("line")
            .attr("class", "full")
						.attr("x1", this.drawParams.boxScale - this.drawParams.boxScale/3)
						.attr("y1", this.drawParams.boxScale)
						.attr("x2", this.drawParams.boxScale - this.drawParams.boxScale/4)
						.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8)
            .style("stroke-width", 0.5);
					this.group.append("line")
						.attr("class", "full")
            .attr("x1", this .drawParams.boxScale - this.drawParams.boxScale/3)
						.attr("y1", this.drawParams.boxScale + this.drawParams.boxScale/4)
						.attr("x2", this.drawParams.boxScale - this.drawParams.boxScale/4)
						.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8)
            .style("stroke-width", 0.5);

	showFullButton = function(index) 
	{ 
		var _this = this;
		d3.select(this.fullButton).remove();
		var lines = this.group.selectAll("line.full").remove();
		var lastElement = this.group.selectAll("g."+this.name).filter(function(d, i) 
		{
			return i === index;
		});
		lastElement.append(function() { return _this.fullButton._groups[0][0]; });

		for(var i = 0; i < 3; i++)
		{
			lastElement.append(function () { return lines._groups[0][i]; });							
		}

		this.fullButton.transition()
		.duration(100)
		.attr("height", this.drawParams.boxScale/4)
		.on("end", function() { lastElement.selectAll("line")
									.transition()
										.duration(100)
										.style("stroke-opacity", 1); });
	};

	hideFullButton = function(index) 
	{	
		var _this = this;
		var lastElement = this.group.selectAll("g").filter(function(d, i) 
		{
			return i === index;
		});
		d3.select(this.fullButton).remove();
		var lines = lastElement.selectAll("line.full").remove();
		lines.transition()
			.duration(0)
			.style("stroke-opacity", 0);
		this.fullButton.transition()
			.duration(0)
			.attr("height", 0)
			.on("end", function() { _this.fullClick = false; });
		this.group.append(function() { return _this.fullButton._groups[0][0]; });
		for(var i = 0; i < 3; i++)
		{
			this.group.append(function () { return lines._groups[0][i]; });							
		}
	};

}
*/
}
