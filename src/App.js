import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Container} from 'reactstrap';
import * as d3 from 'd3';

import Orthographer, {GLYPH_SCALE, BOX_SCALE} from './Orthographer';
import Panel from './Panel';
import {loadFont} from './font-helper';

import './App.css';
import logo from './resources/images/logo.svg';

var margin = {top: 40, right: 40, bottom: 40, left: 0};
var colors = ["green", "red", "cyan", "magenta", "yellow"];

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
    return (  
      <Container className="App" fluid={true}>
        {/*<img src={logo} className="App-logo" alt="logo" />*/}
        <h1 className="App-title">Orthographer</h1>
        <p className="App-intro">
          A tool for generating false-language symbol sets from font files.
        </p>
        <input type="file" ref={this.input} onChange={this.handleUpload} 
                style={{display: "none"}}/>
        <svg  className="glyphcontainer"
              x={margin.left}
              y={margin.top}>
          
          <Orthographer name="draw" x={margin.left} y={margin.top} color={colors[0]}
                      uploadClick={this.uploadClick}  
                      fileResult={this.state.fileResult}
                      fileType={this.state.fileType}
                      killResult={this.killResult}/>
        
        </svg>    
      </Container>);
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
        //reader.onloadend = function (ev) { _this.setTextResult(ev.target.result); };
        reader.onloadend = function (ev) { _this.sendGlyphs(ev.target.result); };
        reader.readAsText(this.input.current.files[0]);
      }
    }
    else
      console.log("Please submit opentype or trutype fonts, or a glyph txt file");
  }

  fetchGlyphs()
  {
    fetch('http://localhost:5000/get_glyph', 
      {method: 'GET', 
      headers: {"Access-Control-Allow-Origin": "*"}})
    .then(results => 
    { 
      return results.json(); 
    }).then(data => 
      {
        console.log(data);
        //Unclear if this works
        //setTextResult(data);
      });
  }

  sendGlyphs(glyphs)
  {
    console.log(glyphs);
    fetch('http://localhost:5000/store_glyph', 
      {method: 'POST',
      body: glyphs, 
      headers: {"Access-Control-Allow-Origin": "*",
                "Content-Type": 'application/json'}})
    .then(response => 
    { 
      return response; 
    }).then(response => 
      console.log('Success:', JSON.stringify(response)))
      .catch(error => console.error('Error:', error));
  }
}

export default App;
