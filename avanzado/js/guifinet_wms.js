function GWMSTileLayer() {
	this.opacity = 1.0;
}

GWMSTileLayer.prototype.MAGIC_NUMBER = 6356752.3142;
GWMSTileLayer.prototype.WGS84_SEMI_MAJOR_AXIS = 6378137.0;
GWMSTileLayer.prototype.WGS84_ECCENTRICITY = 0.0818191913108718138;

GWMSTileLayer.prototype.dd2MercMetersLng = function(longitude) { 
	return this.WGS84_SEMI_MAJOR_AXIS * (longitude * Math.PI / 180.0);
};

GWMSTileLayer.prototype.dd2MercMetersLat = function(latitude) {
	var rads = latitude * Math.PI / 180.0;
	return this.WGS84_SEMI_MAJOR_AXIS * Math.log(
		Math.tan((rads+Math.PI/2)/2) * 
		Math.pow(((1-this.WGS84_ECCENTRICITY*Math.sin(rads))/(1+this.WGS84_ECCENTRICITY*Math.sin(rads))), this.WGS84_ECCENTRICITY/2));
};

GWMSTileLayer.prototype.isPng = function() {
	return this.format == "image/png";
};

GWMSTileLayer.prototype.getOpacity = function() {
	return this.opacity;
};

function loadWMS(map) {
	var tileWidth = 256;
	var tileHeight = 256;

	var basemapOptions = 
	{
	  getTileUrl: function(point, zoom) 
	  {

		var mercZoomLevel = 0;
		var layers = "Nodes,Links";
		var format = "image/png";
		var url = "http://guifi.net/cgi-bin/mapserv?map=/home/guifi/maps.guifi.net/guifimaps/GMap.map";
		var proj = map.getProjection();
		var tileSize = 256;
		var layer = new GWMSTileLayer();
            	var zfactor=Math.pow(2,zoom);

		var upperLeftPoint = new google.maps.Point(point.x * tileSize/zfactor, (point.y+1) * tileSize/zfactor);
		var lowerRightPoint = new google.maps.Point((point.x+1) * tileSize/zfactor, point.y * tileSize/zfactor);
		var upperLeft = proj.fromPointToLatLng(upperLeftPoint, zoom);
		var lowerRight = proj.fromPointToLatLng(lowerRightPoint, zoom);
    		var srs = "EPSG:4326";
	
		if (mercZoomLevel != 0 && zoom < mercZoomLevel) {
			var boundBox = layer.dd2MercMetersLng(upperLeft.lng()) + "," + 
			       	layer.dd2MercMetersLat(upperLeft.lat()) + "," +
			       	layer.dd2MercMetersLng(lowerRight.lng()) + "," + 
			       	layer.dd2MercMetersLat(lowerRight.lat());
		} else {
    			var boundBox = upperLeft.lng() + "," + upperLeft.lat() + "," + lowerRight.lng() + "," + lowerRight.lat();
		}
		url += "&REQUEST=GetMap";
		url += "&SERVICE=WMS";
		url += "&VERSION=1.1.1";
		if (layers) url += "&LAYERS=" + layers;
		url += "&FORMAT=" + format;
		url += "&BGCOLOR=0xFFFFFF";
		url += "&TRANSPARENT=TRUE";
		url += "&SRS=" + srs;
		url += "&BBOX=" + boundBox;
		url += "&WIDTH=" + tileWidth;
		url += "&HEIGHT=" + tileHeight;
		return url;
	  },
	  
	  tileSize: new google.maps.Size(tileHeight, tileWidth),
 
	  minZoom: 2,
	  maxZoom: 24,
	  
	  name: "guifi.net",
	  alt: "guifi.net WMS Image Layer",
  
	  isPng: true
	
	}
	
	var basemapWMS = new google.maps.ImageMapType(basemapOptions);
	map.overlayMapTypes.push(null); // create empty overlay entry
	map.overlayMapTypes.setAt("0",basemapWMS); // set the overlay, 0 index
}
