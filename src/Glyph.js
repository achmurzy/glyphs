import React, { Component } from 'react';
import * as d3 from 'd3';

import Stroke from './Stroke'
import {GLYPH_SCALE} from './Orthographer'
import {copyStroke, strokeInterpret, interpolateTransform, parseTransform, glyphToStrokes} from './glyph-helper'
import {addContour} from './generator'

var opentype = require('opentype.js')
var Victor = require('victor')

export default class Glyph extends Component
{
	constructor(props)
	{
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.glyph = React.createRef();
    this.startTransform = this.props.transform;
	}

  componentDidMount()
  {
    var glyphGroup = d3.select(this.glyph.current);
    glyphGroup.attr("transform", this.props.transform);
  }

  componentDidUpdate()
  {
    var _this = this;
    var groupElement = d3.select(this.glyph.current);
    var trans 
    var startTransform = parseTransform(groupElement.attr("transform"));
    var endTransform = parseTransform(this.props.transform);
    groupElement.transition()
          .attrTween("transform", function(t)
          {
            return function(t)
            { 
              return interpolateTransform(t, startTransform, endTransform);
            };
          });
    if(this.props.inspecting)
    {
      groupElement.selectAll("circle.start")
        .call(d3.drag().on("drag", function(d, i)
        {
          _this.dragFunction(this, d3.event, i, _this.props.xScale, _this.props.yScale);
        }))
        .on("click", function(d)
          {
            _this.editFunction();
          });

      groupElement.selectAll("circle.end")
        .call(d3.drag().on("drag", function(d, i)
        {
          _this.dragFunction(this, d3.event, i, _this.props.xScale, _this.props.yScale);
        }))
        .on("click", function(d)
          {
            _this.editFunction();
          });

      groupElement.selectAll("circle.cp1")
        .call(d3.drag().on("drag", function(d, i)
        {
          _this.dragFunction(this, d3.event, d3.select(this).attr("stroke-index"), _this.props.xScale, _this.props.yScale);
        }))
        .on("click", function(d)
          {
            _this.editFunction();
          });

      groupElement.selectAll("circle.cp2")
        .call(d3.drag().on("drag", function(d, i)
        {
          _this.dragFunction(this, d3.event, d3.select(this).attr("stroke-index"), _this.props.xScale, _this.props.yScale);
        }))
        .on("click", function(d)
          {
            _this.editFunction();
          });

      var box = this.props.opentypeGlyph.path.getBoundingBox();
      
      groupElement.select("line.aWidth")                                    //This has to be rendered based on actual advance width data
            .attr("x1", function(d) { return _this.props.xScale(_this.props.opentypeGlyph.advanceWidth); })
            .attr("y1", function(d) { return _this.props.boxScale; })  
            .attr("x2", function(d) { return _this.props.xScale(_this.props.opentypeGlyph.advanceWidth); })
            .attr("y2", 0)
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .style("stroke-dasharray", 1);

      groupElement.select("circle.aWidth")
          .attr("cx", this.props.xScale(_this.props.opentypeGlyph.advanceWidth))
          .attr("cy", this.props.boxScale)
          .attr("r", 1)
          .style("fill", "white")
          .style("stroke", "black")
          .style("stroke-width", 0.5)
          .call(d3.drag().on("drag", function(d, i) 
              { _this.dragFunction(this, d3.event, i, _this.props.xScale, _this.props.yScale); })
          .on("start", function(d) {
            groupElement.select("line.awidth").style("stroke-width", 0.1);  
          })
          .on("end", function(d)
          {
            groupElement.select("line.awidth").style("stroke-width", 0);
          }))
          .on("click", function(d)
            {
              //Tell difference between click down and up?
              _this.editFunction();
            });

      groupElement.selectAll("line.bounds").data(function(d, i) 
                            {var lines = [];
                             lines.push([new Victor(box.x1, box.y1), new Victor(box.x1, box.y2)]);
                             lines.push([new Victor(box.x1, box.y1), new Victor(box.x2, box.y1)]);
                             lines.push([new Victor(box.x2, box.y1), new Victor(box.x2, box.y2)]);
                             lines.push([new Victor(box.x1, box.y2), new Victor(box.x2, box.y2)]); 
                              return lines; })
              .attr("x1", function(d) { return _this.props.xScale(d[0].x) })
              .attr("y1", function(d) { return _this.props.yScale(GLYPH_SCALE - d[0].y) })
              .attr("x2", function(d) { return _this.props.xScale(d[1].x) })
              .attr("y2", function(d) { return _this.props.yScale(GLYPH_SCALE - d[1].y) })
              .style("fill", "black")
              .style("stroke", "white")
              .style("stroke-width", 0.5)
              .style("stroke-dasharray", 1); 

      groupElement.select("circle.bbox")
          .attr("cx", function(d) { return _this.props.xScale(box.x1) })
          .attr("cy", function(d) { return _this.props.yScale(GLYPH_SCALE-box.y1) })
          .attr("r", 1)
          .style("fill", "black")
          .style("stroke", "white")
          .style("stroke-width", 0.5)
          .call(d3.drag().on("drag", function(d, i) { _this.dragFunction(this, d3.event, i, _this.props.xScale, _this.props.yScale); }))
          .on("click", function(d)
            {
              _this.editFunction();
            });
      }
  }

	render()
	{
		const strokes = this.props.strokes;
		return(<g ref={this.glyph} className={this.props.name}>
    				<rect x={0} y={0} width={this.props.boxScale} height={this.props.boxScale} onClick={this.handleClick}
    				stroke="gray" style={{strokeOpacity: 0.15, strokeWeight: 0.15, fillOpacity: 0.2}}/>
    			
    				{strokes.map((stroke, i) =>
    					//{beware of curly braces in map expressions
    						<Stroke key={i} className="undrawn" commands={strokeInterpret(stroke.contours, this.props.xScale, this.props.yScale)} 
    								drawSpeed={this.props.drawSpeed} color={this.props.inspecting ? stroke.color : this.props.color}/>
    					//}you need to explicitly specify a return value if you use them
    				)}
            {this.props.inspecting && //May need to factor these into stroke component, may not
              [strokes.map((stroke, i) => 
                <g key={i}>
                  <circle className="start" cx={this.props.xScale(stroke.start.x)} cy={this.props.yScale(stroke.start.y)} r={1}
                      style={{fill: "black", stroke:"red"}}/>
                  <circle className="end" cx={this.props.xScale(stroke.end.x)} cy={this.props.yScale(stroke.end.y)} r={1}/>
                  {(stroke.type === "Q" || stroke.type === "C") &&
                    <circle className="cp1" stroke-index={i} cx={this.props.xScale(stroke.cp1.x)} cy={this.props.yScale(stroke.cp1.y)} r={1}/>}
                    {stroke.type === "C" &&
                      <circle className="cp2" stroke-index={i} cx={this.props.xScale(stroke.cp2.x)} cy={this.props.yScale(stroke.cp2.y)} r={1}/>}    
                </g>),
                <line className="bounds"/>,
                <line className="bounds"/>,
                <line className="bounds"/>,
                <line className="bounds"/>,
                <circle className="bbox"/>,
                <line className="aWidth"/>,
                <circle className="aWidth"/>]  
            }
			    </g>);
  }
	
  handleClick = function()
  {
  	this.props.clickFunction(this.props.index);
  }	

  //Drag detection - click up is "Default behaviour" for click
  editFunction = function()
  {
    if(d3.event.defaultPrevented)   
    {
      return;  
    }
  }

  dragFunction = function(element, event, index, x, y)
  {
    var selection = d3.select(element);
    var pointType = selection.attr("class");
    var glyphData = Object.assign(this.props.opentypeGlyph);
    var opentypePath = glyphData.path;

    //Modify underlying opentype data - be sure to invert to glyph space
    var idx=0;  
    var idy=0;
    if(pointType != "bbox" && pointType != "awidth")
    {
      if(event.x > 0  && event.x < this.props.boxScale)
      {
        selection.attr("cx", event.x);
        idx=x.invert(event.dx);
      }
      if(event.y > 0 && event.y < this.props.boxScale)
      {
        selection.attr("cy", event.y);
        idy=y.invert(-1*event.dy);
      }
    }
    
    var startIndex = index*5;
    switch(pointType)
    {
      case "start":
        glyphData.strokeData[index].start.x += idx;
        glyphData.strokeData[index].start.y += idy;
      break;
      case "end":
        glyphData.strokeData[index].end.x += idx;
        glyphData.strokeData[index].end.y += idy;
      break;
      case "cp1":
        glyphData.strokeData[index].cp1.x += idx;
        glyphData.strokeData[index].cp1.y += idy;
      break;
      case "cp2":
        glyphData.strokeData[index].cp2.x += idx;
        glyphData.strokeData[index].cp2.y += idy;
      break;
      case "aWidth":
      if(event.x > 0 && event.x < this.props.boxScale)
        {
          var bbox = opentypePath.getBoundingBox();
          if(event.x >= x(bbox.x2))
          {
            selection.attr("cx", event.x);
            glyphData.advanceWidth = event.x / this.props.boxScale * GLYPH_SCALE;
            d3.select(element.parentNode).select("line.awidth").attr("x1", event.x).attr("x2", event.x);     
          }
        }
      break;
      case "bbox":
        var bbox = opentypePath.getBoundingBox(); 
        if(event.x > 0 && event.x < this.props.boxScale - x(bbox.x2 - bbox.x1))
        {
          selection.attr("cx", event.x);
          idx=x.invert(event.dx);
        }    
        if(event.y < this.props.boxScale && event.y > 0 + y(bbox.y2 - bbox.y1))
        {
          selection.attr("cy", event.y);
          idy=y.invert(-1*event.dy);
        }
        for(var i=0;i<opentypePath.commands.length;i++)
        {
          opentypePath.commands[i].x += idx;
          opentypePath.commands[i].y += idy;
          
          if(opentypePath.commands[i].hasOwnProperty('x1'))
          {
            opentypePath.commands[i].x1 += idx;
            opentypePath.commands[i].y1 += idy;
          }
          if(opentypePath.commands[i].hasOwnProperty('x2'))
          {
            opentypePath.commands[i].x2 += idx;
            opentypePath.commands[i].y2 += idy;
          }
        }
        for(var i =0; i<glyphData.strokeData.length;i++)
        {
          glyphData.strokeData[i].start.x += idx;
          glyphData.strokeData[i].start.y += idy; 
          glyphData.strokeData[i].end.x += idx;
          glyphData.strokeData[i].end.y += idy;
          if(glyphData.strokeData[i].hasOwnProperty('cp1'))
          {
            glyphData.strokeData[i].cp1.x += idx;
            glyphData.strokeData[i].cp1.y += idy;
          }
          if(glyphData.strokeData[i].hasOwnProperty('cp2'))
          {
            glyphData.strokeData[i].cp2.x += idx;
            glyphData.strokeData[i].cp2.y += idy;
          }
        }
        
      break;
      default:
        console.log("what you clickin boi");
    }

    if(pointType !== "bbox" && pointType !== "aWidth")
    {
      var gg = glyphData.strokeData[index];
      var strokeType = gg.type;
      var stroke;
      var path = {};
      var newPath = new opentype.Path();
      switch(strokeType)
      {
        case 'L':
          stroke = this.props.generator.generateLine(gg.start, gg.end);
          break;
        case 'Q':
          stroke = this.props.generator.generateQuadratic(gg.start, gg.cp1, gg.end);
          path.cp1Pos = stroke[5];
          path.cp1Neg =  stroke[6];
          break;
        case 'C':
          stroke = this.props.generator.generateCubic(gg.start, gg.cp1, gg.cp2, gg.end);
          path.cp1Pos = stroke[5];
          path.cp1Neg = stroke[6];
          path.cp2Pos = stroke[7];
          path.cp2Neg = stroke[8];
          break;
        default:
          console.log("Invalid stroke generation selection");
      }

      path.type = strokeType;
      path.startPos = stroke[1];
      path.startNeg = stroke[2];
      path.endPos = stroke[3];
      path.endNeg = stroke[4];

      addContour(path, newPath);
      for(var i = 0; i < newPath.commands.length; i++)
      {
        opentypePath.commands[startIndex+i] = newPath.commands[i];
      }
    }
      //const strokes = this.props.strokes; //This part might be better because we update only one stroke
      //copyStroke(glyphData.strokeData[index], opentypePath, strokes[index], index);
      //this.props.strokeModifier(strokes, glyphData);
      var glyph = glyphToStrokes(glyphData);
      this.props.strokeModifier(glyph);
  }

	/*initGlyphData = function(glyphs, x, y, panel)
      {
        //Draw stroke elements for interactive editing
        var startPoints = glyphs.selectAll("circle.start").data(function(d, i)
                            { return d.strokes; })
            .attr("cx", function(d) { return x(d.start.x); })
            .attr("cy", function(d) { return y(d.start.y); });
        startPoints.enter()
          .append("circle")
            .attr("class", "start")
            .attr("cx", function(d) { return x(d.start.x); })
            .attr("cy", function(d) { return y(d.start.y); })
            .attr("r", 0)
            .style("fill", function(d) { return d.color; })
            .style("stroke", 'black')
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 1)
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, i, x, y, panel); }))
            .on("click", function(d)
              {
                editFunction();
              });

        var endPoints = glyphs.selectAll("circle.end").data(function(d, i)
                            { return d.strokes; })
            .attr("cx", function(d) { return x(d.end.x); })
            .attr("cy", function(d) { return y(d.end.y); });
        endPoints.enter()
          .append("circle")
            .attr("class", "end")
            .attr("cx", function(d) { return x(d.end.x); })
            .attr("cy", function(d) { return y(d.end.y); })
            .attr("r", 0)
            .style("fill", function(d) { return d.color; })
            .style("stroke", 'black')
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 1)
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, i, x, y, panel); }))
            .on("click", function(d)
              {
                editFunction();
              });

        //Select cubic and quadratic strokes
        var controlPoints1 = glyphs.selectAll("circle.cp1").data(function(d, i)
                            { 
                              var qcCollect = [];
                              for(var i = 0; i < d.strokes.length; i++) 
                              {
                                if(d.strokes[i].type === 'Q' || d.strokes[i].type === 'C')
                                {
                                  d.strokes[i].index = i;
                                  qcCollect.push(d.strokes[i]);
                                }                               }
                              return qcCollect; 
                            })
            .attr("cx", function(d) { return x(d.cp1.x); })
            .attr("cy", function(d) { return y(d.cp1.y); });
        controlPoints1.enter()
          .append("circle")
            .attr("class", "cp1")
            .attr("cx", function(d) { return x(d.cp1.x); })
            .attr("cy", function(d) { return y(d.cp1.y); })
            .attr("r", 0)
            .style("fill", function(d) { return d.color; })
            .style("stroke", 'white')
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 1)
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, d.index, x, y, panel); }))
            .on("click", function(d)
              {
                editFunction();
              });

        //Select cubic strokes
        var controlPoints2 = glyphs.selectAll("circle.cp2").data(function(d, i)
                            {                               
                              var cCollect = [];
                              for(var i = 0; i < d.strokes.length; i++) 
                              {
                                if(d.strokes[i].type === 'C')
                                {
                                  d.strokes[i].index = i;
                                  cCollect.push(d.strokes[i]);
                                }
                              }
                              return cCollect; })
            .attr("cx", function(d) { return x(d.cp2.x); })
            .attr("cy", function(d) { return y(d.cp2.y); });
        controlPoints2.enter()
          .append("circle")
            .attr("class", "cp2")
            .attr("cx", function(d) { return x(d.cp2.x); })
            .attr("cy", function(d) { return y(d.cp2.y); })
            .attr("r", 0)
            .style("fill", function(d) { return d.color; })
            .style("stroke", 'white')
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 1)
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, d.index, x, y, panel); }))
            .on("click", function(d)
              {
                editFunction();
              });

        var boundingLines = glyphs.selectAll("line.bounds").data(function(d, i) 
                              { var box = d.glyph.path.getBoundingBox();
                               var lines = [];
                               lines.push([new Victor(box.x1, box.y1), new Victor(box.x1, box.y2)]);
                               lines.push([new Victor(box.x1, box.y1), new Victor(box.x2, box.y1)]);
                               lines.push([new Victor(box.x2, box.y1), new Victor(box.x2, box.y2)]);
                               lines.push([new Victor(box.x1, box.y2), new Victor(box.x2, box.y2)]); 
                                return lines; })
            .attr("x1", function(d) { return x(d[0].x) })
            .attr("y1", function(d) { return y(GLYPH_SCALE - d[0].y) })
            .attr("x2", function(d) { return x(d[1].x) })
            .attr("y2", function(d) { return y(GLYPH_SCALE - d[1].y) });
        boundingLines.enter()
          .append("line")
            .attr("class", "bounds")
            .attr("x1", function(d) { return x(d[0].x) })
            .attr("y1", function(d) { return y(GLYPH_SCALE - d[0].y) })
            .attr("x2", function(d) { return x(d[1].x) })
            .attr("y2", function(d) { return y(GLYPH_SCALE - d[1].y) })
            .style("stroke-width", 0)
            .style("stroke-opacity", 1)
            .style("stroke-dasharray", 1);

        var boxDrag = glyphs.select("circle.bbox");
        if(boxDrag._groups[0][0] === undefined)
        {
          glyphs.append("circle")
            .attr("class", "bbox")
            .attr("cx", function(d) { return x(d.glyph.path.getBoundingBox().x1) })
            .attr("cy", function(d) { return y(GLYPH_SCALE-d.glyph.path.getBoundingBox().y1) })
            .attr("r", 0)
            .style("fill", "black")
            .style("stroke", "white")
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 1)
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, d.index, x, y, panel); }))
            .on("click", function(d)
              {
                editFunction();
              });
        }
        else
        {
          boxDrag.attr("cx", function(d) { return x(d.glyph.path.getBoundingBox().x1) })
            .attr("cy", function(d) { return y(GLYPH_SCALE-d.glyph.path.getBoundingBox().y1) });
        } 

        var aWidth = glyphs.select("circle.awidth");
        var aLine = glyphs.select("line.aWidth");
        if(aWidth._groups[0][0] === undefined)
        {
          glyphs.append("circle")
            .attr("class", "awidth")
            .attr("cx", function(d) { return x(d.glyph.path.getBoundingBox().x2); })
            .attr("cy", function(d) { return panel.drawParams.boxScale; })
            .attr("r", 0)
            .style("fill", "white")
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 1)
            .call(d3.drag().on("drag", function(d, i) 
              { dragFunction(this, d3.event, d.index, x, y, panel); })
                .on("start", function(d) {
                  glyphs.select("line.awidth").style("stroke-width", 0.1);  
                })
                .on("end", function(d)
                {
                  glyphs.select("line.awidth").style("stroke-width", 0);
                }))
            .on("click", function(d)
              {
                //Tell difference between click down and up?
                editFunction();
              });

           glyphs.append("line")
            .attr("class", "awidth")
            .attr("x1", function(d) { return x(d.glyph.path.getBoundingBox().x2); })
            .attr("y1", function(d) { return panel.drawParams.boxScale; })  
            .attr("x2", function(d) { return x(d.glyph.path.getBoundingBox().x2); })
            .attr("y2", 0)
            .style("stroke-width", 0)
            .style("stroke-opacity", 1)
            .style("stroke-dasharray", 1);
        }
        else if(aWidth.attr("cx") < x(aWidth.datum().glyph.path.getBoundingBox().x2))
        {
          aWidth.attr("cx", function(d) { return x(d.glyph.path.getBoundingBox().x2); });
          aLine.attr("x1", function(d) { return x(d.glyph.path.getBoundingBox().x2); })
          .attr("x2", function(d) { return x(d.glyph.path.getBoundingBox().x2); });
        }
    }*/
}