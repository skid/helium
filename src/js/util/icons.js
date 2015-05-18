/**  
 * Helium icons utilities.
 * Documented in utils.md.
**/
(function(){
  var icons = he.util.$icons = {
    'cloud-download': "M77.6 40c-2.8-13.6-14.8-24-29.6-24-11.6 0-21.6 6.4-26.4 16-12.4 1.6-21.6 11.6-21.6 24 0 13.2 10.8 24 24 24h52c11.2 0 20-8.8 20-20 0-10.4-8.4-19.2-18.4-20zM68 52l-20 20-20-20h12v-16h16v16h12z",
    'access-alarms': "M88 22.8l-18.4-15.6-5.2 6 18.4 15.6 5.2-6zM31.6 13.6l-5.2-6-18.4 15.2 5.2 6 18.4-15.2zM50 32h-6v24l18.8 11.6 3.2-4.8-16-9.6v-21.2zM48 16c-20 0-36 16-36 36s16 36 36 36c20 0 36-16 36-36s-16-36-36-36zM48 80c-15.6 0-28-12.4-28-28s12.4-28 28-28 28 12.4 28 28c0 15.6-12.4 28-28 28z",
    'access-time': "M48 8c-22 0-40 18-40 40s18 40 40 40c22 0 40-18 40-40s-18-40-40-40zM48 80c-17.6 0-32-14.4-32-32s14.4-32 32-32c17.6 0 32 14.4 32 32s-14.4 32-32 32z M50 28h-6v24l20.8 12.8 3.2-5.2-18-10.8z",
    'check': "M36 64.8l-16.8-16.8-5.6 5.6 22.4 22.4 48-48-5.6-5.6z",
    'check-box-blank': "M76 20v56h-56v-56h56zM76 12h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8v0z",
    'check-box': "M76 12h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM40 68l-20-20 5.6-5.6 14.4 14.4 30.4-30.4 5.6 5.6-36 36z",
    'check-box-outline-blank': "M76 20v56h-56v-56h56zM76 12h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8v0z",
    'check-box-outline': "M31.6 40.4l-5.6 5.6 18 18 40-40-5.6-5.6-34.4 34.4-12.4-12.4zM76 76h-56v-56h40v-8h-40c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-32h-8v32z",
    'check-circle': "M48 8c-22 0-40 18-40 40s18 40 40 40c22 0 40-18 40-40s-18-40-40-40zM40 68l-20-20 5.6-5.6 14.4 14.4 30.4-30.4 5.6 5.6-36 36z",
    'check-circle-blank': "M48 8c-22 0-40 18-40 40s18 40 40 40c22 0 40-18 40-40s-18-40-40-40z",
    'check-circle-outline-blank': "M48 8c-22 0-40 18-40 40s18 40 40 40c22 0 40-18 40-40s-18-40-40-40zM48 80c-17.6 0-32-14.4-32-32s14.4-32 32-32c17.6 0 32 14.4 32 32s-14.4 32-32 32z",
    'filter': { path: "M3,2H21V2H21V4H20.92L14,10.92V22.91L10,18.91V10.91L3.09,4H3V2Z", viewBox: '-2 -4 28 28' },
    'error': "M48 8c-22 0-40 18-40 40s18 40 40 40c22 0 40-18 40-40s-18-40-40-40zM68 62.4l-5.6 5.6-14.4-14.4-14.4 14.4-5.6-5.6 14.4-14.4-14.4-14.4 5.6-5.6 14.4 14.4 14.4-14.4 5.6 5.6-14.4 14.4 14.4 14.4z",
    'find': "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",
    'empty': "",
    
    
    'minus': { path: "M19,13H5V11H19V13Z", viewBox: "0 -2 24 24" },
    
    'edit': { path: "M20.71,4.04C21.1,3.65 21.1,3 20.71,2.63L18.37,0.29C18,-0.1 17.35,-0.1 16.96,0.29L15,2.25L18.75,6M17.75,7L14,3.25L4,13.25V17H7.75L17.75,7Z", viewBox: "0 -2 24 24" },
    'alphabetical': { path: "M6,11A2,2 0 0,1 8,13V17H4A2,2 0 0,1 2,15V13A2,2 0 0,1 4,11H6M4,13V15H6V13H4M20,13V15H22V17H20A2,2 0 0,1 18,15V13A2,2 0 0,1 20,11H22V13H20M12,7V11H14A2,2 0 0,1 16,13V15A2,2 0 0,1 14,17H12A2,2 0 0,1 10,15V7H12M12,15H14V13H12V15Z", viewBox: '0 0 24 24' },
    'close': { path: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", viewBox: '0 0 24 24' },
    'settings': { path: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z", viewBox: "0 0 24 24" },
    
    'chevron-left': { path: "M61.6 29.6l-5.6-5.6-24 24 24 24 5.6-5.6-18.4-18.4z", viewBox: '0 -8 96 96' },
    'chevron-right': { path: "M40 24l-5.6 5.6 18.4 18.4-18.4 18.4 5.6 5.6 24-24z", viewBox: '0 -8 96 96' },
    'chevron-down': { path: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z", viewBox: '2 0 20 20' },
    'chevron-up': { path: "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z", viewBox: '2 0 20 20' },

    'menu-right': { path: "M10,17L15,12L10,7V17Z", viewBox: "3 2 18 18" },
    'menu-left': { path: "M14,7L9,12L14,17V7Z", viewBox: "3 2 18 18" },
    'menu-down': { path: "M7,10L12,15L17,10H7Z", viewBox: "3 2 18 18" },
    'menu-up': { path: "M7,15L12,10L17,15H7Z", viewBox: "3 2 18 18" }
  };

  /**  
   * Returns valid HTML or a SVG Element containing an icon
   * that has been defined in Helium.
   *  
   * @module util 
   * @mehtod iconHTML
   * @param {String} name The name of the icon.
   * @param {Boolean} [asNode] If `true`, the function will return an SVG element instead of a string. 
   * @param {String} [fill] The fill of the icon. This is used internally, as the fill can be defined through css. 
   * @return {Mixed} Depending on the `isNode` argument, returns a string or an SVG element.
  **/
  he.util.iconHTML = function iconHTML(name, asNode, fill){
    var icon = icons[name];
    if(_.isPlainObject(icon)) {
      var viewBox = icon.viewBox;
      var path = icon.path;
    }
    else {
      viewBox = "0 0 96 96";
      path = icon;
    }
    var html = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='" + viewBox + "'><path d='" + path + "'" + (fill ? " fill='" + fill + "'" : "") + "></path></svg>";

    if(asNode){
      var div = document.createElement('div');
      div.innerHTML = html;
      return div.childNodes[0];
    }
    return html;
  }

  /**  
   * Returns a data-url that will translate to a SVG icon.
   *  
   * @module util 
   * @method iconBackground
   * @param {String} name The name of the icon.
   * @param {String} [fill] The fill color of the icon.
   * @return {String} The data-url containing the icon image.
  **/
  he.util.iconBackground = function iconBackground(name, fill){
    return "url('data:image/svg+xml;base64," + btoa(this.iconHTML(name, false, fill)) + "')";
  }  
})();
