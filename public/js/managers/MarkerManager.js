class MarkerManager {
    constructor(map) {
        this.markers = [];
        this.map = map;
        this.selectedFuelType = 'all';
    }

    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }

    setSelectedFuelType(fuelType) {
        this.selectedFuelType = fuelType;
    }

    updateMarkers(stations) {
        this.clearMarkers();

        if (!stations || !Array.isArray(stations)) {
            console.warn('No stations data provided to updateMarkers');
            return;
        }

        console.log('Updating markers with stations:', stations);

        stations.forEach(station => {
            if (!station.latitude || !station.longitude) {
                console.warn('Station missing coordinates:', station);
                return;
            }

            const markerElement = MarkerUtils.createCustomMarkerElement(station);
            
            const marker = new mapboxgl.Marker({
                element: markerElement,
                anchor: 'bottom'
            })
                .setLngLat([station.longitude, station.latitude])
                .setPopup(new mapboxgl.Popup({
                    offset: 25,
                    closeButton: false
                }).setHTML(PopupUtils.createPopupContent(station)))
                .addTo(this.map);

            this.markers.push(marker);
        });

        // After adding all markers, update their appearance based on prices/status
        if (stations[0]?.type === 'petrol' && this.selectedFuelType !== 'all') {
            this.updateMarkersAppearance(stations);
        }
    }

    updateMarkersAppearance(stations) {
        if (this.selectedFuelType === 'all') return;

        // Find the cheapest price for the selected fuel type
        const prices = stations
            .map(station => station.prices?.[this.selectedFuelType])
            .filter(price => price);
        
        if (prices.length === 0) return;

        const cheapestPrice = Math.min(...prices);

        // Update marker appearances
        this.markers.forEach((marker, index) => {
            const station = stations[index];
            const price = station.prices?.[this.selectedFuelType];
            const markerElement = marker.getElement();
            
            // Find the price element within the marker
            const priceElement = markerElement.querySelector(`.small-price[data-fuel-type="${this.selectedFuelType}"]`);
            
            if (priceElement) {
                priceElement.classList.toggle('cheapest', price === cheapestPrice);
                priceElement.classList.add('selected');
            }
        });
    }
} 