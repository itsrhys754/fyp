class StationMap {
    constructor() {
        this.mapboxAccessToken = mapboxAccessToken;
        this.map = null;
        this.directions = null;
        this.stationManager = new StationManager();
        this.markerManager = new MarkerManager();
        this.loadingManager = new LoadingManager();
        this.filterManager = new FilterManager();
        
        this.initialize();
    }

    initialize() {
        this.initializeMap();
        this.initializeDirections();
        this.initializeEventListeners();
    }

    initializeMap() {
        this.map = new mapboxgl.Map({
            accessToken: this.mapboxAccessToken,
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-1.1743, 52.3555],
            zoom: 6
        });

        this.map.on('load', () => {
            this.markerManager = new MarkerManager(this.map);
            
        });
    }

    initializeDirections() {
        this.directions = new MapboxDirections({
            accessToken: this.mapboxAccessToken,
            unit: 'metric',
            profile: 'mapbox/driving',
            interactive: true,
            controls: {
                inputs: true,
                instructions: false,
                profileSwitcher: false,
            }
        });

        this.map.addControl(this.directions, 'top-left');
        
        // Add debug logging for the directions events
        this.directions.on('route', (e) => {
            console.log('Directions route event triggered');
            this.handleRouteUpdate(e);
        });
    }

    initializeEventListeners() {
        const stationTypeSelector = document.getElementById('station-type-selector');
        if (stationTypeSelector) {
            stationTypeSelector.addEventListener('change', (e) => {
                this.filterManager.handleStationTypeChange(e, this.stationManager, (routeEvent) => {
                    if (routeEvent && routeEvent.route) {
                        this.handleRouteUpdate(routeEvent);
                    } else {
                        this.markerManager.clearMarkers();
                    }
                });
            });
        }

        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                setTimeout(() => this.updateStations(), 0);
            });
        });

        document.querySelectorAll('.fuel-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const fuelType = e.target.getAttribute('data-fuel-type');
                this.markerManager.setSelectedFuelType(fuelType);
                this.updateStations();
            });
        });
    }

    handleRouteUpdate(e) {
        if (!e || !e.route || !e.route[0]) {
            console.log('No route data available');
            return;
        }

        const route = e.route[0];
        console.log('Processing route update:', route);

        // Clear existing markers
        this.markerManager.clearMarkers();

        // Show loading state
        this.loadingManager.showLoading();

        // Get coordinates and fetch stations
        let coordinates = this.decodeGeometry(route.geometry);
        if (!coordinates || coordinates.length === 0) {
            console.log('No valid coordinates found in route');
            this.loadingManager.hideLoading();
            return;
        }

        // Sample the coordinates
        coordinates = this.sampleCoordinates(coordinates, 20);
        console.log('Sampled coordinates:', coordinates);

        // Determine which API endpoint to use
        const endpoint = this.stationManager.selectedStationType === 'ev' 
            ? '/api/ev-stations/route' 
            : '/api/stations/route';

        // Fetch and update stations
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ coordinates })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                });
            }
            return response.json();
        })
        .then(stations => {
            console.log('Received stations:', stations);
            // Add type information to stations before updating markers
            const stationType = this.stationManager.selectedStationType;
            const stationsWithType = stations.map(station => ({
                ...station,
                type: stationType
            }));
            this.markerManager.updateMarkers(stationsWithType);
        })
        .catch(error => {
            console.error('Error fetching stations:', error);
        })
        .finally(() => {
            this.loadingManager.hideLoading();
        });
    }

    fetchStationsAlongRoute(endpoint, coordinates) {
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ coordinates })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(stations => {
            console.log('Received stations:', stations);
            this.markerManager.updateMarkers(stations);
        })
        .catch(error => {
            console.error('Error fetching stations:', error);
        })
        .finally(() => {
            this.loadingManager.hideLoading();
        });
    }

    // Add these helper methods to the StationMap class
    decodeGeometry(str) {
        var index = 0,
            lat = 0,
            lng = 0,
            coordinates = [],
            shift = 0,
            result = 0,
            byte = null,
            latitude_change,
            longitude_change,
            factor = Math.pow(10, 5);

        // Coordinates have variable length when encoded, so just keep
        // track of whether we've hit the end of the string. In each
        // loop iteration, a single coordinate is decoded.
        while (index < str.length) {
            // Reset shift, result, and byte
            byte = null;
            shift = 0;
            result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            shift = result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            lat += latitude_change;
            lng += longitude_change;

            coordinates.push([lng / factor, lat / factor]);
        }

        return coordinates;
    }

    sampleCoordinates(coordinates, interval) {
        const sampled = [];
        for (let i = 0; i < coordinates.length; i += interval) {
            sampled.push(coordinates[i]);
        }
        // Always include the last coordinate
        if (coordinates.length > 0 && sampled[sampled.length - 1] !== coordinates[coordinates.length - 1]) {
            sampled.push(coordinates[coordinates.length - 1]);
        }
        return sampled;
    }

    updateStations() {
        if (this.stationManager.lastRouteGeometry) {
            const coordinates = RouteUtils.decodePolyline(this.stationManager.lastRouteGeometry);
            this.showStationsAlongRoute(coordinates);
        }
    }

    handleStationTypeChange(event) {
        const stationType = event.target.value; // 'petrol' or 'ev'
        this.stationManager.setStationType(stationType);

        // Toggle visibility of filter groups
        const evTypes = document.getElementById('ev-types');
        const fuelTypes = document.getElementById('fuel-types');
        
        if (stationType === 'ev') {
            evTypes.style.display = 'flex';
            fuelTypes.style.display = 'none';
        } else {
            evTypes.style.display = 'none';
            fuelTypes.style.display = 'flex';
        }

        // Clear existing markers
        if (this.markerManager) {
            this.markerManager.clearMarkers();
        }

        // If there's an active route, refresh the stations
        const currentRoute = this.directions.getWaypoints();
        if (currentRoute && currentRoute.length >= 2) {
            this.loadingManager.showLoading();

            // Get the current route's coordinates
            const route = this.directions.getRoute();
            if (route) {
                // Determine which API endpoint to use based on new station type
                const endpoint = stationType === 'ev' 
                    ? '/api/ev-stations/route' 
                    : '/api/stations/route';

                // Get coordinates from the current route
                let coordinates = this.decodeGeometry(route.geometry);
                coordinates = this.sampleCoordinates(coordinates, 20);

                // Fetch stations of the new type along the route
                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ coordinates })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                        });
                    }
                    return response.json();
                })
                .then(stations => {
                    // Update markers with new stations
                    this.markerManager.updateMarkers(stations);
                    
                    // Update any UI elements that show station counts or details
                    this.updateStationInfo(stations, stationType);
                })
                .catch(error => {
                    console.error(`Error fetching ${stationType} stations along route:`, error);
                })
                .finally(() => {
                    this.loadingManager.hideLoading();
                });
            }
        }
    }

    // Add this helper method to update UI with station information
    updateStationInfo(stations, stationType) {
        const routeInfo = document.getElementById('route-info');
        if (routeInfo) {
            const count = stations.length;
            const typeLabel = stationType === 'ev' ? 'charging stations' : 'petrol stations';
            
            let infoHTML = `<p>Found ${count} ${typeLabel} along your route.</p>`;
            
            if (stationType === 'ev') {
                const operationalCount = stations.filter(s => s.isOperational).length;
                infoHTML += `<p>${operationalCount} stations currently operational.</p>`;
            }
            
            routeInfo.innerHTML = infoHTML;
        }
    }

    // Update the MarkerManager to handle different station types
    updateMarkerStyle(marker, station) {
        // You can customize marker appearance based on station type
        if (station.connections) { // EV station
            marker.getElement().className += ' ev-marker';
            if (!station.isOperational) {
                marker.getElement().className += ' non-operational';
            }
        } else { // Petrol station
            marker.getElement().className += ' petrol-marker';
        }
    }
} 
