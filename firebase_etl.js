require('dotenv').config()
const admin = require('firebase-admin');
var states = require("us-state-codes");
const axios = require('axios');
admin.initializeApp();

const loadFacilities = async (states) => {
    for (state of Object.values(states)) {
        for (facility of state) {
            const {date, state, siteId, siteName, customerId, displayId, displayName, onSiteUserAccountNeeded} = facility;
            const doc = await admin.firestore().collection('facilities').doc(siteId).get();
            console.log('Loading: ', siteName);
            if (!doc.exists) {
                const location = await facilityLocation(siteName, state);

                let county = null, city = null, zip = null;

                try {
                    ({long_name: county} = location.result.address_components.find(c => c.types.includes('administrative_area_level_2') && c.types.includes('political')));
                } catch(err) {
                    console.error(err.toString());
                }
                try { 
                    ({long_name: city}  = location.result.address_components.find(c => c.types.includes('locality') && c.types.includes('political')));
                } catch(err) {
                    console.error(err.toString());
                }
        
                try {
                    ({long_name: zip}  = location.result.address_components.find(c => c.types.includes('postal_code')));
                } catch (err) {
                    console.error(err.toString());
                }

                await admin.firestore().collection('facilities').doc(siteId).set({
                    firstEncountered: date,
                    lastEncountered: date,
                    state: state || null,
                    siteId: siteId || null,
                    siteName: siteName || null,
                    customerId: customerId || null,
                    displayId: displayId || null,
                    displayName: displayName || null,
                    onSiteUserAccountNeeded: onSiteUserAccountNeeded || null,
                    location,
                    location_updated: Date.now(),
                    county,
                    city,
                    zip
                })
            } else {
                await admin.firestore().collection('facilities').doc(siteId).update({
                    lastEncountered: date
                })
            }
        }
    }
}

const facilityLocation = async (siteName, state) => {
    const stateFull = states.getStateNameByStateCode(state);
    const res = (await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURI(siteName + ',' + stateFull)}&key=${process.env.MAPS_API_KEY}`)).data;
    if (res.results.length) {
        const { place_id } = res.results[0];
        const details = (await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.MAPS_API_KEY}`)).data;
        return details;
    }
    return '';
}

const backFill = async() => {
 
}

backFill()

module.exports = {
    loadFacilities
}