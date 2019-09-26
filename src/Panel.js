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

    this.state = //Even though it feels intuitive, having expandedElement on Panel instead of Orthographer
		{             //is causing problems with updating. Lift state upward and forget about your abstractions ("property of my Panels", etc.)
			//expandedElement: Number.MAX_SAFE_INTEGER,
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
                      return (<Glyph key={glyph.index} index={glyph.index} name={this.props.name} transform={this.positionGlyph(i, this.props.expandedElement)} 
                      boxScale={this.props.boxScale} color={this.props.color} xScale={this.xScale} yScale={this.yScale} strokes={glyph.strokes} drawSpeed={this.props.speed} 
                      inspecting={i===this.props.expandedElement} opentypeGlyph={glyph.glyph} generator={this.props.generator} clickFunction={this.clickFunction}
                      backend={glyph.backend} clockwise={glyph.clockwise} strokeModifier={this.props.strokeModifier}/>);
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

  doubleClickSemantics = function(selectedIndex)
  {
    var drawing = false;
    var positionIndex;
    //gSelect.selectAll("path").each(function(d, i) //Blocks inspection of undrawn glyphs
    //  { if(d3.select(this).attr("class") === "undrawn") drawing = true; });
    if(!drawing)
    {
        var positionIndex = this.props.glyphData.findIndex((glyph) => {return glyph.index === selectedIndex});
        this.props.removeGlyph(positionIndex);
      }
  }

    //Toggle interactive elements and expand glyph for inspection
  //Shift transform on all other glyphs 
  inspectGlyph = function(selectedIndex)
  {
    this.lastExpanded = this.props.expandedElement;
    if(selectedIndex === this.props.expandedElement) 
    {
      this.props.expandElement(Number.MAX_SAFE_INTEGER);
    }
    else 
    {
      this.props.expandElement(selectedIndex);
    }
  }
}
