class StationManager {
    constructor() {
        this.petrolStations = [];
        this.evStations = [];
        this.lastRouteGeometry = null;
        this.selectedStationType = 'petrol';
    }

    setStationType(type) {
        this.selectedStationType = type;
    }

    // async fetchAllStations() {
    //     await Promise.all([
    //         // this.fetchPetrolStations(),
    //         this.fetchEvChargingStations()
    //     ]);
    // }

    // async fetchPetrolStations() {
    //     try {
    //         const response = await fetch('/api/stations');
    //         const data = await response.json();
    //         this.petrolStations = data.map(station => ({
    //             ...station,
    //             type: 'petrol'
    //         })) || [];
    //         console.log('Petrol stations data loaded:', this.petrolStations.length);
    //     } catch (error) {
    //         console.error('Error fetching petrol stations:', error);
    //         this.petrolStations = [];
    //     }
    // }

    // async fetchEvChargingStations() {
    //     try {
    //         const response = await fetch('/api/ev-charging-stations');
    //         const data = await response.json();
    //         this.evStations = (data.evStations || []).map(station => ({
    //             ...station,
    //             type: 'ev'
    //         }));
    //         console.log('EV stations loaded:', this.evStations.length);
    //     } catch (error) {
    //         console.error('Error fetching EV charging stations:', error);
    //         this.evStations = [];
    //     }
    // }
} 