import React, { Component } from 'react';
import * as d3 from 'd3';
import Stroke from './Stroke'
import {strokeInterpret, interpolateTransform, parseTransform} from './orthographer'

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
    d3.select(this.glyph.current).attr("transform", this.props.transform);
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
  }

	render()
	{
		const strokes = this.props.strokes;
		return(<g ref={this.glyph} className={this.props.name}>
				<rect x={0} y={0} width={this.props.boxScale} height={this.props.boxScale} onClick={this.handleClick}
				stroke="gray" style={{strokeOpacity: 0.15, strokeWeight: 0.15, fillOpacity: 0.2}}/>
				
				{this.props.inspecting && //May need to factor these into stroke component, may not
					strokes.map((stroke, i) => 
						<g key={i}>
							<circle cx={this.props.xScale(stroke.start.x)} cy={this.props.yScale(stroke.start.y)} r={1}/>
							<circle cy={this.props.xScale(stroke.end.x)} cy={this.props.yScale(stroke.end.y)} r={1}/>
							{(stroke.type === "Q" || stroke.type === "C") &&
								<circle cx={this.props.xScale(stroke.cp1.x)} cy={this.props.yScale(stroke.cp1.y)} r={1}/>}
								{stroke.type === "C" &&
									<circle cx={this.props.xScale(stroke.cp2.x)} cy={this.props.yScale(stroke.cp2.y)} r={1}/>}
              {}    
						</g>
					) 
				}
				{strokes.map((stroke, i) =>
					//{beware of curly braces in map expressions
						<Stroke key={i} className="undrawn" commands={strokeInterpret(stroke.contours, this.props.xScale, this.props.yScale)} 
								drawSpeed={this.props.drawSpeed} color={this.props.color}/>
					//}you need to explicitly specify a return value if you use them
				)}
			</g>);
  }
	
  handleClick = function()
  {
  	this.props.clickFunction(this.props.index);
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