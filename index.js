
function loadMap(fileContent) {
    const div = document.getElementById('map')
    div.hidden = false

    mapboxgl.accessToken = 'pk.eyJ1Ijoid29mYWpvNDU3MyIsImEiOiJjbGxjMmtpbGkwZmtoM2NsMXJkYWxxYnY3In0.fEsqwNcZF10YL-4bhA7hqA'

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
    })

    var gpx = new gpxParser()
    gpx.parse(fileContent)
    let geoJSON = gpx.toGeoJSON();

    const points = gpx.tracks[0].points
    
    let lats = []
    let lons = []
    let eles = []
    let times = []
    for (const point of points) {
        lats.push(point.lat)
        lons.push(point.lon)
        eles.push(point.ele)
        times.push(point.time)
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

    map.on('load', () => {
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
    })


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
            const fileContent = await readFileAsText(selectedFile);
            // const fileContent = await fetch('C:\\Projects\\RideViewer\\2023-08-14_14_Aug_2023_4_03_33_pm.gpx')
            // fileContent = fileContent.text()
            loadMap(fileContent)
        } catch (error) {
            console.error('Error reading the file:', error);
        }
    }
});
