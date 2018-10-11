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

// function to show its running with command and args
function showRunning (command, argInfo){
    console.log(chalk.bgHex('#aa9911').black("| Okay, running "+command.toUpperCase()+" searching for "+argInfo.toUpperCase()+" |"))
}

// switch to decide which command is input:
switch (command) {
    case 'concert-this':
        console.log(argInfo)
        //if no artist is input then let the user know they need to input an artist
        if (argInfo == "") {
            console.log("Please type an artist or bands name after the concert-this command.")
        } else {
            showRunning(command, argInfo);
            concertThis(argInfo);
        }
        break;

    case 'spotify-this-song':
        // if no song is input into args then default to the sign...
        if (argInfo == "") {
            argInfo = "The Sign Ace of Base";
            showRunning(command, argInfo);
            spotifyThisSong(argInfo);
        } else {
            showRunning(command, argInfo);
            spotifyThisSong(argInfo);
        }
        break;


    case 'movie-this':
        if (argInfo == "") {
            argInfo = "Mr. Nobody";
            showRunning(command, argInfo);
            movieThis(argInfo);
        } else {
            showRunning(command, argInfo);
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
            
            showRunning(txtCommand, txtInput)

            doWhatItSays(txtCommand, txtInput)
        })
        break;


    default:
        console.log(chalk.bgHex('#ffff00').black.underline("Please use one of the following commands:\n") + chalk.cyanBright("concert-this (artist)\nspotify-this-song (song)\nmovie-this (movie name)\ndo-what-it-says"))
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

                var allChalk = chalk.hex('aa9911')("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")+
                chalk.hex('#ffffff').bgHex('#1155aa')("\nVenue Name:") + " " + chalk.hex('#ff8300')(venue) +
                    chalk.hex('#ffffff').bgHex('#1155aa')("\nVenue Location:") + " " + chalk.hex('#ff8300')(venueLoc) +
                    chalk.hex('#ffffff').bgHex('#1155aa')("\nDate:") + " " + chalk.hex('#ff8300')(date);
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
        if (preview === null) {
            preview = "SORRY, there is no preview file.";
        }
        //----------------------------------------

        var all = "Artist(s): " + artist +
            "\nSong Name: " + songName +
            "\nPreview URL: " + preview +
            "\nAlbum Name: " + albumName;

        var allChalk = chalk.hex('aa9911')("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n")+
        chalk.hex('#ffffff').bgHex('#1155aa')("Artist(s):") + " " + chalk.hex('#ff8300')(artist) +
            chalk.hex('#ffffff').bgHex('#1155aa')("\nSong Name: ") + " " + chalk.hex('#ff8300')(songName) +
            chalk.hex('#ffffff').bgHex('#1155aa')("\nPreview URL: ") + " " + chalk.hex('#aaff99').underline(preview) +
            chalk.hex('#ffffff').bgHex('#1155aa')("\nAlbum Name: ") + " " + chalk.hex('#ff8300')(albumName)+
            chalk.hex('aa9911')("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

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
            var imdbRatingChalk = chalk.hex('#ffffff').bgHex('#1155aa')(theMovie.Ratings[0].Source + " rating:")+" " + chalk.hex('#ff8300')(theMovie.Ratings[0].Value);
            var rtRatingChalk = chalk.hex('#ffffff').bgHex('#1155aa')(theMovie.Ratings[1].Source + " rating:")+" " + chalk.hex('#ff8300')(theMovie.Ratings[1].Value);
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
                // chalk.hex('#ffffff').bgHex('#1155aa')("\nAlbum Name: ") + " " + chalk.hex('#ff8300')(albumName)
            var allChalk = chalk.hex('aa9911')("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n")+
            chalk.hex('#ffffff').bgHex('#1155aa')("Title:") + " " + chalk.hex('#ff8300')(movieTitle) +
                chalk.hex('#ffffff').bgHex('#1155aa')("\nYear:") + " " + chalk.hex('#ff8300')(movieYear) +
                "\n" + imdbRatingChalk +
                "\n" + rtRatingChalk +
                chalk.hex('#ffffff').bgHex('#1155aa')("\nCountry:") + " " + chalk.hex('#ff8300')(country) +
                chalk.hex('#ffffff').bgHex('#1155aa')("\nLanguages:") + " " + chalk.hex('#ff8300')(languages) +
                chalk.hex('#ffffff').bgHex('#1155aa')("\nPlot:") + " " + chalk.hex('#ff8300')(plot) +
                chalk.hex('#ffffff').bgHex('#1155aa')("\nActors:") + " " + chalk.hex('#ff8300')(actors)+
                chalk.hex('aa9911')("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")

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