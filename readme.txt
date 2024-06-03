To run:
1. Install Node.js on the machine set to be the web server. Can be a laptop or any machine.
2. Install git on the machine.
3. The repository is https://github.com/mhartloff/intro-project.git. Clone this repo onto the machine.
4. On the command line type 'npm update' from the code's directory. This will install the depenent libraries and should only have to be done once.
5. Update the file 'server/configuration.js'. It contains options specific to the installed machine.
6. On the command line type 'node .\server\server-main.js'. This will start the server.
7. From a web browser, navigate to 'https://localhost/intro-project.html'. Replace localhost with the IP if installed on a remote server.

Directory Structure
 node_modules	Third party libraries installed by npm.
 public        All public facing files that are available to the client.
  assets       Binary information and reference data
  scripts      Client side libraries that are included in the webpages.
  javascript	The in-house javascript code.
	core			Fundemental classes representing mathematical and geometric concepts like a line or color.
	graphics		A simple custom performant graphics library that renders 3d geometry to the screen.
	util			General data structures like file I/O
 server	      Code that lives only on the client
  certs        The certificates used for the https protocol. 
 

Client-side Libraries
 Update dependent libraries with 'npm update' from the command line. Some client-side libraries are copied from here to the public/scripts folder for simplicity.
 Shouldn't need to update these client side libraries often.
  - Vue: A library which allows simple reactivity of variables on the client side
		- From node_modules/vue/dist, copy to public/scripts 

  - Material Design Icons: A webfont that contains generic icons for use with beufy's b-icon or used independently.
		- npm install @mdi/font
		- get the css file from the page below and place it in public/css
		- copy the folder node_modules/@mid/font/fonts to public/fonts.
		- See https://pictogrammers.com/docs/library/mdi/getting-started/webfont/
		- The icons available are here: https://pictogrammers.com/library/mdil/

  - Buefy: https://github.com/ntohq/buefy-next/tree/main implementation of https://buefy.org/
		- A version of buefy that is compatible with Vue 3. Copy from node_modules/buefy/dist to public/scripts
		- Elements: https://buefy.org/documentation
		- CSS Changes to buefy.css:
		  - 7957d5 -> 5667c6 (primary color - purple -> blue)
		  - 714dd2 -> 4b5dc3 (primary:hover) (-3 Lightness)
		  - 6943d0 -> 4053bf (primary:active) (-5 Lighness)
		  - 121, 87, 213 -> 86, 103, 198 (rgb purple -> blue)

  - Socket.IO: https://socket.io/
		- Allows easy message passing between client and server.
		- The server side on npm is 'socket.io'. The client side is socket.io-client.
		- Client side: copy node_modules/socket.io-client/dist/socket.io.esm.min.js to scripts.

  - Threads.js: https://threads.js.org/
	 	- Server-side only. Encapsulates the native worker_threads and provides additional functionality.


Original Author: Matthew Hartloff - hartlomj@gmail.com


	
