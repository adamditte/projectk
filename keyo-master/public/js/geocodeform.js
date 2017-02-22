;(function(exports,undefined){
// var form = $('#GeoCodeForm')

var source   = $("#SearchResultTemplate").html();
var template = Handlebars.compile(source);
// form.find('button[name="search-button"]').bind('click',function(){
//     $.post('/api/geocode/lookup',form.serialize()).done(function(res){
//         console.log(res);
//         if(res.length)
//         {
//             var html = template(res[0]);
//             $('#Result').html(html);
//         }
//     })
// });
// This example adds a search box to a map, using the Google Place Autocomplete
      // feature. People can enter geographical searches. The search box will return a
      // pick list containing a mix of places and predicted search terms.

      // This example requires the Places library. Include the libraries=places
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

      function initAutocomplete() {console.log("word");
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 38.489864, lng: -81.3446884},
          zoom: 13,
          mapTypeId: 'roadmap'
        });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
       // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport. This is an event handler for when bounds change.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place. This is an event handler for when places change
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];
        
          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          var resultDiv = $('#Result');
          resultDiv.empty();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            // Creates marker icon
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place. This is adding to the markers array.
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
            // This is where the data actually comes from. 
            $.post('/api/geocode/lookup',{address:place.formatted_address}).done(function(googleResult){
              console.log(googleResult); 
              var gAddress = googleResult[0];
              var zillowParams = {
                address:gAddress.streetNumber + ' ' + gAddress.streetName,
                citystatezip:gAddress.zipcode
              };

            $.post('/api/zillow/getdeepsearchresults', zillowParams).done(function(zillowResult){
            $.post('/api/census-geocode/lookup',{address:place.formatted_address,returntype:'geographies'}).done(function(censusResult){
                
           var myResult = {
             countyName:censusResult.geographies.Counties[0].NAME,
             censusTract:censusResult.geographies["2010 Census Blocks"][0].TRACT,
             censusBlock:censusResult.geographies["2010 Census Blocks"][0].BLOCK,
             zip:censusResult.addressComponents.zip,
             threeDigitZip:censusResult.addressComponents.zip.toString().substring(0,3),
             stateName:censusResult.geographies.States[0].BASENAME,
             cityName:censusResult.addressComponents.city
           };
           var templateData = $.extend(googleResult[0], myResult);
           //appends the address to the resultDiv
                $($.parseHTML(template(templateData))).appendTo(resultDiv);
                $($.parseHTML('<h3>Census Data</h3><pre>'+ JSON.stringify(censusResult, null, 2)+'</pre>')).appendTo(resultDiv);
                $($.parseHTML('<h3>Google Api Data</h3><pre>'+ JSON.stringify(googleResult, null, 2)+'</pre>')).appendTo(resultDiv);
                $($.parseHTML('<h3>Zillow Api Data</h3><pre>'+ JSON.stringify(zillowResult, null, 2)+'</pre>')).appendTo(resultDiv);;
                
                
              });
            
            });
            
             });
             });
            
        
        
          map.fitBounds(bounds);
        });
      }
      exports.initAutocomplete = initAutocomplete;
})(window);