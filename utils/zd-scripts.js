require('dotenv').config({ path: '.env'});
const axios = require('axios');

exports.getZdReturnedValues = async (creds,lastEpoch) => {
    return axios.get(`https://uberfliphelp.zendesk.com/api/v2/help_center/incremental/articles?start_time=${lastEpoch || 1420083058}&include=sections,categories`,
    {headers:{"Authorization": `Basic ${creds}`}}
    )
    .catch(err => {
        console.log(err.response);
    })
    .then(result => {
        return result.data;
        // console.log(result);
    })
}

// https://uberfliphelp.zendesk.com/knowledge/user_segments/edit/360000414471?brand_id=360000231531

//https://uberfliphelp.zendesk.com/knowledge/user_segments/edit/360000407891?brand_id=360000231531