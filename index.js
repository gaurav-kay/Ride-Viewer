let map;
let isStarted = false;
let marker;
let rider;
let lats 
let lons 
let eles 
let times 
let timestamps

window.addEventListener("load", (event) => {
    mapboxgl.accessToken = API_KEY

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: {lat: 20.5937, lon: 78.9629},
        zoom: 3
    })
})

function loadMap(fileContent) {
    // map = new mapboxgl.Map({
    //     container: 'map',
    //     style: 'mapbox://styles/mapbox/streets-v12',
    // })  // making this map object again may cause problems, ideally we should use same map object throughout i think

    var gpx = new gpxParser()
    gpx.parse(fileContent)
    let geoJSON = gpx.toGeoJSON();

    const points = gpx.tracks[0].points
    
    lats = []
    lons = []
    eles = []
    times = []
    timestamps = []
    for (const point of points) {
        lats.push(point.lat)
        lons.push(point.lon)
        eles.push(point.ele)
        times.push(point.time)
        timestamps.push(new Date(point.time).getTime())
    }

    let latWidth = Math.max(...lats) - Math.min(...lats)
    let lonWidth = Math.max(...lons) - Math.min(...lons)
    let bottomLeft = {
        lat: (Math.min(...lats) - 0.2 * latWidth), 
        lon: (Math.min(...lons) - 0.2 * lonWidth)
    }
    let topRight = {
        lat: (Math.max(...lats) + 0.2 * latWidth), 
        lon: (Math.max(...lons) + 0.2 * lonWidth)
    }

    console.log(bottomLeft, topRight)

    if (!map) {
        console.log("Map not initialised yet")
    }

    map.fitBounds([bottomLeft, topRight])

    map.addSource('route', {
        'type': 'geojson',
        'data': geoJSON
    })

    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#F00',
            'line-width': 8
        }
    })

    document.getElementById("bottomControlsDiv").style.display = "block"; // or "flex" or whatever display value you want

    setupRide()
}

function setupRide() {
    let range = document.getElementById("speedRange")

    range.min = Math.min(...timestamps)
    range.max = Math.max(...timestamps)
    range.value = range.min

    rider = document.createElement('img')
    rider.id = "riderId"
//     rider.innerHTML = `
//     <div style="width: 50px; height: auto;">
//     <svg
//      version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 365 560" enable-background="new 0 0 365 560" xml:space="preserve" style="width: 100%; height: 100%;">
//         <g>
//             <path fill="#00AEEF" d="M182.9,551.7c0,0.1,0.2,0.3,0.2,0.3S358.3,283,358.3,194.6c0-130.1-88.8-186.7-175.4-186.9   C96.3,7.9,7.5,64.5,7.5,194.6c0,88.4,175.3,357.4,175.3,357.4S182.9,551.7,182.9,551.7z M122.2,187.2c0-33.6,27.2-60.8,60.8-60.8   c33.6,0,60.8,27.2,60.8,60.8S216.5,248,182.9,248C149.4,248,122.2,220.8,122.2,187.2z"/>
//         </g>
//     </svg>
// </div>
//    `
    rider.style.backgroundImage = `url(https://placekitten.com/g/50/50/)`;
    rider.style.width = `50px`;
    rider.style.height = `50px`;
    rider.style.backgroundSize = '100%';

    // rider = document.createElement('img')
    // rider.id = "riderId"
    // rider.src = "./download.jpg"
    // rider.style.width = `50px`;
    // rider.style.height = `50px`;

    marker = new mapboxgl.Marker(rider)
    .setLngLat({lat: lats[0], lon: lons[0]})
    .addTo(map);
}

async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target.result;
            resolve(content);
        };

        reader.onerror = (event) => {
            reject(event.error);
        };

        reader.readAsText(file);
    });
}

document.getElementById('fileInput').addEventListener('change', async (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
        try {
            document.getElementById("fileSelectedName").innerText = selectedFile.name

            const fileContent = await readFileAsText(selectedFile);
            // const fileContent = await fetch('C:\\Projects\\RideViewer\\2023-08-14_14_Aug_2023_4_03_33_pm.gpx')
            // fileContent = fileContent.text()
            loadMap(fileContent)
        } catch (error) {
            console.error('Error reading the file:', error);
        }
    }
})

// document.getElementById('startStop').addEventListener('click', (event) => {
//     if (!isStarted) {
//         // on change of range listener, update the timeout interval thing and pass it here maybe
//         moveMarker()
//     } else {
//         stopMarker()
//     }
// })

document.getElementById('speedRange').addEventListener('input', (event) => {
    let timestamp = event.target.value

    let closestTimestampIdx = 0 
    while (timestamps[closestTimestampIdx] < timestamp) {
        closestTimestampIdx += 1
    }
    console.log("closest timestamp index", closestTimestampIdx)

    marker.setLngLat({lat: lats[closestTimestampIdx], lon: lons[closestTimestampIdx]})
    .addTo(map);
})


