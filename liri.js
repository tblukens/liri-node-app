require("dotenv").config();
//require fs for reading, writing, appending files...
var fs = require("fs");
//imports keys
var keys = require("./keys.js");
//imports spotify-node-api
var Spotify = require('node-spotify-api');
//inputs api keys into spotify
var spotify = new Spotify(keys.spotify);
// request for getting api info
var request = require('request');
// moment to format dates
var moment = require('moment');
// Use chalk to add a bit of style to the command line
const chalk = require('chalk');
//remove node and file path from process.argv
process.argv.splice(0, 2);
//get the command 
var command = process.argv.shift();
// all other arguments typed:
var argInfo = process.argv.join(" ");

// console.log(command + '\n' + argInfo)


// switch to decide which command is input:
switch (command) {
    case 'concert-this':
        console.log(argInfo)
        //if no artist is input then let the user know they need to input an artist
        if (argInfo == "") {
            console.log("Please type an artist or bands name after the concert-this command.")
        } else {
            console.log(chalk.bgYellowBright.blue("Okay, running "+command.toUpperCase()+" searching for "+argInfo.toUpperCase()))
            concertThis(argInfo);
        }
        break;

    case 'spotify-this-song':
        // if no song is input into args then default to the sign...
        if (argInfo == "") {
            argInfo = "The Sign Ace of Base";
            console.log(chalk.bgYellowBright.blue("Okay, running "+command.toUpperCase()+" searching for "+argInfo.toUpperCase()))
            spotifyThisSong(argInfo);
        } else {
            console.log(chalk.bgYellowBright.blue("Okay, running "+command.toUpperCase()+" searching for "+argInfo.toUpperCase()))
            spotifyThisSong(argInfo);
        }
        break;


    case 'movie-this':
        if (argInfo == "") {
            argInfo = "Mr. Nobody";
            console.log(chalk.bgYellowBright.blue("Okay, running "+command.toUpperCase()+" searching for "+argInfo.toUpperCase()))
            movieThis(argInfo);
        } else {
            movieThis(argInfo);
        }

        break;

    case 'do-what-it-says':
        fs.readFile("random.txt", "utf8", function (error, data) {
            if (error) {
                return console.log(error);
            }
            var dataArr = data.split(",");
            var txtCommand = dataArr[0];
            var txtInput = dataArr[1];
            
            console.log(chalk.bgYellowBright.blue("Okay, running "+txtCommand+" searching for "+txtInput.toUpperCase()))

            doWhatItSays(txtCommand, txtInput)
        })
        break;


    default:
        console.log(chalk.bgHex('#ff8000').bold.black("Please use one of the following commands:\n") + chalk.cyanBright("concert-this (artist)\nspotify-this-song (song)\nmovie-this (movie name)\ndo-what-it-says"))
        break;

}

// concert function for getting artist venue information
function concertThis(artist) {
    request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp", function (error, response, body) {
        if (error) {
            console.log('error:', error);
        };
        //if response is returned and status code is good to GO
        if (response && response.statusCode === 200) {
            appendLogFile("\n~~~\nCONCERT-THIS FUNCTION: " + artist.toUpperCase() + "\n~~~\n");
            // Make body readable:
            var canRead = JSON.parse(body);
            canRead.forEach(element => {
                //get venue name
                var venue = element.venue.name;
                //venue location City, State
                var venueLoc = element.venue.city + ", " + element.venue.region;
                //format the date
                var date = moment(element.datetime).format("MM/DD/YYYY");
                // "MMMM DD, YYYY @ hh:mm A" -- I like this better!

                var all = "Venue Name: " + venue +
                    "\nVenue Location: " + venueLoc +
                    "\nDate: " + date + "\n~\n";

                var allChalk = chalk.hex('#000000').bgHex('#2299ff')("Venue Name:") + " " + chalk.hex('#2299ff')(venue) +
                    chalk.hex('#000000').bgHex('#2299ff')("\nVenue Location:") + " " + chalk.hex('#2299ff')(venueLoc) +
                    chalk.hex('#000000').bgHex('#2299ff')("\nDate:") + " " + chalk.hex('#2299ff')(date + "\n~\n");
                //Log out useful info:
                console.log(allChalk)
                appendLogFile(all);

            });
        };
    })
}

// spotify function to get song name and artist info
function spotifyThisSong(song) {
    spotify.search({
        type: 'track',
        query: song
    }, function (err, data) {
        // error log if error
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        // otherwise... get artist and track info:
        var firstResult = data.tracks.items[0];
        var artist = firstResult.artists[0].name.toUpperCase();
        var songName = firstResult.name;
        var preview = firstResult.preview_url;
        var albumName = firstResult.album.name;
        //----------------------------------------

        var all = "Artist(s): " + artist +
            "\nSong Name: " + songName +
            "\nPreview URL: " + preview +
            "\nAlbum Name: " + albumName;

        var allChalk = chalk.hex('#000000').bgHex('#2299ff')("Artist(s):") + " " + chalk.hex('#2299ff')(artist) +
            chalk.hex('#000000').bgHex('#2299ff')("\nSong Name: ") + " " + chalk.hex('#2299ff')(songName) +
            chalk.hex('#000000').bgHex('#2299ff')("\nPreview URL: ") + " " + chalk.hex('#2299ff').underline(preview) +
            chalk.hex('#000000').bgHex('#2299ff')("\nAlbum Name: ") + " " + chalk.hex('#2299ff')(albumName);

        console.log(allChalk)
        appendLogFile("\n~~~\nSPOTIFY-THIS-SONG FUNCTION: " + song.toUpperCase() + "\n~~~\n" + all);
    })
}

// omdb function to get movie info
function movieThis(movie) {
    request("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=" + keys.omdb.id, function (error, response, body) {

        if (error) {
            return console.log(error)
        }

        if (!error && response.statusCode === 200) {

            var theMovie = JSON.parse(body);

            var movieTitle = theMovie.Title;
            var movieYear = theMovie.Year;
            var imdbRating = theMovie.Ratings[0].Source + " rating: " + theMovie.Ratings[0].Value;
            var rtRating = theMovie.Ratings[1].Source + " rating: " + theMovie.Ratings[1].Value;
            var imdbRatingChalk = chalk.hex('#000000').bgHex('#2299ff')(theMovie.Ratings[0].Source + " rating:")+" " + chalk.hex('#2299ff')(theMovie.Ratings[0].Value);
            var rtRatingChalk = chalk.hex('#000000').bgHex('#2299ff')(theMovie.Ratings[1].Source + " rating:")+" " + chalk.hex('#2299ff')(theMovie.Ratings[1].Value);
            var country = theMovie.Country;
            var languages = theMovie.Language;
            var plot = theMovie.Plot;
            var actors = theMovie.Actors;

            var all = "Title: " + movieTitle +
                "\nYear: " + movieYear +
                "\n" + imdbRating +
                "\n" + rtRating +
                "\nCountry: " + country +
                "\nLanguages: " + languages +
                "\nPlot: " + plot +
                "\nActors: " + actors
                // chalk.hex('#000000').bgHex('#2299ff')("\nAlbum Name: ") + " " + chalk.hex('#2299ff')(albumName)
            var allChalk = chalk.hex('#000000').bgHex('#2299ff')("Title:") + " " + chalk.hex('#2299ff')(movieTitle) +
                chalk.hex('#000000').bgHex('#2299ff')("\nYear:") + " " + chalk.hex('#2299ff')(movieYear) +
                "\n" + imdbRatingChalk +
                "\n" + rtRatingChalk +
                chalk.hex('#000000').bgHex('#2299ff')("\nCountry:") + " " + chalk.hex('#2299ff')(country) +
                chalk.hex('#000000').bgHex('#2299ff')("\nLanguages:") + " " + chalk.hex('#2299ff')(languages) +
                chalk.hex('#000000').bgHex('#2299ff')("\nPlot:") + " " + chalk.hex('#2299ff')(plot) +
                chalk.hex('#000000').bgHex('#2299ff')("\nActors:") + " " + chalk.hex('#2299ff')(actors)

            console.log(allChalk);

            appendLogFile("\n~~~\nMOVIE-THIS FUNCTION: " + movie.toUpperCase() + "\n~~~\n" + all);
        }
    });

}

//function to call random.txt and get command and input from the file
function doWhatItSays(command, input) {
    appendLogFile("\n~~~ ~~~\nDO-WHAT-IT-SAYS:");
    //switch getting command from file
    switch (command) {
        case 'concert-this':
            console.log(input)
            //if no artist is input then let the user know they need to input an artist
            if (input == "") {
                console.log("Please type an artist or bands name after the concert-this command.")
            } else {
                concertThis(input);
            }
            break;

        case 'spotify-this-song':
            // if no song is input into args then default to the sign...
            if (input == "") {
                spotifyThisSong("The Sign Ace of Base");
            } else {
                spotifyThisSong(input);
            }
            break;


        case 'movie-this':
            if (input == "") {
                movieThis("Mr. Nobody");
            } else {
                movieThis(input);
            }

            break;


        default:
            console.log("Please use one of the following commands:\nconcert-this (artist)\nspotify-this-song (song)\nmovie-this (movie name)\ndo-what-it-says")
            break;

    }
}

// function to append the information to log.txt file
function appendLogFile(log) {
    fs.appendFile("log.txt", log, function (err) {
        if (err) {
            console.log(err);
        }

    })
}