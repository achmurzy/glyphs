# glyphs
React app for glyph generator

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

Goals:
-Editable font glyphs
-Learnable font glyph export
-Seamless integration of algorithmic glyphs and font glyphs into alphabet

File structure
|
|---src
	|
	|--resources
	|	|--images
	|	|--fonts
	|	
	|--index.js - top level assets imports and app routing
	|--Component file names are capitalized
	|--Helper file names are lowercased

FEATURES:
(The below are feature requests, not really 'TO-DO')
-Add 'continue' functionality to glyphsFull button to browse entirety of font file
-Add start, end control metadata to font glyphs. May need to back-compute offsets to recreate the stroke abstraction
-Make sure font glyphs export appropriately as our machine-readable format
-Building alphabet to font file
-Various quality-of-life animations for visualizing stroke order, etc.
-Explore embedding Unity builds with package 'react-unity-webgl'
-Add videos of mobile apps, and links to where people can find those

TO-DO:
-Hard-code the visualizer for accepting input in the format of the AI module's (normalized for box sizes)

-Change front end-glyph representation to allow editing 'paths' rather than the abstraction of 'strokes' (lines, quads, cubics). This will lead to a much more
fine-grained representation to match the level of detail in font glyphs. Automatically generating these types of closed curves poses a separate problem. We're focusing on human-generated font data

-Work on a mechanism for loading AI-generated symbols from the back-end into and alphabet to be re-packaged (with specified metadata) and sent to the backend for font file generation.
	-See below Alphabet JSON specification

-Find JSON format for every level of representation:
	-Alphabet
	-Glyph - change training glyph generator to export richer glyph representation
	-Font - DONE: can import font symbols from the backend

-Some kind of brute force approach mapping Unicode ranges based on language might be most expedient. Remember your goal: learning font styles. How can we be sure all fonts are unicode compliant? Probably just visual inspection and data cleaning to ensure we have the symbols we think we do. Other tools exist for this:
https://fontdrop.info/
There are ways to detect support for languages by indexing the glyph space. Find out how:
https://www.alphabet-type.com/tools/charset-checker/	
Contains an API for checking - this is probably our go-to, might be best performed on the backend with python packages

-What if we just downloaded a gigantic Unicode representation, even though this would represent a single styling? We could map styles based on this.
See: https://stackoverflow.com/questions/34732718/why-isnt-there-a-font-that-contains-all-unicode-glyphs
Best we can do: 
https://www.google.com/get/noto/
https://github.com/adobe-fonts
https://www.fontspace.com/category/unicode

## A first approach at deep learning fonts and some romanized fonts
https://github.com/erikbern/deep-fonts
https://drive.google.com/file/d/0B0GtwTQ6IF9AU3NOdzFzUWZ0aDQ/view

DONE:
--Add content from ember canopy routes to your site
--Make a navbar as your home route to consistently render a header (Bootstrap)
--Manage glyph app size to render footer properly (or find a way to overlay)

---Use React Bootstrap frameworks and don't ever write your own UI code again
	-Change remaining custom UI elements over to reactstrap (Button, Input, Toggles, Sliders do something clean and custom)
		-Pull UI elements out of the SVG rendering element and make an overlay
		--NOPENOPENOPENOPE dont add things that dont change functionality - aint broke dont fix it

--Write a function to load a glyph from the server and visualize it in a panel. Change visualization formatting for the normalized, standardized RNN-training formats
-Write a parser that can extract 'relevant' glyphs from an arbitrary font file. How do we know which indices contain symbols for which the font was created?
-Feed in data from the font header to an API that can determine the relevant ranges - part of a pre-processing step that might be better on the back-end (because we're only doing this to make a font database, essentially) - NOTE: this was handled on the backend using UNICODE codepoints/blocks, which define symbol set semantics (e.g. language groups, etc.)


The purpose of this web framework should be a flexible interactive tool for creating false languages. The basis of this flexibility is the asynchronous nature of the front and back-end, where we can continuously iterate modeling our training data, which is itself continuously iterated on the front-end. These two workflows can be performed almost simultaneously