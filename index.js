// Copyright (C) 2014, 12 Quarters Consulting
// All rights reserved.
// Redistribution and use are permitted under the modified BSD license
// available at https://raw.githubusercontent.com/MaxMotovilov/ipl.js/master/LICENSE

var	urlParse = require( 'url' );

module.exports = function( config, mapper ) {
	var ipl = require( 'ipl' )( config );

	if( !mapper )
		mapper = function( ipl, input, env, is_script, args /*, req, resp */ ) {
			return ipl( input, env, is_script, args );
		}

	return function( req, resp ) {
		var original_url = req.originalUrl || req.url,
			url = urlParse.parse( req.url ),
			is_script = /\.js$/.test( url.pathname );

		resp.setHeader( 'Content-Type', is_script ? 'text/javascript' : 'text/html' );

		try {
			mapper( 
				ipl, url.pathname.substr(1).replace( /\.[^./]*$/, '' ), 
				{ request: { headers: req.headers, url: ( url.host ? '' : (url.protocol||"http:") + "//" + req.headers.host || '' ) + original_url } },
				is_script, [], req, resp 
			)
				.on( 'error', fail )
				.pipe( resp );

		} catch( err ) {
			fail( err );
		}
		
		function fail( err ) {
			resp.setHeader( 'Content-Type', 'text/plain' );
			resp.writeHead( err.lookupFailure ? 404 : 500 );
			resp.end( err.message );
		}
	}
}

