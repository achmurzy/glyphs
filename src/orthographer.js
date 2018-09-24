import * as d3 from 'd3';
import {addContour} from './generator'

var Victor = require('victor')
var opentype = require('opentype.js') //this may not be correct



var GLYPH_SCALE = 1024;
//A large number of confusing utility functions for processing and modifying glyph data      

export function strokeInterpret(datum, scaleX, scaleY)
{
  var path = d3.path();
  for(var c = 0; c < datum.length; c++)
  {
    for(var i  = 0; i < datum.length; i++)
    {
      var point = datum[i];
      var pointX = scaleX(point.x);
      var pointY = scaleY(point.y);
      
      switch(point.type)
      {
        case 'M':
          path.moveTo(pointX, pointY);
          break;
        case 'L':
          path.lineTo(pointX, pointY);
          break ;
        case 'Q':
          path.quadraticCurveTo(scaleX(point.x1), scaleY(point.y1), pointX, pointY);
          break;
        case 'C':
          path.bezierCurveTo(scaleX(point.x1), scaleY(point.y1), 
            scaleX(point.x2), scaleY(point.y2), pointX, pointY);
          break;
        case 'Z':                                    
          path.closePath();
          break;
        default:
          console.log("Uninterpretable symbol. Check path generation algorithm");
      }
    }
  }
  return path.toString();
}

//The following two functions mimic <opentype.js> objects in a d3-friendly rendering format
//Takes an <opentype.js> Glyph object and converts it into an array of stroke data
export function glyphToStrokes(glyphData)
{
  var glyphObject = new Object();
  glyphObject.strokes = [];
  glyphObject.index = glyphData.index;
  glyphObject.glyph = glyphData;

  //Loop through stroke data and access path list as needed
  for(var i = 0; i < glyphData.strokeData.length; i++)
  {
    var stroke = glyphData.strokeData[i];
    var strokeObject = new Object();
    strokeObject.type = stroke.type;
    strokeObject.color = stroke.color;

    var flipStart = JSON.parse(JSON.stringify(stroke.start));
    flipStart.y = MirrorY(flipStart.y);
    strokeObject.start = flipStart;

    var flipEnd = JSON.parse(JSON.stringify(stroke.end));
    flipEnd.y = MirrorY(flipEnd.y);
    strokeObject.end = flipEnd;

    copyStroke(stroke, glyphData.path, strokeObject, i);
    glyphObject.strokes.push(strokeObject);
  }

  return glyphObject;
}

//Transfer elements to the alphabet panel and disable inappropriate callbacks
export function alphabetize(gElement)
{
  //if(alphabetPanel.glyphData.length > 0)
  //  alphabetPanel.hideFullButton(alphabetPanel.glyphData.length-1);
  /*var glyphElement = d3.select(gElement);
  alphabetPanel.group.append(function() { return gElement; });
  alphabetPanel.glyphData.push(glyphElement.datum());

  alphabetPanel.group.select("g.draw").attr("class", "font").select("rect").on("click", function(d, i)
    { 
      var gElement = this.parentNode;           //Pass function reference with list of arguments
      alphabetPanel.clickFunction(d, i, gElement, partial(function(ap, i)
        {
          if(alphabetPanel.glyphData.length === i)
            alphabetPanel.hideFullButton(alphabetPanel.glyphData.length-1);
          d3.select(gElement).remove();
          alphabetPanel.removeGlyph(ap, i); 
          if(alphabetPanel.glyphData.length === i)
            alphabetPanel.showFullButton(alphabetPanel.glyphData.length-1);          
        }, alphabetPanel, alphabetPanel.glyphData.length-1)); //position is length of current dataset
    }).attr("fill", 'gray');
  
  var startTransform = parseTransform(glyphElement.attr("transform"));
  var endTransform = alphabetPanel.collapse(alphabetPanel.glyphData.length - 1, alphabetPanel);

  glyphElement.transition()
  .attrTween("transform", function(t)
      {
        return function(t)
        { 
          return interpolateTransform(t, startTransform, endTransform);
        };
      });
  alphabetPanel.showFullButton(alphabetPanel.glyphData.length-1);*/
}

export function interpolateTransform(t, startT, endT)
{
  var is = d3.interpolateNumber(startT.scale[0], endT.scale[0]);
  var tsx = d3.interpolateNumber(startT.translate[0], endT.translate[0]);
  var tsy = d3.interpolateNumber(startT.translate[1], endT.translate[1]);
  
  return "translate("+tsx(t)+","+tsy(t)+"),scale("+is(t)+","+is(t)+")";
}

export function parseTransform (a)
{
  var b={};
  for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
  {
      var c = a[i].match(/[\w\.\-]+/g);
      b[c.shift()] = c;
  }
  return b;
}

      //Cut glyphs into strokes separated by 'M' symbols
      function glyphsToStrokes(glyphData)
      {
        var strokeData = [];
        for(var i = 0; i < glyphData.length; i++)
        {
          strokeData[i] = glyphToStrokes(glyphData[i]);
        }
        return strokeData;
      }

      

      //Takes an opentype path commmand and converts to a d3-renderable stroke object
      //This function was factored for use in editing glyphs interactively
      function copyStroke(stroke, glyphPath, strokeObject, index)
      {
        strokeObject.contours = [];
        //Exactly 5 path symbols per stroke: MLXLX, where X is L | Q | C
        for(var j = 0; j < 5; j++)
        {
          var flipPoint = JSON.parse(JSON.stringify(glyphPath.commands[(index*5)+j]));
          if(flipPoint.type === 'Q' || flipPoint.type === 'C')
          {
            flipPoint.y1 = MirrorY(flipPoint.y1);
            
            var flipCp1 = JSON.parse(JSON.stringify(stroke.cp1));
            flipCp1.y = MirrorY(flipCp1.y);
            strokeObject.cp1 = flipCp1;

            if(flipPoint.type === 'C')
            {
              flipPoint.y2 = MirrorY(flipPoint.y2);

              var flipCp2 = JSON.parse(JSON.stringify(stroke.cp2));
              flipCp2.y = MirrorY(flipCp2.y);
              strokeObject.cp2 = flipCp2;
            }
          }
          flipPoint.y = MirrorY(flipPoint.y);
          strokeObject.contours.push(flipPoint);
        }
      }

      //Helper for anonymously calling methods with a list of arguments
      function partial(func /*, 0..n args */) 
      {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
          var allArguments = args.concat(Array.prototype.slice.call(arguments));
          return func.apply(this, allArguments);
        };
      }

      function editFunction()
      {
        if(d3.event.defaultPrevented)   //Drag detection - click up is "Default behaviour" for click
        {
          return;  
        }
      }

      function dragFunction(element, event, index, x, y, panel)
      {
        var selection = d3.select(element);
        var pointType = selection.attr("class");
        var glyphData = d3.select(element.parentNode).datum();
        var opentypePath = glyphData.glyph.path;
        //Modify underlying opentype data - be sure to invert to glyph space
        var idx=0;  
        var idy=0;
        if(pointType != "bbox" && pointType != "awidth")
        {
          if(event.x > 0  && event.x < panel.drawParams.boxScale)
          {
            selection.attr("cx", event.x);
            idx=x.invert(event.dx);
          }
          if(event.y > 0 && event.y < panel.drawParams.boxScale)
          {
            selection.attr("cy", event.y);
            idy=y.invert(-1*event.dy);
          }
        }

        var startIndex = index*5;

        switch(pointType)
        {
          case "start":
            glyphData.glyph.strokeData[index].start.x += idx;
            glyphData.glyph.strokeData[index].start.y += idy;
          break;
          case "end":
            glyphData.glyph.strokeData[index].end.x += idx;
            glyphData.glyph.strokeData[index].end.y += idy;
          break;
          case "cp1":
            glyphData.glyph.strokeData[index].cp1.x += idx;
            glyphData.glyph.strokeData[index].cp1.y += idy;
          break;
          case "cp2":
            glyphData.glyph.strokeData[index].cp2.x += idx;
            glyphData.glyph.strokeData[index].cp2.y += idy;
          break;
          case "awidth":
            if(event.x > 0 && event.x < panel.drawParams.boxScale)
              {
                var bbox = opentypePath.getBoundingBox();
                if(event.x >= x(bbox.x2))
                {
                  selection.attr("cx", event.x);
                  glyphData.glyph.advanceWidth = event.x / panel.drawParams.boxScale * GLYPH_SCALE;
                  d3.select(element.parentNode).select("line.awidth").attr("x1", event.x).attr("x2", event.x);     
                }
              }
            break;
          case "bbox":
            var bbox = opentypePath.getBoundingBox(); 
            if(event.x > 0 && event.x < panel.drawParams.boxScale - x(bbox.x2 - bbox.x1))
            {
              selection.attr("cx", event.x);
              idx=x.invert(event.dx);
            }    
            if(event.y < panel.drawParams.boxScale && event.y > 0 + y(bbox.y2 - bbox.y1))
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
            for(var i =0; i<glyphData.glyph.strokeData.length;i++)
            {
              glyphData.glyph.strokeData[i].start.x += idx;
              glyphData.glyph.strokeData[i].start.y += idy; 
              glyphData.glyph.strokeData[i].end.x += idx;
              glyphData.glyph.strokeData[i].end.y += idy;
              if(glyphData.glyph.strokeData[i].hasOwnProperty('cp1'))
              {
                glyphData.glyph.strokeData[i].cp1.x += idx;
                glyphData.glyph.strokeData[i].cp1.y += idy;
              }
              if(glyphData.glyph.strokeData[i].hasOwnProperty('cp2'))
              {
                glyphData.glyph.strokeData[i].cp2.x += idx;
                glyphData.glyph.strokeData[i].cp2.y += idy;
              }
            }
            var newGlyph = glyphToStrokes(glyphData.glyph);
            var transGlyph = d3.select(element.parentNode).datum(newGlyph);
            
            //Manually uppdate the new path
            transGlyph.selectAll("path")
              .data(function(d, i) { return d.strokes; })
                .attr("d", function(d) 
                { var newPath = strokeInterpret(d.contours, x, y); return newPath; });
            //initGlyphData(transGlyph, x, y, panel);
          break;
          default:
            console.log("Point type not recognized");
        }

        if(pointType !== "bbox" && pointType !== "aWidth")
        {
          var gg = glyphData.glyph.strokeData[index];
          var strokeType = gg.type;
          var stroke;
          var path = {};
          var newPath = new opentype.Path();
          switch(strokeType)
          {
            case 'L':
              stroke = panel.generator.generateLine(gg.start, gg.end);
              break;
            case 'Q':
              stroke = panel.generator.generateQuadratic(gg.start, gg.cp1, gg.end);
              path.cp1Pos = stroke[5];
              path.cp1Neg =  stroke[6];
              break;
            case 'C':
              stroke = panel.generator.generateCubic(gg.start, gg.cp1, gg.cp2, gg.end);
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

          copyStroke(glyphData.glyph.strokeData[index], opentypePath, selection.datum(), index);

          var dGlyphs = d3.select(element.parentNode);
          //Manually update the new path
          dGlyphs.selectAll("path")
            .filter(function(d, i) { return i === index;})
              .attr("d", function(d) 
                { var pp = strokeInterpret(d.contours, x, y); return pp; })
              .style("fill-opacity", 1);

          var box = glyphData.glyph.path.getBoundingBox();
          dGlyphs.select("circle.bbox")
            .attr("cx", function(d) { return x(box.x1) })
            .attr("cy", function(d) { return y(GLYPH_SCALE-box.y1) });
          var boundingLines = dGlyphs.selectAll("line.bounds").data(function(d, i) 
                              { 
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

          var aWidth = dGlyphs.select("circle.awidth");
          if(x(box.x2) > aWidth.attr("cx"))
          {
            aWidth.attr("cx", x(box.x2 ));
            var aLine = dGlyphs.select("line.awidth")
                        .attr("x1", x(box.x2 ))
                        .attr("x2", x(box.x2 ))
          }
        }
      }

      //Flip y point for computer graphics fuckery - float y value
function MirrorY(y)
{
  return GLYPH_SCALE - y;
}

      /*function parseGlyph(text)
      {
        //text = push first letter out 'M'
        var glyphPath = new opentype.Path();
        var pathList = []; 
        var colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'orange', 'purple', 'grey'];
  
        while(text[0] != 'Z' && text.length > 0)
        {
          var newPath;
          switch(text[0])
          {
            case 'L':
              newparseLine(text);
            break;
            case 'Q':
              parseQuadratic(text);
            break;
            case 'C':
              parseCubic(text);
            break;
            default:
              console.log("Failed to parse glyph string");
            break;
          }

          var colorIndex = Math.floor(Math.random() * colors.length);
          newPath.color = colors[colorIndex];
          colors.splice(colorIndex, 1);
      
          pathList.push(newPath);
        }
        var glyph = new opentype.Glyph(
        {
          name: 'glyph '+counter,
              unicode: counter,
              index: counter,
              advanceWidth: GLYPH_SCALE,
              path: glyphPath
        });
        return glyph;
      }*/