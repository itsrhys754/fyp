class MarkerUtils {
    static createCustomMarkerElement(station) {
        const markerDiv = document.createElement('div');
        markerDiv.className = 'custom-marker marker-small';
        markerDiv.innerHTML = this.getMarkerContent(station);
        return markerDiv;
    }

    static getMarkerContent(station) {
        return `
            <div class="marker-content ${station.type}-marker">
                ${this.getBrandLogo(station)}
                ${this.getPriceContent(station)}
            </div>
        `;
    }

    static getBrandLogo(station) {
        if (!station.brand) return '';
        
        const brandLower = station.brand.toLowerCase().replace(/\s+/g, '');
        return `<img src="/images/brands/${brandLower}.png" 
                    alt="${station.brand}" 
                    onerror="this.src='/images/brands/default.png'"
                    class="brand-logo">`;
    }

    static getPriceContent(station) {
        if (station.type === 'ev') {
            return this.getEvStationContent(station);
        }
        return this.getPetrolStationContent(station);
    }

    static getPetrolStationContent(station) {
        if (!station.prices && !station.E5 && !station.E10 && !station.B7) {
            return '<div class="no-price">No prices available</div>';
        }

        // Handle both data structures (prices object or direct properties)
        const prices = station.prices || {
            E5: station.E5,
            E10: station.E10,
            B7: station.B7
        };

        const priceElements = [];
        
        // Add each available price
        if (prices.E5) priceElements.push(`<span class="small-price">E5: £${prices.E5}</span>`);
        if (prices.E10) priceElements.push(`<span class="small-price">E10: £${prices.E10}</span>`);
        if (prices.B7) priceElements.push(`<span class="small-price">B7: £${prices.B7}</span>`);

        if (priceElements.length === 0) {
            return '<div class="no-price">No prices available</div>';
        }

        return `<div class="horizontal-prices">${priceElements.join('')}</div>`;
    }

    static getEvStationContent(station) {
        if (!station.connections || station.connections.length === 0) {
            return '<div class="no-connections">No connections</div>';
        }

        const isOperational = this.isAnyConnectionOperational(station.connections);
        const statusClass = isOperational ? 'operational' : 'non-operational';
        
        return `<div class="connection-status ${statusClass}">
                    ${isOperational ? '✓' : '✗'}
                </div>`;
    }

    static isAnyConnectionOperational(connections) {
        if (!connections || !Array.isArray(connections)) return false;
        return connections.some(conn => conn.StatusType?.IsOperational);
    }
} 