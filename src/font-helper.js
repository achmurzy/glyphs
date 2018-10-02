import {GLYPH_SCALE} from './Orthographer'
var opentype = require('opentype.js')

function loadFont(fontName, panel)
{
  opentype.load(fontName, function(err, font)
  {
    if(err)
    {
      console.log(err);
      return null; 
    }
    {
      panel.showFont(font);  
    }
  });
}

//Mimics function in orthographer.js for making
//glyphs visualizable
export function fontGlyphToStrokes(glyph, color)
{
  var glyphObject = new Object();
  glyphObject.strokes = fontCopyStrokes(glyph.path, color);
  glyphObject.index = glyph.index;
  glyphObject.glyph = glyph;

  return glyphObject;
}

//Mimics function in orthographer.js for making strokes
//on fonts visualizable without being editable - Takes glyph path
function fontCopyStrokes(path, color)
{
  var ind = 0;
  var stroke = new Object();
  stroke.contours = [];
  stroke.color = color;
  var strokeObject = [];
  if(path.commands.length > 0)
  {
    while(path.commands[ind].type != 'Z' || ind > path.commands.length)
    {
      var ss = path.commands[ind];
      stroke.contours.push(ss);
      ind++;
      if(path.commands[ind].type === 'M')
      {
        strokeObject.push(stroke);
        stroke = new Object();
        stroke.color = color;
        stroke.contours = [];
      }  
    } 
  }
  
  return strokeObject;
}

//This function will write the commands in our training data format
//We need to make sure the starting point is listed explicitly like our
//other training data. This is always the end point of the previous stroke
function fontTrainingData(font)
{
  var train = []
  var glyphs = font.glyphs.glyphs;
  for(var i = 0; i < glyphs.length; i++)
  {
    var path = glyphs[i].path;
    var ind = 0;
    if(path.commands.length > 0)
    {
      while(path.commands[ind].type != 'Z' || ind > path.commands.length)
      {
        var ss = path.commands[ind];
        train.push.apply(train, ss);
        ind++;
      } 
    }
  }
  var dataString = JSON.stringify(train);
  download(dataString, "font_train.txt");
}

function buildFont(panel, fontName="codex_") //Take glyphs in the alphabet panel and write to opentype
{
  var codex = [];
  /*alphabetPanel.group.selectAll("g.font").each(function(d, i) 
  {
    console.log("Adding glyph: " + i);
    d.glyph.index = i;
    codex.push(d.glyph);
  });*/

  var date = new Date();
  if(codex.length > 0)
  {
    var font = new opentype.Font({
    familyName: fontName+date.toLocaleString(),
    styleName: 'Medium',
    unitsPerEm: GLYPH_SCALE,
    ascender: GLYPH_SCALE,
    descender: 0,
    glyphs: codex });
  
    console.log(font);

    var fontJSON = JSON.stringify(font, function(key, value)
      {
        if(key === 'font')
          return undefined;
        return value;
      });
    
    if(/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor))
      font.download();
  }
}

//download.js -- danml.com
export function download(data, strFileName, strMimeType) {
  
  var self = window, // this script is only for browsers anyway...
    u = "application/octet-stream", // this default mime also triggers iframe downloads
    m = strMimeType || u, 
    x = data,
    D = document,
    a = D.createElement("a"),
    z = function(a){return String(a);},
    
    
    B = self.Blob || self.MozBlob || self.WebKitBlob || z,
    BB = self.MSBlobBuilder || self.WebKitBlobBuilder || self.BlobBuilder,
    fn = strFileName || "download",
    blob, 
    b,
    ua,
    fr;

  //if(typeof B.bind === 'function' ){ B=B.bind(self); }
  
  if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
    x=[x, m];
    m=x[0];
    x=x[1]; 
  }
  
  
  
  //go ahead and download dataURLs right away
  if(String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)){
    return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
      navigator.msSaveBlob(d2b(x), fn) : 
      saver(x) ; // everyone else can save dataURLs un-processed
  }//end if dataURL passed?
  
  try{
  
    blob = x instanceof B ? 
      x : 
      new B([x], {type: m}) ;
  }catch(y){
    if(BB){
      b = new BB();
      b.append([x]);
      blob = b.getBlob(m); // the blob
    }
    
  }
  
  
  
  function d2b(u) {
    var p= u.split(/[:;,]/),
    t= p[1],
    dec= p[2] == "base64" ? atob : decodeURIComponent,
    bin= dec(p.pop()),
    mx= bin.length,
    i= 0,
    uia= new Uint8Array(mx);

    for(i;i<mx;++i) uia[i]= bin.charCodeAt(i);

    return new B([uia], {type: t});
   }
    
  function saver(url, winMode){
    
    
    if ('download' in a) { //html5 A[download]      
      a.href = url;
      a.setAttribute("download", fn);
      a.innerHTML = "downloading...";
      D.body.appendChild(a);
      setTimeout(function() {
        a.click();
        D.body.removeChild(a);
        if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(a.href);}, 250 );}
      }, 66);
      return true;
    }
    
    //do iframe dataURL download (old ch+FF):
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    if(!winMode){ // force a mime that will download:
      url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
    }
     
  
    f.src = url;
    setTimeout(function(){ D.body.removeChild(f); }, 333);
    
  }//end saver 
    

  if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
    return navigator.msSaveBlob(blob, fn);
  }   
  
  if(self.URL){ // simple fast and modern way using Blob and URL:
    saver(self.URL.createObjectURL(blob), true);
  }else{
    // handle non-Blob()+non-URL browsers:
    if(typeof blob === "string" || blob.constructor===z ){
      try{
        return saver( "data:" +  m   + ";base64,"  +  self.btoa(blob)  ); 
      }catch(y){
        return saver( "data:" +  m   + "," + encodeURIComponent(blob)  ); 
      }
    }
    
    // Blob but not URL:
    fr=new FileReader();
    fr.onload=function(e){
      saver(this.result); 
    };
    fr.readAsDataURL(blob);
  } 
  return true;
}