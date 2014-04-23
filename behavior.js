/**
 * Created by terrydonaghe on 3/18/14.
 */
$(document).ready(function() {
    var seriesUrl = "http://gateway.marvel.com:80/v1/public/series/";
    var comicsPageSize = 9;

    $('#getCharacterSeries').click(function() {
       getCharacterSeries();
    });

    function getCharacterSeries() {
        $('#SeriesCovers').empty();
        $('#ComicsCovers').empty();
        setCurrentPageNumber($("#series"), 1);

        setApiUrl($('#series'), buildCharactersUrl());

        $.get(buildCharactersUrl())
            .done(function(response){
                $('#character').data('data-id', response.data.results[0].id);
                if(response.data.results[0].series.available === 0) {
                    alert("No results found.");
                    return;
                }
                setTotalNumberOfPages($('#series'), response.data.results[0].series.available);
                setUpPagination(getTotalNumberOfPages($('#series')), $('#series'));
                setApiUrl($('#series'), response.data.results[0].series.collectionURI + '?orderBy=startYear&');
                setCurrentPageNumber($('#series'), 1);
                getPageOfComics($('#series'));
            });
    }

    function getPageOfComics(seriesOrComics) {
        turnOnLoadingIndicator(seriesOrComics);
        $.get(buildPageUrl(seriesOrComics))
            .done(function(response){
                seriesOrComics.find('.covers').empty();
                $.each(response.data.results, function(index, value){
                    seriesOrComics.find('.covers').append(getPopulatedComicInfoDiv(value).data('data-seriesId', value.id));
                });
                turnOffLoadingIndicator(seriesOrComics);

                setPageInfo(seriesOrComics);
            });
    }

    function getCharactersSeriesComics(characterId, seriesId){
        $('#ComicsCovers').empty();
        setApiUrl($('#comics'), seriesUrl + seriesId + "/comics?characters=" + characterId + "&orderBy=issueNumber&noVariants=true");
        if(characterId && seriesId){
            $.get(getApirUrl($('#comics')) + "&limit=" + comicsPageSize + "&" + userKey)
                .done(function(response){
                    setCurrentPageNumber($('#comics'), 1);
                    setUpPagination(response.data.total, $('#comics'));
                    $.each(response.data.results, function(index, value) {
                        $('#ComicsCovers').append(getPopulatedComicInfoDiv(value));
                    })
                })
        }
    }

    function getPopulatedComicInfoDiv(value) {
        var comicInfo = $('<div class="comicInfo"/>');
        comicInfo.attr('title', value.title).append($('<img>').attr('src', value.thumbnail.path + '/portrait_xlarge.jpg'));
        comicInfo.data('fullSizeImage', value.thumbnail.path + '/portrait_uncanny.jpg');
        comicInfo.data('id', value.id);
        setComicInfoClick(comicInfo);
        return comicInfo;
    }

    $('.prevPage').click(function() {
        var seriesOrComics = $(this).closest('.comicsContainer');
        if (getCurrentPageNumber(seriesOrComics) === 1)
            return;

        decrementCurrentPageNumber(seriesOrComics);

        getPageOfComics(seriesOrComics);
    });

    $('.nextPage').click(function() {
        var seriesOrComics = $(this).closest('.comicsContainer');
        if(getCurrentPageNumber(seriesOrComics) + 1 > getTotalNumberOfPages(seriesOrComics))
            return;
        incrementCurrentPageNumber(seriesOrComics);

        getPageOfComics(seriesOrComics);
    });

    function getCurrentPageNumber(seriesOrComics) {
        return seriesOrComics.data('currentPageNumber');
    }

    function buildCharactersUrl() {
        var charactersUrl = "http://gateway.marvel.com:80/v1/public/characters";
        return charactersUrl + "?name=" + $('#character').val() + "&" + userKey;
    }

    function setCurrentPageNumber(seriesOrComics, pageNumber) {
        seriesOrComics.data('currentPageNumber', pageNumber);
    }

    function getTotalNumberOfPages(seriesOrComics) {
        return seriesOrComics.data('totalNumberOfPages');
    }

    function setTotalNumberOfPages(seriesOrComics, totalNumberOfPages){
        seriesOrComics.data('totalNumberOfPages', totalNumberOfPages);
    }

    function getApirUrl(seriesOrComics) {
        return seriesOrComics.data('apiUrl');
    }

    function setApiUrl(seriesOrComics, url) {
        seriesOrComics.data('apiUrl', url);
    }

    function decrementCurrentPageNumber(seriesOrComics) {
        setCurrentPageNumber(seriesOrComics, getCurrentPageNumber(seriesOrComics) - 1);
    }

    function incrementCurrentPageNumber(seriesOrComics) {
        setCurrentPageNumber(seriesOrComics, getCurrentPageNumber(seriesOrComics) + 1);
    }

    function setPageInfo(seriesOrComics) {
        seriesOrComics.find('.pageNumber').text(getCurrentPageNumber(seriesOrComics) + "/" +
            getTotalNumberOfPages(seriesOrComics));
    }

    function setUpPagination(totalNumberOfSeries, seriesOrComics) {
        setTotalNumberOfPages(seriesOrComics, getNumberOfPages(totalNumberOfSeries));
        setPageInfo(seriesOrComics);
    }


    function buildPageUrl(seriesOrComics){
        return getApirUrl(seriesOrComics) + getQuestionMarkOrAmpersand(getApirUrl(seriesOrComics)) +
            "&limit=" + comicsPageSize +
            "&offset=" + calculatePageOffset(seriesOrComics) + "&" + userKey;
    }

    function calculatePageOffset(seriesOrComics){
        var currentPageNumber = getCurrentPageNumber(seriesOrComics);
        return comicsPageSize * (currentPageNumber - 1);
    }

    function getQuestionMarkOrAmpersand(apiUrl) {
        if(apiUrl.indexOf('?') !== -1)return '&';
        return '?';
    }

    function getNumberOfPages(totalNumberOfSeries) {
        var leftOver = totalNumberOfSeries % comicsPageSize;
        var pages = Math.floor(totalNumberOfSeries / comicsPageSize);
        if (leftOver > 0) {
            pages++;
        }
        return pages;
    }

    function setComicInfoClick(comicInfo){
        comicInfo.click(function() {
            if($(this).parents('#series').length > 0){
                getCharactersSeriesComics($('#character').data('data-id'), comicInfo.data('data-seriesId'));
                return;
            }

            $.get('http://gateway.marvel.com:80/v1/public/comics/' + comicInfo.data('id') + '?' + userKey)
                .done(function(response) {
                    var comicDetails = createComicDetails();
                    setComicDetailsContent(response, comicInfo.attr('title'), comicInfo.data('fullSizeImage'), comicDetails);
                    setComicDetailsPositioning(comicDetails);
                    $('#comics').append(comicDetails);
                });
        });
    }

    function createComicDetails(){
        var comicDetails = $('<div class="comicDetails" />');
        comicDetails.click(function() {
            $('body').find('.comicDetails').remove();
        });

        return comicDetails;
    }

    function setComicDetailsPositioning(comicDetails) {
        var covers = $('#comics').find('.covers');
        var divPosition = covers.position();

        comicDetails.css({position: 'fixed', top: divPosition.top, left: divPosition.left, opacity: 1.0, zIndex: '1', backgroundColor: 'white'});
    }

    function setComicDetailsContent(response, comicTitle, imageUrl, comicDetails){

        var description = response.data.results[0].description;
        var readerAnchor = createReaderAnchor(response);
        var detailsAnchor = createDetailsAnchor(response);
        var onSaleDateInfo = createOnSaleDateInfo(response);

        comicDetails.append($('<div>').html(comicTitle + '<br/>' + description + onSaleDateInfo + detailsAnchor + readerAnchor));
        comicDetails.append($('<img>').attr('src', imageUrl));
    }

    function createOnSaleDateInfo(response){
        var onSaleDate = $.grep(response.data.results[0].dates, function(object){
            return object.type === 'onsaleDate';
        });

        return onSaleDate.length > 0 ? '<br/>On sale:' + new Date(onSaleDate[0].date).toDateString() : '';
    }

    function createDetailsAnchor(response){
        var detailsUrl = $.grep(response.data.results[0].urls, function(object){
            return object.type === 'detail';
        });

        return detailsUrl.length > 0 ? '<br/><a href="' + detailsUrl[0].url + '" target="_blank" >Details</a>' : '';
    }

    function createReaderAnchor(response){
        var readerUrl = $.grep(response.data.results[0].urls, function(urlObject){
            return urlObject.type === 'reader';
        });

        return readerUrl.length > 0 ? '<br/><a href="' + readerUrl[0].url + '" target="_blank" >READ IT</a>' : '';
    }

    function turnOnLoadingIndicator(seriesOrComics) {
        var indicatorDiv = $('<div class="loadingDiv"/>');
        var covers = seriesOrComics.find('.covers');
        var divPosition = covers.position();
        indicatorDiv.css({position: 'absolute', top: divPosition.top, left: divPosition.left, opacity: '0.2', zIndex: '1', height: covers.height(), width: covers.width(), backgroundColor: 'blue' });
        seriesOrComics.append(indicatorDiv);
    }

    function turnOffLoadingIndicator(seriesOrComics) {
        seriesOrComics.find('.loadingDiv').remove();
    }
});