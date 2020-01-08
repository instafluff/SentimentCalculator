const fs = require( "fs" );
const unfluff = require( "unfluff" );
let words = fs.readFileSync( "AFINN-111.txt" ).toString().split( "\n" );
let wordsWithFriends = {};
for( var i = 0, len = words.length; i < len; i++ ) {
	let parts = words[ i ].split('\t');
	wordsWithFriends[ parts[ 0 ] ] = parseInt( parts[ 1 ] );
}

const SentientWeb = require( "webwebweb" );
SentientWeb.APIs[ "/" ] = async ( qs, body ) => {
	if( qs.url ) {
		let sentiment = await calculateSentiment( qs.url );
		return {
			url: qs.url,
			score: sentiment.score,
			vader: sentiment.vader,
			text: sentiment.text,
		};
	}
	return {
		error: "Missing URL",
	};
};
SentientWeb.Run( 8001 );

const fetch = require( "node-fetch" );
const vader = require('vader-sentiment');
async function calculateSentiment( url ) {
	let body = await fetch( url ).then( r => r.text() );
	var content = unfluff( body );
	var allTheWords = content[ "text" ].split( ' ' );
	let totalScore = 0, totalCount = 0;
	for( var i = 0, len = allTheWords.length; i < len; i++ ) {
		var currentWord = allTheWords[ i ];
		if( wordsWithFriends[ currentWord ] ) {
			totalScore += wordsWithFriends[ currentWord ];
			totalCount++;
		}
	}
	const intensity = vader.SentimentIntensityAnalyzer.polarity_scores( content[ "text" ] );
	console.log( intensity );
	return {
		text: content["text"],
		vader: intensity,
		score: ( totalScore / totalCount + 5 ) / 10,
	};
}
