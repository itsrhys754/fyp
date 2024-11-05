class LoadingManager {
    constructor() {
        this.isLoading = false;
        this.loadingCount = 0;
    }

    showLoading() {
        this.loadingCount++;
        if (this.isLoading) return;
        
        console.log('Showing loading overlay');
        this.isLoading = true;
        
        let loadingElement = document.getElementById('loading-overlay');
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'loading-overlay';
            loadingElement.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading stations...</div>
                </div>
            `;
            
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.appendChild(loadingElement);
            } else {
                console.error('Map container not found!');
                return;
            }
        }
        
        loadingElement.style.display = 'flex';
    }

    hideLoading() {
        this.loadingCount--;
        if (this.loadingCount > 0) return;
        
        console.log('Hiding loading overlay');
        this.isLoading = false;
        this.loadingCount = 0;
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
} 