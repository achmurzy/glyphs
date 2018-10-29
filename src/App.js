import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import * as d3 from 'd3';

import Orthographer, {GLYPH_SCALE, BOX_SCALE} from './Orthographer';
import Panel from './Panel';
import {loadFont} from './font-helper'

var margin = {top: 40, right: 40, bottom: 40, left: 40},
                      mWidth = 2000, 
                      mHeight = 2000;
var colors = ["green", "red", "cyan", "magenta", "yellow"];

//Strategies for integrating React and D3:
//"...use React to build the structure of the application, and to render traditional HTML elements,
//and then when it comes to the data visualization section, they pass a DOM container (<svg>) over to D3
//and use D3 to create and destroy and update elements."

//Alternatively
//"...you can use D3 to generate all the necessary drawing instructions 
//and use React to create the actual DOM elements" - this is preferable, because D3 is idiomatic 
//visualization logic, whereas React has a robust object hierarchy to provide a skeleton to move with.

//We've generally followed a hybrid pattern, using explicit references to the DOM from React to 
//add input logic and animation transitions via d3's great library. Reducing the number of explicit
//references to the DOM as much as possible is a good design goal.

class App extends Component {
  constructor(props)
  {
    super(props);
    this.state = 
    {
      fileResult: null,
      fileType: "glyph"
    }
    
    this.input = React.createRef();
    this.uploadClick = this.uploadClick.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.killResult = this.killResult.bind(this);
  }

  //Be very, very careful of mixing HTML and SVG. Fundamentally incompatible for
  //efficient rendering, and many tags won't work at all embedded reciprocally
  render() {
    return (<div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Orthographer</h1>
        </header>
        <p className="App-intro">
          A tool for generating false-language symbol sets from font files.
        </p>
        <input type="file" ref={this.input} onChange={this.handleUpload} 
                style={{display: "none"}}/>
        <svg  className="container"
              x={margin.left}
              y={margin.top}
              width={mWidth}
              height={mHeight}>
          
        <Orthographer name="draw" x={margin.left} y={margin.top} color={colors[0]}
                      uploadClick={this.uploadClick}  
                      fileResult={this.state.fileResult}
                      fileType={this.state.fileType}
                      killResult={this.killResult}/>
        
        </svg>    
      </div>);
  }

  uploadClick = function()
  {
    if(d3.select(this.input.current)._groups[0][0].value != null)
      d3.select(this.input.current)._groups[0][0].value = "";  
    this.input.current.click();
  }

  setTextResult = function(text)
  {
    this.setState({fileResult: text, fileType: "glyph"});
  }

  setOpentypeResult = function(font)
  {
    this.setState({fileResult: font, fileType: "font"});
  }

  killResult = function()
  {
    this.setState({fileResult: null, fileType: "glyph"}); 
  }

  handleUpload = function(event)
  {
    var _this = this;
    var filename = this.input.current.files[0].name;
    var filetype = filename.substr(-4, 4);
    
    if(filetype === '.ttf' || filetype === '.otf')
    {
      var font = loadFont(filename, this);
    }
    else if(filetype === '.txt')
    {
      if(window.FileReader)
      {
        var reader = new FileReader();
        reader.onloadend = function (ev) { _this.setTextResult(ev.target.result); };
        reader.readAsText(this.input.current.files[0]);
      }
    }
    else
      console.log("Please submit opentype or trutype fonts, or a glyph txt file");
  }
}

export default App;
