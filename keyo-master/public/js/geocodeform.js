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

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
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
        console.log(places[0]);
          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          var resultDiv = $('#Result');
          resultDiv.empty();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
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
            $.post('/api/geocode/lookup',{address:place.formatted_address}).done(function(res){
               // console.log(res);
              //appends the address to the resultDiv
                $($.parseHTML(template(res[0]))).appendTo(resultDiv);
                $($.parseHTML('<h3>Google Api Data</h3><pre>'+ JSON.stringify(res, null, 2)+'</pre>')).appendTo(resultDiv);
                window.location.href = '/propertydetail/?googlePlaceId=' + res[0].extra.googlePlaceId;
              });
            $.post('/api/census-geocode/lookup',{address:place.formatted_address,returntype:'geographies'}).done(function(res){
                console.log(res);
                $($.parseHTML('<h3>Census Data</h3><pre>'+ JSON.stringify(res, null, 2)+'</pre>')).appendTo(resultDiv);
           
              });
            });
        
        
          map.fitBounds(bounds);
        });
      }
      exports.initAutocomplete = initAutocomplete;
})(window);