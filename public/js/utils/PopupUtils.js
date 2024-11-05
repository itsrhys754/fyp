class PopupUtils {
    static createPopupContent(station) {
        return station.type === 'ev' 
            ? this.createEvPopupContent(station)
            : this.createPetrolPopupContent(station);
    }

    static createPetrolPopupContent(station) {
        const prices = station.prices || {};
        const pricesList = Object.entries(prices)
            .map(([type, price]) => `
                <div class="price-row">
                    <span class="fuel-type">${type}</span>
                    <span class="price">£${price}</span>
                </div>
            `).join('');

        return `
            <div class="popup-content">
                <h3>${station.brand || 'Unknown Brand'}</h3>
                <p>${station.address || 'No address available'}</p>
                <div class="prices-container">
                    ${pricesList || '<p>No prices available</p>'}
                </div>
            </div>
        `;
    }

    static createEvPopupContent(station) {
        const connections = station.connections || [];
        const connectionsList = connections.map(conn => `
            <div class="connection-row ${conn.StatusType?.IsOperational ? 'operational' : 'non-operational'}">
                <span class="connection-type">${conn.ConnectionType?.Title || 'Unknown'}</span>
                <span class="status">${conn.StatusType?.IsOperational ? 'Available' : 'Unavailable'}</span>
                ${conn.PowerKW ? `<span class="power">${conn.PowerKW}kW</span>` : ''}
            </div>
        `).join('');

        return `
            <div class="popup-content">
                <h3>${station.brand || 'Unknown Brand'}</h3>
                <p>${station.address || 'No address available'}</p>
                <div class="connections-container">
                    ${connectionsList || '<p>No connection information available</p>'}
                </div>
            </div>
        `;
    }
} 