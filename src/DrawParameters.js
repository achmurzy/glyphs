import React, { Component } from 'react';
import * as d3 from 'd3';
//import qq from 'fine-uploader/lib/core'

import Slider from './Slider';
import Toggle from './Toggle';
import GlyphButton from './GlyphButton';
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

        this.input = React.createRef();
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
                    min={1} max={GLYPH_SCALE/2} valueFunction={this.length} name="Stroke Length"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*2/8)} width={this.props.width} 
                    min={1} max={GLYPH_SCALE/2} valueFunction={this.lengthVar} name="Length Variance"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*3/8)} width={this.props.width} 
                    min={1} max={GLYPH_SCALE/8} valueFunction={this.width} name="Stroke Width"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*4/8)} width={this.props.width} 
                    min={1} max={GLYPH_SCALE/8} valueFunction={this.widthVar} name="Width Variance"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*5/8)} width={this.props.width} 
                    min={1} max={5} valueFunction={this.minStrokes} name="Minimum Strokes"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*6/8)} width={this.props.width} 
                    min={1} max={5} valueFunction={this.maxStrokes} name="Maximum Strokes"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*7/8)} width={this.props.width} 
                    min={0} max={1} valueFunction={this.connect} name="Connect Probability"/>
                
                <Slider x={this.props.x} y={this.props.y + (this.props.height*8/8)} width={this.props.width} 
                    min={1} max={100} valueFunction={this.trainingData} name="Training Data Size"/>

                <text x={this.props.x} y={this.props.y+this.props.height+40} style={{font: "12px sans-serif"}}>Download glyph data</text>
                <GlyphButton className="Panel-button" x={this.props.x} y={this.props.y+this.props.height+50} boxScale={this.props.width/2}
                    clickFunction={this.props.generateTrainingData}/>

                <text x={this.props.x + (this.props.width/1.5)} y={this.props.y+this.props.height+40} style={{font: "12px sans-serif"}}>Upload glyph data</text>
                <GlyphButton className="Panel-button" x={this.props.x+this.props.width/1.5} y={this.props.y+this.props.height+50} 
                        boxScale={this.props.width/2} clickFunction={this.props.uploadClick}/>

                <text x={this.props.x + (this.props.width/1.5)} y={this.props.y+this.props.height+120} style={{font: "12px sans-serif"}}>Fetch server glyphs</text>
                <GlyphButton className="Panel-button" x={this.props.x+this.props.width/1.5} y={this.props.y+this.props.height+130} 
                        boxScale={this.props.width/2} clickFunction={this.props.fetchGlyphs}/>
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
        this.props.valueChange(name, value);
    }
}