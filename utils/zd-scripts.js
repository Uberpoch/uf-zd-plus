require('dotenv').config({ path: '.env'});
const axios = require('axios');

exports.getZdReturnedValues = async (creds,lastEpoch) => {
    return axios.get(`https://uberfliphelp.zendesk.com/api/v2/help_center/incremental/articles?start_time=${lastEpoch}&include=sections,categories`,
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

