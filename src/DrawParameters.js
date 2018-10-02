import React, { Component } from 'react';
import * as d3 from 'd3';

import Generator from './generator';
import Slider from './Slider';
import Toggle from './Toggle';
import {GLYPH_SCALE} from './Orthographer'

//This class will need to be refactored as a series of input components defining
//the sliders for interacting with generator parameters. See 'addSlider' and 'addToggle' methods

//Will need to move Generator class to here, then directly feed glyph data into the panel
//Perhaps this component should render the panel, so that the draw parameters can control the 
//generator and send glyph data to the panel for direct rendering. 

export default class DrawParameters extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =    //State holds the variables modified by sliders
        {
            line: true,
            quadratic: true,
            cubic: true,
        }
        //this.generator = new Generator(); 
        this.length = this.generatorCallback.bind(this, "strokeLength");    //Consider adding text and values to slider to illustrate these
        this.lengthVar = this.generatorCallback.bind(this, "lengthVariance");
        this.width = this.generatorCallback.bind(this, "strokeWidth");
        this.widthVar = this.generatorCallback.bind(this, "widthVariance");
        this.minStrokes = this.generatorCallback.bind(this, "minStrokes");
        this.maxStrokes = this.generatorCallback.bind(this, "maxStrokes");
        this.connect = this.generatorCallback.bind(this, "connectProbability");
        this.trainingData = this.generatorCallback.bind(this, "trainingDataSize");

        this.line = this.generatorCallback.bind(this, "line");
        this.quadratic = this.generatorCallback.bind(this, "quadratic");
        this.cubic = this.generatorCallback.bind(this, "cubic");
    }

    render()
    {
        return(
            <g>
                <rect x={this.props.x-10} y={this.props.y} width={this.props.width+50} height={this.props.height+this.props.height*1/8}
                    style={{fill: this.props.color, fillOpacity: 0.25}}/>

                <Toggle x={this.props.x} y={this.props.y - (this.props.height*1/8)} width={this.props.width/4}
                    valueFunction={this.line} name="line" toggle={this.state.line}/> 
                <Toggle x={this.props.x + this.props.width/2} y={this.props.y - (this.props.height*1/8)} width={this.props.width/4}
                    valueFunction={this.quadratic} name="quadratic" toggle={this.state.quadratic}/>
                <Toggle x={this.props.x + this.props.width} y={this.props.y - (this.props.height*1/8)} width={this.props.width/4}
                    valueFunction={this.cubic} name="cubic" toggle={this.state.cubic}/>


                <Slider x={this.props.x} y={this.props.y + (this.props.height*1/8)} width={this.props.width} 
                    min={0} max={GLYPH_SCALE/2} valueFunction={this.length} name="Stroke Length"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*2/8)} width={this.props.width} 
                    min={0} max={GLYPH_SCALE/2} valueFunction={this.lengthVar} name="Length Variance"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*3/8)} width={this.props.width} 
                    min={0} max={GLYPH_SCALE/2} valueFunction={this.width} name="Stroke Width"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*4/8)} width={this.props.width} 
                    min={0} max={GLYPH_SCALE/2} valueFunction={this.widthVar} name="Width Variance"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*5/8)} width={this.props.width} 
                    min={1} max={5} valueFunction={this.minStrokes} name="Minimum Strokes"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*6/8)} width={this.props.width} 
                    min={1} max={5} valueFunction={this.maxStrokes} name="Maximum Strokes"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*7/8)} width={this.props.width} 
                    min={0} max={1} valueFunction={this.connect} name="Connect Probability"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*8/8)} width={this.props.width} 
                    min={1} max={100} valueFunction={this.trainingData} name="Training Data Size"/>
            </g>
            );
    }

    generatorCallback = function(name, value)
    {
        if(name === "line" || name === "quadratic" || name === "cubic")
        {
            this.setState(prevState => ({[name]: value}));
            if(!this.state.line && !this.state.quadratic && !this.state.cubic)
            {
                this.setState(prevState => ({[name]: !value}));
            }   
        }
        this.props.valueChange(name, this.state[name]);
    }
}

/*createButton(panel)
{
    var _this = this;
    this.parameterShow = true;
    this.parameterClick = false;
    var pbWidth = (this.width-this.boxScale);
    var pbHeight = (-this.boxScale/4);

    this.parameterX = (this.width+(this.boxScale*this.inspectScale))-(this.boxScale/2);
    this.parameterPanel = panel.group.append("g")
        .attr("class", "parameters")
        .attr("transform", "translate("+this.parameterX+","+(0)+") scale(1,1)");

    //Glyph parsing button - accepts .ttf, .otf, .txt (training/learning data)
    this.parameterPanel.append("rect")
        .attr("x", 0)
        .attr("y", this.panelWidth)
        .attr("width", this.panelWidth)
        .attr("height", this.panelWidth)
        .style("fill-opacity", 0.35)
        .style("fill", this.boxColor);

    this.parameterPanel.append("text")
        .attr("class", "noselect")
        .attr("x", 0)
        .attr("y", this.panelWidth)
        .text("Glyph data file")
        .style("font-size", 12+"px");

    if(window.FileReader)
    {
        this.inputButton = document.createElement("INPUT");
        this.inputButton.setAttribute("type", "file");
        this.inputButton.setAttribute("value", "default");

        function inputDrag (ev) //this is calling drag rect
        {
            ev.stopPropagation (); 
            ev.preventDefault ();
            if (ev.type == 'drop') 
            {
              var reader = new FileReader ();
              reader.onloadend = function (ev) { panel.generator.parseGlyphs(this.result, panel); };
              reader.readAsText (ev.dataTransfer.files[0]);
              d3.select(this).style("fill-opacity", 0.1);                  
            } 
            else if(ev.type == 'dragenter')
            {
              d3.select(this).style("fill-opacity", 0.75);
            } 
            else if(ev.type == 'dragexit')
            {
              d3.select(this).style("fill-opacity", 0.1);                    
            }
        }
    
        this.parseGlyphButton = this.parameterPanel.append("rect") 
          .attr("x", 10)
          .attr("y", this.panelWidth+10)
          .attr("width", this.panelWidth-20)
          .attr("height", this.panelWidth-20)
          .style("fill", this.boxColor)
          .style("fill-opacity", 0.1)
          .style("stroke", "black")
          .style("stroke-opacity", 1);    

        this.parseGlyphButton.node().addEventListener("dragenter", inputDrag, false);
        this.parseGlyphButton.node().addEventListener("dragexit", inputDrag, false);
        this.parseGlyphButton.node().addEventListener("dragover", inputDrag, false);
        this.parseGlyphButton.node().addEventListener("drop", inputDrag, false);

        this.parameterPanel.append("text")
            .attr("class", "noselect")
            .attr("x", 0)
            .attr("y", this.panelWidth+this.panelWidth/2)
            .text("Drag glyph data here")
            .style("font-size", 12+"px");
    }
    else
    {
        this.parameterPanel.append("text")
        .attr("class", "noselect")
        .attr("x", 0)
        .attr("y", this.panelWidth)
        .text("Glyph data upload not supported for your browser.")
        .style("font-size", 12+"px");   
    }

    if(panel.name !== "font")
    {
        this.generator = panel.generator;
        this.addSlider("minStrokes", 0, 0, 10);
        this.addSlider("maxStrokes", this.panelWidth/8, 0, 10);
        this.addSlider("strokeLength", this.panelWidth/4, 0, GLYPH_SCALE/2);
        this.addSlider("lengthVariance", this.panelWidth/4+this.panelWidth/8, 0, GLYPH_SCALE/2)
        this.addSlider("strokeWidth", this.panelWidth/2, 0, GLYPH_SCALE/10);
        this.addSlider("widthVariance", this.panelWidth/2+this.panelWidth/8, 0, GLYPH_SCALE/10);
        this.addSlider("connectProbability", 3*this.panelWidth/4, 0, 1);
        this.addToggle("line", 0);
        this.addToggle("quadratic", this.panelWidth/4);
        this.addToggle("cubic", this.panelWidth/2);

        this.parameterPanel.append("text")
            .attr("class", "noselect")
            .attr("x", 0)
            .attr("y", 2*this.panelWidth + 20)
            .text("Download training data")
            .style("font-size", 10+"px");
        this.parameterPanel.append("rect")
            .attr("x", 0)
            .attr("y", 2*this.panelWidth + 20)
            .attr("width", this.panelWidth)
            .attr("height", this.panelWidth/4)
            .style("stroke", 'black')
            .style("stroke-weight", 5)
            .style("fill-opacity", 1)
            .style("fill", this.boxColor)
            .on("click", function() { panel.generateTrainingData(_this.generator.trainingDataSize); });
        this.addSlider("trainingDataSize", 2*this.panelWidth+50, 0, 1000);
    }
}

DrawParameters.prototype.togglePanel = function()
{
    var startTransform = parseTransform(this.parameterPanel.attr("transform"));
    var endTransform;
    if(this.parameterShow)
    {
        endTransform = "translate("+this.parameterX+","+(0)+") scale(1,1)";
    }
    else
    {
        endTransform = "translate("+this.parameterX+","+(0)+") scale(0,0)";
    }
    endTransform = parseTransform(endTransform);
    var _this = this;
    this.parameterPanel.transition()
        .attrTween("transform", function(t)
        {
          return function(t)
          { 
            return interpolateTransform(t, startTransform, endTransform);
          };
        }).on("end", function() { _this.parameterClick = false; });
}
*/