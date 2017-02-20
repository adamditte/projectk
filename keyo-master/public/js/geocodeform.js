;(function(exports,undefined){
var form = $('#GeoCodeForm')

var source   = $("#SearchResultTemplate").html();
var template = Handlebars.compile(source);
form.find('button[name="search-button"]').bind('click',function(){
    $.post('/api/geocode/lookup',form.serialize()).done(function(res){
        console.log(res);
        if(res.length)
        {
            var html = template(res[0]);
            $('#Result').html(html);
        }
    });
    return false;
});

})(window);