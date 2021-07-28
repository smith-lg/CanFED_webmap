//Initialise map
mapboxgl.accessToken = 'pk.eyJ1IjoibGdzbWl0aCIsImEiOiJja29uNGs1cmYwYnN2MnBwMzM2cDQyN2NrIn0.lZvjUUK8Pc2JDq0tuSRrKQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/lgsmith/ckoyrp6z71apc17ph5d5zlcno',
    center: [-105, 58],
    zoom: 3,
    maxBounds: [
        [-180, 30], // Southwest
        [-25, 84]  // Northeast
    ],
});

//Add data on map load
var mapLabels

map.on('load', function () {
    var baseLayers = map.getStyle().layers;
    // Find index of first symbol layer in map style (placenames)
    for (var i = 0; i < baseLayers.length; i++) {
        if (baseLayers[i].type === 'symbol') {
            mapLabels = baseLayers[i].id;
        break;
        }
    }
    
    map.addSource('provterr', {
        type: 'vector',
        url: 'mapbox://lgsmith.azke7iua'
    });

    map.addSource('cma', {
        type: 'vector',
        url: 'mapbox://lgsmith.dnnjhud1'
    });

    map.addSource('da', {
        type: 'vector',
        url: 'mapbox://lgsmith.5gmnldcy'
    });

});

//Add search control to map overlay
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca"
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

//Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//Event listeners for major city buttons - zoom to area on click
document.getElementById('tobutton').addEventListener('click', function () {
    map.flyTo({
        center: [-79.347015, 43.651070],
        zoom: 10,
        essential: true
    });
});

document.getElementById('vanbutton').addEventListener('click', function () {
    map.flyTo({
        center: [-123.116226, 49.246292],
        zoom: 10,
        essential: true
    });
});

document.getElementById('monbutton').addEventListener('click', function () {
    map.flyTo({
        center: [-73.561668, 45.508888],
        zoom: 10,
        essential: true
    });
});

document.getElementById('calbutton').addEventListener('click', function () {
    map.flyTo({
        center: [-114.0719, 51.0447],
        zoom: 10,
        essential: true
    });
});

document.getElementById('returnbutton').addEventListener('click', function () {
    map.flyTo({
        center: [-105, 58],
        zoom: 3,
        essential: true
    });
});

//Load layer based on submitted form values
//Set variables
var activeLayerID
var button = document.getElementById("submitButton")
var legend
var popup

//Call functions on submit button click
button.onclick = function () {
    //remove current layer, legend and popup on each submit click
    if (map.getLayer(activeLayerID)) {
        map.removeLayer(activeLayerID);
        legend.style.display = 'none';
        if (popup){
            popup.remove()
        }
      }

    //Input values  
    var boundaryValue = document.getElementById('boundary').value
    var outletValue = document.getElementById('foodoutlet').value
    activeLayerID = boundaryValue+outletValue

    if (!boundaryValue || !outletValue) {
        text = "Please select boundary and retail outlet type";
        } else {
            text = "";
            loadLayer(activeLayerID, boundaryValue, outletValue)
            legend.style.display = 'block';
            setPopup(activeLayerID, boundaryValue, outletValue)
        } 

        document.getElementById("message").innerHTML = text;
}

//Define functions
//Load layer based on user inputs
function loadLayer(layerid, boundary, outlet) {

    //Create styles and set legend for each input value
    if (boundary == 'provterr') {
        style = {
            'fill-color': {
                'property': outlet,
                'stops': [
                    [500, '#f8ddaf'],
                    [50000, '#f2af78'],
                    [100000, '#ec9a5f'],
                    [150000, '#e58143'],
                    [205000, '#d25304'],
                ],    
            },
            'fill-opacity': 0.75
        };
        legend = document.getElementById('provterr-legend');

    } else if (boundary == 'cma') {
        style = {
            'fill-color': {
                'property': outlet,
                'stops': [
                    [200, '#cef8b9'],
                    [20000, '#8cd06d'],
                    [40000, '#70b950'],
                    [60000, '#58a437'],
                    [80000, '#408f1e'],
                ]
            },
            'fill-opacity': 0.75
        };
        legend = document.getElementById('cma-legend');

    } else if (boundary == 'da') {
        style = {
            'fill-color': {
                'property': outlet,
                'stops': [
                    [0, '#9ae2ef'],
                    [10, '#65a5b8'],
                    [20, '#316e87'],
                ]
            },
            'fill-opacity': 0.75
        };
        legend = document.getElementById('da-legend');
    }

    //Add layer to map
    map.addLayer({
        'id': layerid,
        'type': 'fill',
        'source': boundary,
        'source-layer': 'canada_' + boundary,
        'layout': {
            'visibility': 'visible'
        },
        'paint': style
    },
    //Show layer beneath placename labels
    mapLabels
    );
}


//Set popup to show based on active layer
function setPopup(layerid, boundary, outlet){

    //Change cursor to pointer when mouse is over active layer
    map.on('mouseenter', layerid, function () {
        map.getCanvas().style.cursor = 'pointer';
        });

    // Change back to pointer when the mouse leaves active layer
    map.on('mouseleave', layerid, function () {
        map.getCanvas().style.cursor = '';
        });

    //Pop-up content
    map.on('click', layerid, function (e) {
        
        if (boundary == 'provterr') {
            boundarydesc = "Province: " + e.features[0].properties.PRNAME
        } else if (boundary == 'cma') {
            boundarydesc = "Province: " + e.features[0].properties.PRNAME + '<br>'+
            "CMA: " + e.features[0].properties.CMANAME
        } else if (boundary == 'da') {
            boundarydesc = "Province: " + e.features[0].properties.PRNAME + '<br>'+
            "CMA: " + e.features[0].properties.CMANAME + '<br>'+
            "DAUID: " + e.features[0].properties.DAUID
    }
        
        if (outlet == 'cafe') {
            outletdesc = 'cafes'
            outlettype = e.features[0].properties.cafe
        } else if (outlet == 'supmarket') {
            outletdesc = 'supermarkets'
            outlettype = e.features[0].properties.supmarket
        } else if (outlet == 'fastfood') {
            outletdesc = 'fast food outlets'
            outlettype = e.features[0].properties.fastfood
        }
        
        //create new popup window at location where active layer is clicked
        popup = new mapboxgl.Popup()
        popup.setLngLat(e.lngLat)
        popup.setHTML(
              '<p>' + boundarydesc + '<br>' +
              "Population: tbc" + '<br>' +
              "Total " + outletdesc + ": " + outlettype + '</p>'
              )
              popup.addTo(map);
            });
}

