import * as d3 from 'd3';
var Victor = require('victor')
var opentype = require('opentype.js') //this may not be correct

var GLYPH_SCALE = 1024;

export default class Generator
{
	constructor(min=2, max=5, width=50, wvariance=0, length=100, lvariance=0, connect=0, size = 100)
	{
		this.line = true;
		this.quadratic = true;
		this.cubic = true;
		this.minStrokes = min;
		this.maxStrokes = max;
		if(length > GLYPH_SCALE/2)
			length = GLYPH_SCALE/2;
		this.strokeLength = length;
		if(lvariance > length)
			lvariance = length;
		this.lengthVariance = lvariance;
		
		if(width > length)
			width = length;
		this.strokeWidth = width;
		if(wvariance > width)
			wvariance = width;
		this.widthVariance = wvariance;
		
		this.connectProbability = connect;

		this.trainingDataSize = size;
	}

	generateGlyph(counter)
	{
		var glyphPath = new opentype.Path();
		var pathList = []; 
		var colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'orange', 'purple'];
		var strokes = ['L', 'Q', 'C'];
		var strokeNum = Math.floor(this.minStrokes + this.maxStrokes * Math.random());

		for(var i = 0; i < strokeNum; i++)
		{
			var randomStroke = Math.floor(Math.random() * 3);
			while(!this.checkStroke(randomStroke))
				randomStroke = Math.floor(Math.random() * 3);
			randomStroke = strokes[randomStroke];
			var varyW = Math.random() * this.widthVariance;
			var varyL = Math.random() * this.lengthVariance;
			var strokeWidth, strokeLength;
			if(Math.floor(Math.random()*2))
			{
				strokeWidth = this.strokeWidth + varyW;
			}else
				{strokeWidth = this.strokeWidth - varyW;}

			if(Math.floor(Math.random()*2))
			{
				strokeLength = this.strokeLength + varyL;
			}else
				{strokeLength = this.strokeLength - varyL;}

			var connect = Math.random();
			var newPath;
			if(connect <= this.connectProbability && i != 0) //Always connect when connectProbability === 1
			{
				newPath = this.addStroke(randomStroke, strokeWidth, strokeLength, pathList[i-1].end);
			}
			else
				newPath = this.addStroke(randomStroke, strokeWidth, strokeLength);

			var colorIndex = Math.floor(Math.random() * colors.length);
			newPath.color = colors[colorIndex];
			colors.splice(colorIndex, 1);
			
			pathList.push(newPath);
			addContour(newPath, glyphPath);
		}
		var glyph = new opentype.Glyph(
		{
			name: 'glyph '+counter,
	        unicode: counter,
	        index: counter,
	        advanceWidth: GLYPH_SCALE,
	        path: glyphPath
		});
		glyph.strokeData = pathList;
		glyph.backend = false;
		return glyph;
	}

	checkStroke(int)
	{
		switch(int)
		{
			case 0:
			return this.line;
			break;
			case 1:
			return this.quadratic;
			break;
			case 2:
			return this.cubic;
			break;
			default:
			console.log("invalid stroke");
		}
		return;
	}

	addStroke(selection, width, length, connect=null)
	{
		var stroke = [];
		var path = new opentype.Path();
		switch(selection)
		{
			case 'L':
				var line = this.baseLine(connect);
				path.start = line[0];
				path.end = line[1];
				stroke = this.generateLine(line[0], line[1]);
				break;
			case 'Q':
				var quad = this.baseQuadratic(connect);
				path.start = quad[0];
				path.cp1 = quad[1];
				path.end = quad[2];
				stroke = this.generateQuadratic(quad[0], quad[1], quad[2]);
				path.cp1Pos = stroke[5];
				path.cp1Neg =  stroke[6];
				break;
			case 'C':
				var cube = this.baseCubic(connect);
				path.start = cube[0];
				path.cp1 = cube[1];
				path.cp2 = cube[2];
				path.end = cube[3];
				stroke = this.generateCubic(cube[0], cube[1], cube[2], cube[3]);
				path.cp1Pos = stroke[5];
				path.cp1Neg = stroke[6];
				path.cp2Pos = stroke[7];
				path.cp2Neg = stroke[8];
				break;
			default:
				console.log("Invalid stroke generation selection");
		}
		
		path.type = stroke[0];
		path.startPos = stroke[1];
		path.startNeg = stroke[2];
		path.endPos = stroke[3];
		path.endNeg = stroke[4];

		return path;
	}

	baseLine(connectStart=null)
	{
		var start;
		if(connectStart != null)
			start = connectStart;
		else
			start = this.RandomInsideBox();
		var end = start.clone();
		var dir = this.RandomInsideBox().subtract(end).normalize();
		dir.multiply(new Victor(this.strokeLength, this.strokeLength));
		end.add(dir);
		while(!this.InsideBox(end))
		{
			end = start.clone();
			dir = this.RandomInsideBox().subtract(end).normalize();
			dir.multiply(new Victor(this.strokeLength, this.strokeLength));
			end.add(dir);
		}
		return [start, end];
	}

	generateLine(start, end)
	{
		var offset = end.clone();
		offset.subtract(start);
		var perpLine = perpindicularLine(offset, true).normalize();

		var spos = start.clone();
		spos.add(new Victor(perpLine.x * this.strokeWidth, perpLine.y * this.strokeWidth));
		var sneg = start.clone();
		sneg.add(new Victor(perpLine.x * -this.strokeWidth, perpLine.y * -this.strokeWidth));

		var pos = end.clone();
		pos.add(new Victor(perpLine.x * this.strokeWidth, perpLine.y * this.strokeWidth));
		var neg = end.clone();
		neg.add(new Victor(perpLine.x * -this.strokeWidth, perpLine.y * -this.strokeWidth));

		return ['L', spos, sneg, pos, neg];
	}

	baseQuadratic(connectStart=null)
	{
		var line = this.baseLine(connectStart);
		var cp = this.RandomInsideBox();
		var qLength = quadraticLength(line[0], cp, line[1]);
		while(qLength > this.strokeLength*2)
		{
			cp = this.RandomInsideBox();				
			qLength = quadraticLength(line[0], cp, line[1]);
		}
		return [line[0], cp, line[1]];
	}

	//Returns four points and a command 'Q'
	generateQuadratic(start, control_point, end)
	{	
		var perpStart = perpindicularQuadratic([start, control_point, end], 0, true).normalize();

		var spos = start.clone();
		spos.add(new Victor(perpStart.x * this.strokeWidth, perpStart.y * this.strokeWidth));
		var sneg = start.clone();
		sneg.add(new Victor(perpStart.x * -this.strokeWidth, perpStart.y * -this.strokeWidth));

		var perpEnd = perpindicularQuadratic([start, control_point, end], 1, true).normalize();

		var pos = end.clone();
		pos.add(new Victor(perpEnd.x * this.strokeWidth, perpEnd.y * this.strokeWidth));
		var neg = end.clone();
		neg.add(new Victor(perpEnd.x * -this.strokeWidth, perpEnd.y * -this.strokeWidth));

		var perpCp = perpStart.clone();	//Not sure if valid
		perpCp.add(perpEnd);
		perpCp = perpCp.normalize();
		var cpos = control_point.clone();
		cpos.add(new Victor(perpCp.x * this.strokeWidth * 2, perpCp.y * this.strokeWidth * 2));
		var cneg = control_point.clone();
		cneg.add(new Victor(perpCp.x * -this.strokeWidth * 2, perpCp.y * -this.strokeWidth * 2));

		return ['Q', spos, sneg, pos, neg, cpos, cneg, perpStart, perpEnd, perpCp];	
	}

	baseCubic(connectStart=null)
	{
		var line = this.baseLine(connectStart);
		var cp1 = this.RandomInsideBox();
		var cp2 = this.RandomInsideBox();

		while(flatCubicLength([line[0], cp1, cp2, line[1]]) > this.strokeLength*2)
		{
			cp1 = this.RandomInsideBox();
			cp2 = this.RandomInsideBox();
		}

		return [line[0], cp1, cp2, line[1]];
	}

	//Returns six points and a command 'C'
	generateCubic(start, control_point_1, control_point_2, end)
	{
		var spos = start.clone();
		var sneg = start.clone();
		
		var pos = end.clone();
		var neg = end.clone();

		var c1pos = control_point_1.clone();
		var c1neg = control_point_1.clone();
		var c2pos = control_point_2.clone();
		var c2neg = control_point_2.clone();

		var startPerp = 
		perpindicularCubic([start, control_point_1, control_point_2, end], 0, true).normalize();

		spos.add(new Victor(startPerp.x * this.strokeWidth, startPerp.y * this.strokeWidth));
		sneg.add(new Victor(startPerp.x * -this.strokeWidth, startPerp.y * -this.strokeWidth));

		var endPerp = 
		perpindicularCubic([start, control_point_1, control_point_2, end], 1, true).normalize();
		
		pos.add(new Victor(endPerp.x * this.strokeWidth, endPerp.y * this.strokeWidth));	
		neg.add(new Victor(endPerp.x * -this.strokeWidth, endPerp.y * -this.strokeWidth));

		var cpPerp = startPerp.clone();
		cpPerp.add(endPerp).normalize();

		c1pos.add(new Victor(cpPerp.x * this.strokeWidth, cpPerp.y * this.strokeWidth));	
		c1neg.add(new Victor(cpPerp.x * -this.strokeWidth, cpPerp.y * -this.strokeWidth));
		
		c2pos.add(new Victor(cpPerp.x * this.strokeWidth, cpPerp.y * this.strokeWidth));	
		c2neg.add(new Victor(cpPerp.x * -this.strokeWidth, cpPerp.y * -this.strokeWidth));
		
		return ['C', spos, sneg, pos, neg, c1pos, c1neg, c2pos, c2neg];
	}

	trainGlyph()
	{
		var strokeList = ['M']; 
		var strokeNum = this.minStrokes + Math.floor(this.maxStrokes * Math.random());
		var strokes = ['L', 'Q', 'C'];
		for(var i = 0; i < strokeNum; i++)
		{
			var randomStroke = Math.floor(Math.random() * 3);
			while(!this.checkStroke(randomStroke))
				randomStroke = Math.floor(Math.random() * 3);
			randomStroke = strokes[randomStroke];
			
			var varyW = Math.random() * this.widthVariance;
			var varyL = Math.random() * this.lengthVariance;
			var strokeWidth, strokeLength;
			if(Math.floor(Math.random()*2))
			{
				strokeWidth = this.strokeWidth + varyW;
			}else
				{strokeWidth = this.strokeWidth - varyW;}

			if(Math.floor(Math.random()*2))
			{
				strokeLength = this.strokeLength + varyL;
			}else
				{strokeLength = this.strokeLength - varyL;}

			var stroke;
			strokeList.push(randomStroke);
			var connect = Math.random();	
			if(connect <= this.connectProbability && i != 0) //Always connect when connectProbability === 1
			{
				var lastEnd = strokeList[i-1];
				switch(randomStroke)
				{
					case 'L':
						stroke = this.baseLine(lastEnd[1]);
						break;
					case 'Q':
						stroke = this.baseQuadratic(lastEnd[2]);
						break;
					case 'C':
						stroke = this.baseCubic(lastEnd[3]);
						break;
					default:
						stroke = [];
				}
			}
			else
			{
				switch(randomStroke)
				{
					case 'L':
						stroke = this.baseLine();
						break;
					case 'Q':
						stroke = this.baseQuadratic();
						break;
					case 'C':
						stroke = this.baseCubic();
						break;
					default:
						stroke = [];
				}	
			}
			strokeList.push.apply(strokeList, stroke); //apply push to each new stroke element to add to list
		}

		return strokeList;
	}

	//Parse JSON transfer of glyphs stored from the back-end
	//Takes the parsed JSON and outputs a list of glyphs for rendering on the orthographer
	parseJSON(json, counter)
	{
	  var count = 0;
	  var glyphCount = counter;
	  var currentGlyph;
	  var pathList;
	  var drawGlyphs = [];
	  
	  while(count < json.length)
	  {
	  	var json_glyph = json[count];
	  	var glyphPath = new d3.path();
	    
	    pathList = [];
	    
	    for (var i = 0; i < json_glyph.contours.length; i++)
	    {
	    	var contour = json_glyph.contours[i];
	    	var path = new d3.path();
	    	var cp = null;
	    	for(var s = 0; s < contour.strokes.length; s++)
	    	{
	    		//Assuming strokes always loop in order
	    		var stroke = contour.strokes[s];
	    		var type = stroke.type;
				
	    		if(type === 'L')
	    		{
	    			var point = stroke.point;	
	    			path.lineTo(point.x/50, (GLYPH_SCALE - point.y)/50);
	    			glyphPath.lineTo(point.x, point.y);
	    		}
	    		else if(type === 'C' || type === 'Q')
	    		{
	    			if(type === 'C')
	    			{	cp = stroke.point;	}
	    			else
	    			{
	    				var point = stroke.point;
	    				path.quadraticCurveTo(cp.x/50, (GLYPH_SCALE - cp.y)/50, point.x/50, (GLYPH_SCALE - point.y)/50);
	    				glyphPath.quadraticCurveTo(cp.x, cp.y, point.x, point.y);
	    			}
	    		}
	    		else //type === 'M' || type === 'G'
	    		{
	    			var point = stroke.point;
	    			path.moveTo(point.x/50, (GLYPH_SCALE - point.y)/50);
	    		}	
	    	}
	    	path.closePath();
	    	pathList.push({clockwise: contour.orientation, path:path});
	    }

	    //The path list stores the strokes for separate rendering and editing
	    currentGlyph = new opentype.Glyph(
	        {
	          	name: json_glyph.name,
	              unicode: json_glyph.unicode,
	              index: glyphCount,
	              advanceWidth: json_glyph.advance_width,
	              path: glyphPath
	        });
	    drawGlyphs.push(currentGlyph);
	    currentGlyph.strokes = pathList;
	    currentGlyph.backend = true;
	    glyphCount++;
	    count++;
	  }
	  return (drawGlyphs)
	}

	//Parse pseudo-JSON format output from AI modules
	parseGlyphs(text, counter) 
	{                                  
	  var count = 0;
	  var glyphCount = counter;
	  var currentGlyph;
	  var pathList;
	  var glyphs = JSON.parse(text);
	  var drawGlyphs = [];
	  while(count < glyphs.length)
	  {
	    if(glyphs[count] === 'M') //Start a new glyph
	    {
	      var glyphPath = new opentype.Path();
	      pathList = [];
	      currentGlyph = new opentype.Glyph(
	        {
	          name: 'glyph '+glyphCount,
	              unicode: glyphCount,
	              index: glyphCount,
	              advanceWidth: GLYPH_SCALE,
	              path: glyphPath
	        });

	      currentGlyph.strokeData = pathList;
	      drawGlyphs.push(currentGlyph);
	      glyphCount++;
	      count++;
	    }
	    else
	    {
	      var path = new opentype.Path();
	      if(glyphs[count] === 'L') //Parse x -y
	      {
	        var line = [new Victor(glyphs[count+1].x, glyphs[count+1].y), 
	                    new Victor(glyphs[count+2].x, glyphs[count+2].y)];
	        var stroke = this.generateLine(line[0], line[1])
	        path.start = line[0];
	        path.end = line[1];
	        count += 3;
	      }
	      else if(glyphs[count] === 'Q') //Parse x -y -cp1
	      {
	        var quad = [new Victor(glyphs[count+1].x, glyphs[count+1].y), 
	                    new Victor(glyphs[count+2].x, glyphs[count+2].y),
	                    new Victor(glyphs[count+3].x, glyphs[count+3].y)];
	        var stroke = 
	          this.generateQuadratic(quad[0], quad[1], quad[2]);
	        path.start = quad[0];
	        path.cp1 = quad[1];
	        path.end = quad[2];
	        path.cp1Pos = stroke[5];
	        path.cp1Neg =  stroke[6];
	        count += 4;
	      }
	      else if(glyphs[count] === 'C') //Parse x - y- cp1 - cp2
	      {
	        var cube =  [new Victor(glyphs[count+1].x, glyphs[count+1].y), 
	                    new Victor(glyphs[count+2].x, glyphs[count+2].y),
	                    new Victor(glyphs[count+3].x, glyphs[count+3].y),
	                    new Victor(glyphs[count+4].x, glyphs[count+4].y)];
	        var stroke = this.generateCubic(cube[0], cube[1], cube[2], cube[3]);
	        path.start = cube[0];
	        path.cp1 = cube[1];
	        path.cp2 = cube[2];
	        path.end = cube[3];
	        path.cp1Pos = stroke[5];
	        path.cp1Neg = stroke[6];
	        path.cp2Pos = stroke[7];
	        path.cp2Neg = stroke[8];
	        count += 5;
	      }
	      else
	      {
	        console.log("Parsing error, check your data");
	      }
	      
	      path.type = stroke[0];
	      path.startPos = stroke[1];
	      path.startNeg = stroke[2];
	      path.endPos = stroke[3];
	      path.endNeg = stroke[4];
	      pathList.push(path);
	      addContour(path, currentGlyph.path);
	    }
	  }
	  return(drawGlyphs);
	};

	RandomInsideBox()
	{
		return (new Victor().randomize(new Victor(this.strokeWidth, GLYPH_SCALE-this.strokeWidth), 
										new Victor(GLYPH_SCALE-this.strokeWidth, this.strokeWidth)));
	}

	InsideBox(point) 
	{
		return (point.x > this.strokeWidth && point.x < GLYPH_SCALE-this.strokeWidth && 
				point.y > this.strokeWidth && point.y < GLYPH_SCALE-this.strokeWidth);
	}
}

	

//Takes <opentype.js> Path object, a stroke object of up to three vectors containing 
//the point and two control points for curves, and a code to describe the line

//Likely belongs in another file orthographer.js maybe
export function addContour(path, glyphPath)
{
	glyphPath.moveTo(path.startNeg.x, path.startNeg.y);
	glyphPath.lineTo(path.startPos.x, path.startPos.y);

	switch(path.type)
	{
		case 'L':
			glyphPath.lineTo(path.endPos.x, path.endPos.y);
			glyphPath.lineTo(path.endNeg.x, path.endNeg.y);
			glyphPath.lineTo(path.startNeg.x, path.startNeg.y);
			break;
		case 'Q':
			glyphPath.quadTo(path.cp1Pos.x, path.cp1Pos.y, path.endPos.x, path.endPos.y);
			glyphPath.lineTo(path.endNeg.x, path.endNeg.y);
			glyphPath.quadTo(path.cp1Neg.x, path.cp1Neg.y, path.startNeg.x, path.startNeg.y);
			break;
		case 'C':
			glyphPath.curveTo(path.cp1Pos.x, path.cp1Pos.y, 
								path.cp2Pos.x, path.cp2Pos.y,
									path.endPos.x, path.endPos.y);
			glyphPath.lineTo(path.endNeg.x, path.endNeg.y);
			glyphPath.curveTo(path.cp2Neg.x, path.cp2Neg.y, 
								path.cp1Neg.x, path.cp1Neg.y,
									path.startNeg.x, path.startNeg.y);			
			break;
		default:
			console.log("Invalid stroke symbol");
	}
}

function perpindicularLine(vector, left_handed)
{
	if(left_handed)
		return new Victor(vector.y, -vector.x);
	else
		return new Victor(-vector.y, vector.x);	
}

//Takes a list of three points (start, control, end)
function perpindicularQuadratic(quad, t, handed)
{
	var quadTang = quadraticDerivative(quad, t);
	return perpindicularLine(quadTang, handed);
}

//Takes a list of three points and returns the tangent line
//at the point t [0, 1] along the curve
function quadraticDerivative(quad, t)
{
	var start = quad[0].clone();
	var cp = quad[1].clone();
	var end = quad[2].clone();

	cp.subtract(start);
	var t1 = new Victor(cp.x * 2 * (1-t), cp.y * 2 * (1-t));
	end.subtract(quad[1]);
	var t2 = new Victor(end.x * 2 * t, end.y * 2 * t);

	return t1.add(t2);
}

function quadraticLength(p0, p1, p2) {
    var a = new Victor(
        p0.x - 2 * p1.x + p2.x,
        p0.y - 2 * p1.y + p2.y
    );
    var b = new Victor(
        2 * p1.x - 2 * p0.x,
        2 * p1.y - 2 * p0.y
    );
    var A = 4 * (a.x * a.x + a.y * a.y);
    var B = 4 * (a.x * b.x + a.y * b.y);
    var C = b.x * b.x + b.y * b.y;

    var Sabc = 2 * Math.sqrt(A+B+C);
    var A_2 = Math.sqrt(A);
    var A_32 = 2 * A * A_2;
    var C_2 = 2 * Math.sqrt(C);
    var BA = B / A_2;

    return (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
}

//Takes a list of three points (start, control1, control2, end)
function perpindicularCubic(cube, t, handed)
{
	var cubeTang = cubicDerivative(cube, t);
	return perpindicularLine(cubeTang, handed);
}

//Takes a list of three points and returns the tangent line
//at the point t [0, 1] along the curve
function cubicDerivative(cube, t)
{
	var start = cube[0].clone();
	var cp1 = cube[1].clone();
	var cp2 = cube[2].clone();
	var end = cube[3].clone();

	cp1.subtract(start);
	var t1 = new Victor(cp1.x * 3*(1-(t*t)), cp1.y * 3*(1-(t*t)));

	cp2.subtract(cube[1]);
	var t2 = new Victor((6*(1-t))*t*cp2.x,(6*(1-t))*t*cp2.y);

	end.subtract(cube[2]);
	var t3 = new Victor(3*t*t*end.x, 3*t*t*end.y);

	return t1.add(t2.add(t3));
}

function flatCubicLength(points)
{
	var sum = 0;
	for(var i = 1; i < 4; i++)
	{
		sum += points[i-1].distance(points[i]);
	}
	return sum;
}