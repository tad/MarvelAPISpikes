/**
 * Created by terrydonaghe on 3/22/14.
 */
$(document).ready(function() {

    var userKey = "apikey=b958258344feb4298d7a2da3af4007eb&ts=1&hash=269faa5563bca14071f728f4276b3df5";
    var charactersUrl = "http://gateway.marvel.com:80/v1/public/characters";
    var characterPageSize = 100;

    var lineNumber = 1;

    $('#getCharacters').click(function() {
        getListOfCharacters();
    });

    function getListOfCharacters() {
        $('#characters').empty();

        $.get(charactersUrl + "?limit=" + characterPageSize + "&" + userKey)
            .done(function(response){
                addLineForEveryCharacter(response.data.results, response.data.total)
            })
    }

    function addLineForEveryCharacter(charactersInfoList, totalCharacters) {
        $.each(charactersInfoList, function(index, value) {
            addLine(value.name);
        });

        getRestOfCharacters(totalCharacters);
    }

    function getRestOfCharacters(totalCharacters) {
        var pages = getNumberOfPages(totalCharacters);
        if(pages > 1){
            getPagesOfCharacters(1, pages);
        }
    }

    function getNumberOfPages(totalCharacters) {
        var leftOver = totalCharacters % characterPageSize;
        var pages = Math.floor(totalCharacters / characterPageSize);
        if (leftOver > 0) {
            pages++;
        }
        return pages;
    }

    function getPagesOfCharacters(currentPage, totalPages){
        $.get(charactersUrl + "?limit=" + characterPageSize + "&offset=" + (characterPageSize * (currentPage)) + "&" + userKey)
            .done(function(response){
                $.each(response.data.results, function(index, value) {
                    addLine(value.name);
                });
                currentPage++;
                if(currentPage <= totalPages){
                    getPagesOfCharacters(currentPage, totalPages);
                }
            })
    }

    function addLine(text) {
        $('#characters').append($('<li/>').text(lineNumber + ": " + text));
        lineNumber++;
    }

});