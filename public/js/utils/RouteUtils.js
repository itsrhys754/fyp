class RouteUtils {
    static decodePolyline(encoded) {
        try {
            return polyline.decode(encoded);
        } catch (error) {
            console.error('Error decoding polyline:', error);
            return [];
        }
    }

    static validateCoordinates(coordinates) {
        return coordinates?.length >= 2;
    }

    static createRouteBuffer(coordinates) {
        const turfCoordinates = coordinates
            .map(coord => this.convertCoordinate(coord))
            .filter(Boolean);

        const routeLine = turf.lineString(turfCoordinates);
        return turf.buffer(routeLine, 5, { units: 'kilometers' });
    }

    static convertCoordinate(coordinate) {
        return Array.isArray(coordinate) && coordinate.length === 2 
            ? [coordinate[1], coordinate[0]] 
            : null;
    }
} 