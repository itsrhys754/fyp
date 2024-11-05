class FilterManager {
    constructor() {
        this.filters = {
            brand: 'all',
            fuelType: 'all',
            connectionType: 'all'
        };
        this.initializeFilters();
    }

    initializeFilters() {
        // Brand filters
        document.querySelectorAll('.brand-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const brand = e.target.getAttribute('data-brand');
                this.handleFilterClick(e.target, 'brand');
                this.filters.brand = brand;
                console.log('Brand filter updated:', this.filters.brand);
            });
        });

        // Fuel type filters
        document.querySelectorAll('.fuel-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const fuelType = e.target.getAttribute('data-fuel-type');
                this.handleFilterClick(e.target, 'fuelType');
                this.filters.fuelType = fuelType;
                console.log('Fuel type filter updated:', this.filters.fuelType);
            });
        });

        // Connection type filters
        document.querySelectorAll('.connection-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const connectionType = e.target.getAttribute('data-connection-type');
                this.handleFilterClick(e.target, 'connectionType');
                this.filters.connectionType = connectionType;
                console.log('Connection type filter updated:', this.filters.connectionType);
            });
        });
    }

    handleStationTypeChange(event, stationManager, callback) {
        const isEv = event.target.checked;
        const stationType = isEv ? 'ev' : 'petrol';
        
        console.log('Changing station type to:', stationType);
        stationManager.setStationType(stationType);
        this.updateUIForStationType(isEv);
        this.resetFilters();
        
        // Get the current route from Mapbox Directions
        const directionsControl = document.querySelector('.mapboxgl-ctrl-directions');
        if (directionsControl && directionsControl.directions) {
            const currentRoute = directionsControl.directions.getRoute();
            console.log('Current route found:', currentRoute);
            if (currentRoute) {
                // Create a route event object that matches the Mapbox format
                callback({
                    route: [{
                        geometry: currentRoute.geometry,
                        legs: currentRoute.legs,
                        distance: currentRoute.distance,
                        duration: currentRoute.duration
                    }]
                });
                return;
            }
        }
        
        callback();
    }

    updateUIForStationType(isEv) {
        // Update toggle icon visibility
        const petrolIcon = document.querySelector('.petrol-icon');
        const evIcon = document.querySelector('.ev-icon');
        if (petrolIcon && evIcon) {
            petrolIcon.style.opacity = isEv ? '0' : '1';
            evIcon.style.opacity = isEv ? '1' : '0';
        }

        // Update station label
        const stationLabel = document.getElementById('stationLabel');
        if (stationLabel) {
            stationLabel.textContent = isEv ? 'EV Stations' : 'Petrol Stations';
        }

        // Toggle theme class on main container
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.toggle('ev-mode', isEv);
        }

        // Update filter groups visibility
        this.updateFilterVisibility(isEv);
    }

    updateFilterVisibility(isEv) {
        // Brand filters
        const petrolBrands = document.getElementById('petrol-brands');
        const evBrands = document.getElementById('ev-brands');
        if (petrolBrands) petrolBrands.style.display = isEv ? 'none' : 'flex';
        if (evBrands) evBrands.style.display = isEv ? 'flex' : 'none';

        // Type filters
        const petrolTypes = document.getElementById('petrol-types');
        const evTypes = document.getElementById('ev-types');
        if (petrolTypes) petrolTypes.style.display = isEv ? 'none' : 'flex';
        if (evTypes) evTypes.style.display = isEv ? 'flex' : 'none';

        // Update filter group labels
        const typeLabel = document.querySelector('.filter-group label[for="type-filters"]');
        if (typeLabel) {
            typeLabel.textContent = isEv ? 'Connection Type:' : 'Fuel Type:';
        }
    }

    resetFilters() {
        // Reset filter values
        this.filters = {
            brand: 'all',
            fuelType: 'all',
            connectionType: 'all'
        };

        // Reset active states on buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Set 'all' buttons as active
        document.querySelectorAll('[data-brand="all"], [data-fuel-type="all"], [data-connection-type="all"]')
            .forEach(btn => btn.classList.add('active'));
    }
}