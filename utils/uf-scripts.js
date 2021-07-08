require('dotenv').config({ path: '.env'});
const axios = require('axios');

exports.auth = async () => {
    return await axios.post('https://v2.api.uberflip.com/authorize',{
        grant_type: "client_credentials",
        client_id: process.env.UF_KEY,
        client_secret: process.env.UF_SEC
    })
    .then(res => {
        token = res.data.access_token;
        return token;
        // console.log(`response in function = ${token}`);
    })
    .catch(err => {
        console.log(err.response);
        console.log('error in getting token')
    })
};

exports.makeStream = async (token, stream) => {
    // post https://v2.api.uberflip.com/streams
    var body = {
        "hub_id": process.env.UF_HUB,
        "title": stream.name,
        "description": stream.description,
        "service": "blogpost",
        "no_robots": true,
        "template_data": {
            "list_view": false,
            "read_more": true,
            "prevent_small_images": true,
            "canonical_meta": true,
            "canonical_redirect": true,
            "comments_disabled": true
        },
        "hidden": true,
        "paused": true,
        "exclude_from_search": true,
        "created_at": stream.created_at,
        "modified_at": stream.modified_at,
        "authentication": true
    }
    
    return axios.post('https://v2.api.uberflip.com/streams',body,{
        headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": "Zendesk-Uberflip Integration Script",
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        const data = res.data;
        // console.log(data);
        // take original body and new UF stream data, make a mongo doc
        const dbStream = {
            uf_stream: data.id,
            id: stream.id,
            category_id: stream.category_id,
            outdated: stream.outdated
        }
        // console.log(dbStream);
        return dbStream;
    })
    .catch(err => {
        console.log(err.response);
        console.log(`error in making a stream`);
    })
};

exports.updateStream = async (token, stream) => {
    // patch https://v2.api.uberflip.com/streams/streamId
    return axios.patch(`https://v2.api.uberflip.com/streams/${stream.uf_stream}`,{
        // body
        "hub_id": process.env.UF_HUB,
        "title": stream.name,
        "description": stream.description,
        "service": "blogpost",
        "no_robots": true,
        "template_data": {
            "list_view": false,
            "read_more": true,
            "prevent_small_images": true,
            "canonical_meta": true,
            "canonical_redirect": true,
            "comments_disabled": true
        },
        "hidden": true,
        "paused": true,
        "exclude_from_search": true,
        "created_at": stream.created_at,
        "modified_at": stream.modified_at,
    },{
        headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": "Zendesk-Uberflip Integration Script",
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        const data = res.data;
        
        const dbStream = {
            uf_stream: data.id,
            id: stream.id,
            category_id: stream.category_id,
            outdated: stream.outdated
        }
        // console.log(dbStream);
        return dbStream;
    })
    .catch(err => {
        console.log(err.response);
        console.log(`error in updating a stream`);
    })
};

exports.makeItem = async (token, item) => {
    // post https://v2.api.uberflip.com/items
    let desc = item.body;
    desc = desc.substring(0, 200) + "...";
    desc = desc.replace(/(\r\n|\n|\r)/gm, "").replace(/(<([^>]+)>)/gi, "");
    return axios.post('https://v2.api.uberflip.com/items',
    {
        // body
            "hub_id": process.env.UF_HUB,
            "stream": {"id": item.uf_stream},
            "title": item.title,
            "decsription": desc,
            "content": item.body,
            "seo_title": item.name,
            "thumbnail_url": "https://content.cdntwrk.com/files/aHViPTEyMjk0NSZjbWQ9aXRlbWVkaXRvcmltYWdlJmZpbGVuYW1lPWl0ZW1lZGl0b3JpbWFnZV82MGU1ZmYyNjJiN2FmLnBuZyZ2ZXJzaW9uPTAwMDAmc2lnPWNiMzBlMTRmOWEzMGFhZmI0N2E1NjI0NTFmZjI2YTc4",
            "published_at": item.created_at,
            "hidden": false,
            "canonical_url": item.html_url,
            "canonical_redirect": true
    },{
        headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": "Zendesk-Uberflip Integration Script",
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        const data = res.data;
        
        const pubData = {
            itemId: data.id,
            published_at: data.published_at
        }
        publishItem(token,pubData);
        // console.log(data);
        const dbItem = {
            uf_stream: item.uf_stream,
            uf_item: data.id,
            id: item.id,
            draft: item.draft,
            section_id: item.section_id
        };
        return dbItem;
    })
    .catch(err => {
        console.log(err);
        console.log(`error in making an item`);
    })
};

exports.updateItem = async (token, item) => {
    // PATCH https://v2.api.uberflip.com/items/{itemId}
    let desc = item.body;
    desc = desc.substring(0, 200) + "...";
    desc = desc.replace(/(\r\n|\n|\r)/gm, "").replace(/(<([^>]+)>)/gi, "");
    const body = {
        "hub_id": process.env.UF_HUB,
        "title": item.title,
        "description": desc,
        "content": item.body,
        "seo_title": item.name,
        "thumbnail_url": "https://content.cdntwrk.com/files/aHViPTEyMjk0NSZjbWQ9aXRlbWVkaXRvcmltYWdlJmZpbGVuYW1lPWl0ZW1lZGl0b3JpbWFnZV82MGU1ZmYyNjJiN2FmLnBuZyZ2ZXJzaW9uPTAwMDAmc2lnPWNiMzBlMTRmOWEzMGFhZmI0N2E1NjI0NTFmZjI2YTc4",
        "published_at": item.created_at,
        "hidden": item.outdated,
        "canonical_url": item.html_url,
        "canonical_redirect": true
    }
    // console.log(body);
    return axios.patch(`https://v2.api.uberflip.com/items/${item.uf_item}`,
    {
        "hub_id": process.env.UF_HUB,
        "title": item.title,
        // "content": item.body,
        "description": desc,
        "seo_title": item.name,
        "thumbnail_url": "https://theme.zdassets.com/theme_assets/2238007/a1a20ad59a39a54539cb3471e319ebb37c9eefe9.png",
        "published_at": item.created_at,
        "hidden": item.outdated,
        "canonical_url": item.html_url,
        "canonical_redirect": true   
    }
    ,{
        headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": "Zendesk-Uberflip Integration Script",
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        const data = res.data;
        
        const pubData = {
            itemId: data.id,
            published_at: data.published_at
        };
        publishItem(token,pubData);
        
        const dbItem = {
            uf_stream: item.uf_stream,
            uf_item: data.id,
            id: item.id,
            draft: item.draft,
            section_id: item.section_id
        };
        return dbItem;
    })
    .catch(err => {
        console.log(err.response);
        console.log(`error in updating an item`);
        console.log(item);
    })
};

const publishItem = async (token, item) => {
    axios.post(`https://v2.api.uberflip.com/items/${item.itemId}/publish`,{
        // body
            "published_at": item.published_at,
    },{
        headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": "Zendesk-Uberflip Integration Script",
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        const data = res.data;
        // console.log('item published');
    })
    .catch(err => {
        console.log(err.response);
        console.log(`error in publishing an item`);
    })
}