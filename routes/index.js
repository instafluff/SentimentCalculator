var express = require('express');
var fs = require('fs');
var request = require('request');
var unfluff = require('unfluff');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	const url = req.query[ "url" ];
	if( url === undefined ) {
		return res.sendStatus( 500 );
	}

	calculateSentiment( url, ( text, score ) => {
		res.render('index', { title: 'SENTIENT SENTIMENT CALCULATOR FROM THE MATRIX', text: text, score: score.toFixed(2) });
	})
});

function calculateSentiment( url, callback ) {
	fs.readFile( "AFINN-111.txt", (err, data) => {
		let words = data.toString().split('\n');
		let wordsWithFriends = {};
		for( var i = 0, len = words.length; i < len; i++ ) {
			let parts = words[ i ].split('\t');
			wordsWithFriends[ parts[ 0 ] ] = parseInt( parts[ 1 ] );
		}

		request.get( url, ( e, r, body ) => {
			var content = unfluff(body);
			var allTheWords = content["text"].split(' ');
			let totalScore = 0, totalCount = 0;
			for( var i = 0, len = allTheWords.length; i < len; i++ ) {
				var currentWord = allTheWords[ i ];
				if( wordsWithFriends[ currentWord ] ) {
					totalScore += wordsWithFriends[ currentWord ];
					totalCount++;
				}
			}
			callback( content["text"], ( totalScore / totalCount + 5 ) / 10 );
		});
	});
}

module.exports = router;
